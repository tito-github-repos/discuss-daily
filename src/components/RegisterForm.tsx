'use client';

import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Turnstile } from '@marsidev/react-turnstile';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { countries, DEFAULT_COUNTRY } from '@/lib/countries';
import {
  validateField,
  validateRegistration,
  type RegisterErrors,
  type RegisterField,
} from '@/lib/validation';


type Status = 'idle' | 'submitting' | 'success' | 'error';

const emptyValues = {
  name: '',
  email: '',
  phone: '',
  country: DEFAULT_COUNTRY,
  website: '', // honeypot
};

// Shared input styling: soft fill, rounded, green focus ring
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
  // Keep the soft background when the browser autofills
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
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const turnstileRef = useRef<TurnstileInstance>(null);

  const handleChange =
    (field: RegisterField | 'website') => (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      if (field === 'phone') value = value.replace(/\D/g, '').slice(0, 15); // max 15 digits (E.164)
      setValues((prev) => ({ ...prev, [field]: value }));
      if (field !== 'website' && errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const country = e.target.value;
    setValues((prev) => ({ ...prev, country }));
    // Re-check the number against the newly selected country
    if (values.phone) {
      setErrors((prev) => ({ ...prev, phone: validateField('phone', values.phone, country) }));
    }
  };

  const handleBlur = (field: RegisterField) => () => {
    const msg = validateField(field, values[field], values.country);
    setErrors((prev) => ({ ...prev, [field]: msg }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');

    const result = validateRegistration(values);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
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

      if (res.ok) {
        setStatus('success');
        setValues(emptyValues);
        setErrors({});
      } else {
        if (data.errors) setErrors(data.errors);
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

  if (status === 'success') {
    return (
      <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', py: 4 }}>
        <Box
          sx={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            bgcolor: 'rgba(22, 163, 74, 0.12)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 56, color: 'var(--primary)' }} />
        </Box>
        <Typography sx={{ fontSize: '1.4rem', fontWeight: 700 }}>You’re registered!</Typography>
        <Typography sx={{ color: 'text.secondary', maxWidth: 320, lineHeight: 1.7 }}>
          Thank you for joining Discuss Daily. We will get in touch with you soon.
        </Typography>
      </Stack>
    );
  }

  const submitting = status === 'submitting';

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2.5}>
        <TextField
          label="Full name"
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={handleChange('name')}
          onBlur={handleBlur('name')}
          error={Boolean(errors.name)}
          helperText={errors.name}
          disabled={submitting}
          slotProps={{
            input: { startAdornment: iconAdornment(PersonOutlinedIcon) },
            htmlInput: { maxLength: 60 },
          }}
          sx={fieldSx}
          required
          fullWidth
        />

        <TextField
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange('email')}
          onBlur={handleBlur('email')}
          error={Boolean(errors.email)}
          helperText={errors.email}
          disabled={submitting}
          slotProps={{
            input: { startAdornment: iconAdornment(EmailOutlinedIcon) },
            htmlInput: { maxLength: 254 },
          }}
          sx={fieldSx}
          required
          fullWidth
        />

        {/* Country + mobile number */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <TextField
            select
            label="Country"
            value={values.country}
            onChange={handleCountryChange}
            disabled={submitting}
            sx={{ ...fieldSx, width: 140, flexShrink: 0 }}
            slotProps={{
              select: {
                renderValue: (v) => {
                  const c = countries.find((x) => x.code === v);
                  return c ? `${c.code} +${c.dial}` : String(v);
                },
                MenuProps: { slotProps: { paper: { sx: { maxHeight: 320 } } } },
              },
            }}
          >
            {countries.map((c) => (
              <MenuItem key={c.code} value={c.code}>
                {c.name} (+{c.dial})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Mobile number"
            name="phone"
            type="tel"
            autoComplete="tel-national"
            value={values.phone}
            onChange={handleChange('phone')}
            onBlur={handleBlur('phone')}
            error={Boolean(errors.phone)}
            helperText={errors.phone || 'Without the country code'}
            disabled={submitting}
            slotProps={{
              input: { startAdornment: iconAdornment(PhoneIphoneIcon) },
              htmlInput: { inputMode: 'numeric', maxLength: 15 },
            }}
            sx={fieldSx}
            required
            fullWidth
          />
        </Stack>

        {/* Honeypot: hidden from humans and screen readers, bots tend to fill it */}
        <Box
          aria-hidden="true"
          sx={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}
        >
          <label htmlFor="website">Leave this field empty</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={handleChange('website')}
          />
        </Box>

        {/* Cloudflare Turnstile */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            options={{ theme: 'light' }}
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
  );
}