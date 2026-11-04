'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Turnstile } from '@marsidev/react-turnstile';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { registerSchema, type RegisterInput } from '@/lib/validation';
import { startPayment } from '@/lib/pay-client';
import { useAuth } from '@/components/AuthProvider';
import RegistrationDialog, {
  type PayState,
  type RegisterResult,
} from '@/components/RegistrationDialog';

type Status = 'idle' | 'submitting' | 'error';

const emptyValues: RegisterInput = { name: '', email: '', phone: '', website: '' };

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
  '& input:-webkit-autofill': {
    WebkitBoxShadow: '0 0 0 100px #f8faf9 inset',
    WebkitTextFillColor: 'inherit',
    borderRadius: '14px',
  },
};

const iconAdornment = (Icon: React.ElementType) => (
  <InputAdornment position="start">
    <Icon sx={{ color: 'var(--primary)', fontSize: 22 }} />
  </InputAdornment>
);

export default function RegisterForm() {
  const router = useRouter();
  const { user, refresh, openLogin, logout } = useAuth();

  const { control, register, handleSubmit, reset, setError } = useForm<RegisterInput>({
    resolver: yupResolver(registerSchema),
    mode: 'onChange', // validate on every change
    defaultValues: emptyValues,
  });

  const [token, setToken] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<RegisterResult | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payState, setPayState] = useState<PayState>('idle');
  const [paidExpiry, setPaidExpiry] = useState<string | null>(null);
  const [payError, setPayError] = useState('');
  const turnstileRef = useRef<TurnstileInstance>(null);

  const onSubmit = async (values: RegisterInput) => {
    setMessage('');
    if (!token) {
      setStatus('error');
      setMessage('Please complete the security check.');
      return;
    }

    setStatus('submitting');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, turnstileToken: token }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.case) {
        setResult(data as RegisterResult);
        setPayState('idle');
        setPayError('');
        setDialogOpen(true);
        setStatus('idle');

        // Keep the typed details when the user has to logout first,
        // so they can submit again without retyping
        if (data.case !== 'OTHER_ACCOUNT' && data.case !== 'LOGGED_IN_NEW') {
          reset(emptyValues);
        }

        // A new user is logged in by the server: update the header
        if (data.case === 'NEW') refresh();
      } else {
        if (data.errors) {
          (Object.keys(data.errors) as Array<keyof RegisterInput>).forEach((field) =>
            setError(field, { type: 'server', message: data.errors[field] })
          );
        }
        setStatus('error');
        setMessage(data.error || 'Registration failed. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      // Turnstile tokens are single-use
      setToken('');
      turnstileRef.current?.reset();
    }
  };

  const handlePay = () => {
    setPaying(true);
    setPayState('idle');
    setPayError('');
    startPayment({
      onSuccess: (expiry) => {
        setPaidExpiry(expiry);
        setPayState('success');
        refresh();
      },
      onFailed: (text) => {
        setPayError(text);
        setPayState('failed');
      },
      onDone: () => setPaying(false),
    });
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setPayState('idle');
    setPayError('');
    setPaidExpiry(null);
  };

  const handleLogin = () => {
    handleCloseDialog();
    openLogin();
  };

  const handleGoMembership = () => {
    handleCloseDialog();
    router.push('/membership');
  };

  const handleLogout = async () => {
    const wasOtherAccount = result?.case === 'OTHER_ACCOUNT';
    handleCloseDialog();
    await logout();
    // The details belong to another account: take the user straight to login
    if (wasOtherAccount) openLogin();
  };

  const submitting = status === 'submitting';

  return (
    <>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2.5}>
          {user && (
            <Alert severity="info" sx={{ borderRadius: '12px' }}>
              You’re logged in as {user.name}.
            </Alert>
          )}

          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Full name"
                autoComplete="name"
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                disabled={submitting}
                slotProps={{
                  input: { startAdornment: iconAdornment(PersonOutlinedIcon) },
                  htmlInput: { maxLength: 60 },
                }}
                sx={fieldSx}
                required
                fullWidth
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Email address"
                type="email"
                autoComplete="email"
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                disabled={submitting}
                slotProps={{
                  input: { startAdornment: iconAdornment(EmailOutlinedIcon) },
                  htmlInput: { maxLength: 254 },
                }}
                sx={fieldSx}
                required
                fullWidth
              />
            )}
          />

          <Controller
            name="phone"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                // Only digits, max 10
                onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
                label="Mobile number"
                type="tel"
                autoComplete="tel-national"
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                disabled={submitting}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIphoneIcon sx={{ color: 'var(--primary)', fontSize: 22, mr: 1 }} />
                        <Typography sx={{ color: 'text.primary', fontWeight: 500 }}>+91</Typography>
                      </InputAdornment>
                    ),
                  },
                  htmlInput: { inputMode: 'numeric', maxLength: 10 },
                }}
                sx={fieldSx}
                required
                fullWidth
              />
            )}
          />

          {/* Honeypot: hidden from humans and screen readers, bots tend to fill it */}
          <Box
            aria-hidden="true"
            sx={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}
          >
            <label htmlFor="website">Leave this field empty</label>
            <input
              id="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              {...register('website')}
            />
          </Box>

          {/* Cloudflare Turnstile (always visible) */}
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

          {status === 'error' && message && (
            <Alert severity="error" sx={{ borderRadius: '12px' }}>
              {message}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting}
            endIcon={!submitting && <ArrowForwardIcon />}
            sx={{
              background: 'linear-gradient(90deg, var(--primary), #22c55e)',
              borderRadius: '14px',
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 8px 20px rgba(22, 163, 74, 0.35)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 26px rgba(22, 163, 74, 0.45)',
              },
              '&.Mui-disabled': { color: 'var(--white)', opacity: 0.7 },
            }}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Register'}
          </Button>

          <Stack
            direction="row"
            spacing={0.75}
            sx={{ justifyContent: 'center', alignItems: 'center', color: 'text.secondary' }}
          >
            <LockOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontSize: '0.8rem' }}>
              Your details are safe and used only to contact you.
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <RegistrationDialog
        open={dialogOpen}
        result={result}
        paying={paying}
        payState={payState}
        paidExpiry={paidExpiry}
        payError={payError}
        onPay={handlePay}
        onLogin={handleLogin}
        onGoMembership={handleGoMembership}
        onLogout={handleLogout}
        onClose={handleCloseDialog}
      />
    </>
  );
}