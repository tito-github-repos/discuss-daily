'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Turnstile } from '@marsidev/react-turnstile';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { loginEmailSchema, type LoginEmailInput } from '@/lib/validation';
import { useAuth } from '@/components/AuthProvider';

type Step = 'email' | 'code';
type Status = 'idle' | 'sending' | 'verifying';

const RESEND_SECONDS = 60;

// Codes from verify-otp that mean the current code can no longer work
const DEAD_CODE_ERRORS = ['TOO_MANY_ATTEMPTS', 'EXPIRED', 'REQUEST_NEW'];

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    bgcolor: '#f8faf9',
    transition: 'box-shadow 0.2s, background-color 0.2s',
    '& fieldset': { borderColor: '#e2e8e4' },
    '&:hover fieldset': { borderColor: 'var(--primary)' },
    '&.Mui-focused': {
      bgcolor: 'var(--white)',
      boxShadow: '0 0 0 4px rgba(22, 163, 74, 0.15)',
    },
    '&.Mui-focused fieldset': { borderColor: 'var(--primary)', borderWidth: 1.5 },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: 'var(--primary)' },
  '& .MuiFormHelperText-root': { ml: 0.5 },
};

const buttonSx = {
  background: 'linear-gradient(90deg, var(--primary), #22c55e)',
  borderRadius: '14px',
  py: 1.4,
  fontWeight: 600,
  boxShadow: '0 8px 20px rgba(22, 163, 74, 0.35)',
  '&.Mui-disabled': { color: 'var(--white)', opacity: 0.7 },
};

const normalize = (v: string) => v.trim().toLowerCase();

export default function LoginDialog() {
  const router = useRouter();
  const { loginOpen, closeLogin, refresh } = useAuth();

  const [step, setStep] = useState<Step>('email');
  const [sentTo, setSentTo] = useState('');
  const [code, setCode] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [codeDead, setCodeDead] = useState(false); // current code is used up or expired: ask for a new one
  const [notRegistered, setNotRegistered] = useState(''); // the email the server said is not registered
  const turnstileRef = useRef<TurnstileInstance>(null);

  const { control, handleSubmit, reset, watch } = useForm<LoginEmailInput>({
    resolver: yupResolver(loginEmailSchema),
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  const emailValue = watch('email') ?? '';
  const isNotRegistered = notRegistered !== '' && normalize(emailValue) === notRegistered;
  // On the email step a running cooldown means the server asked this user to wait
  const waitingEmail = step === 'email' && cooldown > 0;

  // Start fresh every time the dialog opens
  useEffect(() => {
    if (loginOpen) {
      setStep('email');
      setSentTo('');
      setCode('');
      setToken('');
      setStatus('idle');
      setError('');
      setNotice('');
      setCooldown(0);
      setCodeDead(false);
      setNotRegistered('');
      reset({ email: '' });
    }
  }, [loginOpen, reset]);

  // Countdown (Resend on the code step, Send code on the email step)
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const goRegister = () => {
    closeLogin();
    router.push('/#register');
  };

  // Asks the server to send a code. Used by the first send and by Resend.
  // Returns true when the code was sent.
  const requestCode = async (email: string): Promise<boolean> => {
    setError('');
    setNotice('');
    if (!token) {
      setError('Please complete the security check.');
      return false;
    }

    setStatus('sending');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken: token }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const to = normalize(email);
        setSentTo(to);
        setCode('');
        setCodeDead(false);
        setCooldown(RESEND_SECONDS);
        setNotice(`A new code has been sent to ${to}.`);
        return true;
      }

      if (res.status === 404 && data.code === 'NOT_REGISTERED') {
        // New user: no code is sent
        setNotRegistered(normalize(email));
      } else if (
        res.status === 429 &&
        data.code === 'WAIT' &&
        Number.isFinite(data.retryAfterSeconds)
      ) {
        // The server knows the exact wait: start the countdown from it
        setCooldown(Math.max(1, Math.ceil(data.retryAfterSeconds)));
      } else {
        // Includes the hourly limit, whose message already says how many minutes to wait
        setError(data.error || 'Could not send the code. Please try again.');
      }
      return false;
    } catch {
      setError('Network error. Please check your connection and try again.');
      return false;
    } finally {
      // Turnstile tokens are single-use: get a fresh one for the next request
      setToken('');
      turnstileRef.current?.reset();
      setStatus('idle');
    }
  };

  // First send, from the email step
  const sendCode = async ({ email }: LoginEmailInput) => {
    const ok = await requestCode(email);
    if (ok) setStep('code');
  };

  // Resend, from the code step: stays on this step and shows a message
  const resendCode = async () => {
    await requestCode(sentTo);
  };

  const verifyCode = async () => {
    setError('');
    setNotice('');
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code.');
      return;
    }

    setStatus('verifying');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sentTo, code }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        await refresh(); // the header now shows the logged-in user
        closeLogin();
        router.push('/membership');
      } else {
        setError(data.error || 'Invalid or expired code.');
        setCode('');
        // This code can no longer work: the user must ask for a new one
        if (DEAD_CODE_ERRORS.includes(data.code)) setCodeDead(true);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setStatus('idle');
    }
  };

  const busy = status !== 'idle';
  const resending = status === 'sending';

  return (
    <Dialog
      open={loginOpen}
      onClose={busy ? undefined : closeLogin}
      fullWidth
      maxWidth="xs"
      slotProps={{ paper: { sx: { borderRadius: 4 } } }}
    >
      <Box sx={{ height: 6, background: 'linear-gradient(90deg, var(--primary), #4ade80)' }} />

      <IconButton
        aria-label="Close"
        onClick={closeLogin}
        disabled={busy}
        sx={{ position: 'absolute', top: 14, right: 10, color: 'text.secondary' }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
        {step === 'email' ? (
          <Box component="form" onSubmit={handleSubmit(sendCode)} noValidate>
            <Stack spacing={2.5}>
              <Box>
                <Typography component="h2" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  Login
                </Typography>
                <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: '0.95rem' }}>
                  Enter your registered email and we will send you a login code.
                </Typography>
              </Box>

              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Email address"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    error={Boolean(fieldState.error) || isNotRegistered}
                    helperText={fieldState.error?.message}
                    disabled={busy}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlinedIcon sx={{ color: 'var(--primary)', fontSize: 22 }} />
                          </InputAdornment>
                        ),
                      },
                      htmlInput: { maxLength: 254 },
                    }}
                    sx={fieldSx}
                    fullWidth
                  />
                )}
              />

              {/* Visible security check for the first code */}
              <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: 65 }}>
                <Turnstile
                  ref={turnstileRef}
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                  options={{ theme: 'light', size: 'normal', appearance: 'always' }}
                  onSuccess={setToken}
                  onExpire={() => setToken('')}
                  onError={() => setToken('')}
                />
              </Box>

              {isNotRegistered && (
                <Alert
                  severity="warning"
                  sx={{ borderRadius: '12px' }}
                  // action={
                  //   <Button color="inherit" size="small" onClick={goRegister} sx={{ fontWeight: 700 }}>
                  //     Register
                  //   </Button>
                  // }
                >
                  This email is not registered. Please register first.
                </Alert>
              )}

              {waitingEmail && (
                <Alert severity="warning" sx={{ borderRadius: '12px' }}>
                  Please wait {cooldown} {cooldown === 1 ? 'second' : 'seconds'} before asking for
                  another code.
                </Alert>
              )}

              {error && !isNotRegistered && (
                <Alert severity="error" sx={{ borderRadius: '12px' }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={busy || isNotRegistered || waitingEmail}
                endIcon={status !== 'sending' && !waitingEmail && <ArrowForwardIcon />}
                sx={buttonSx}
              >
                {status === 'sending' ? (
                  <CircularProgress size={24} color="inherit" />
                ) : waitingEmail ? (
                  `Send code in ${cooldown}s`
                ) : (
                  'Send code'
                )}
              </Button>

              <Typography sx={{ textAlign: 'center', fontSize: '0.9rem', color: 'text.secondary' }}>
                New here?{' '}
                <Box
                  component="a"
                  href="/#register"
                  onClick={closeLogin}
                  sx={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
                >
                  Register
                </Box>
              </Typography>
            </Stack>
          </Box>
        ) : (
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              verifyCode();
            }}
            noValidate
          >
            <Stack spacing={2.5}>
              <Box>
                <Typography component="h2" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  Enter your code
                </Typography>
                <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: '0.95rem' }}>
                  We have sent a 6-digit code to <b>{sentTo}</b>. It is valid for 10 minutes.
                </Typography>
              </Box>

              <TextField
                label="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                autoComplete="one-time-code"
                autoFocus
                disabled={busy || codeDead}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: 'var(--primary)', fontSize: 22 }} />
                      </InputAdornment>
                    ),
                    sx: { letterSpacing: '0.4em', fontWeight: 600, fontSize: '1.2rem' },
                  },
                  htmlInput: { inputMode: 'numeric', maxLength: 6 },
                }}
                sx={fieldSx}
                fullWidth
              />

              {/* Background security check for Resend: shows only if Cloudflare needs a click */}
              <Turnstile
                ref={turnstileRef}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                options={{ theme: 'light', size: 'normal', appearance: 'interaction-only' }}
                onSuccess={setToken}
                onExpire={() => setToken('')}
                onError={() => setToken('')}
              />

              {notice && (
                <Alert severity="success" sx={{ borderRadius: '12px' }}>
                  {notice}
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ borderRadius: '12px' }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={busy || codeDead}
                sx={buttonSx}
              >
                {status === 'verifying' ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Verify & login'
                )}
              </Button>

              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  size="small"
                  color="inherit"
                  disabled={busy}
                  onClick={() => {
                    setError('');
                    setNotice('');
                    setToken('');
                    setCooldown(0); // a different email has its own limits
                    setCodeDead(false);
                    setStep('email');
                  }}
                  sx={{ color: 'text.secondary' }}
                >
                  Change email
                </Button>

                <Button
                  size="small"
                  disabled={busy || cooldown > 0 || !token}
                  onClick={resendCode}
                  sx={{ color: 'var(--primary)' }}
                >
                  {resending ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : cooldown > 0 ? (
                    `Resend in ${cooldown}s`
                  ) : !token ? (
                    'Please wait...'
                  ) : (
                    'Resend code'
                  )}
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}