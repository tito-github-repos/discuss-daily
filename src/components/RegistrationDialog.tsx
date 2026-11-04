'use client';

import type { ElementType } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Stack,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ErrorIcon from '@mui/icons-material/Error';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import SwitchAccountOutlinedIcon from '@mui/icons-material/SwitchAccountOutlined';

export type RegisterCase =
  | 'NEW'
  | 'EXISTS_PENDING'
  | 'EXISTS_ACTIVE'
  | 'EXISTS_EXPIRED'
  | 'OTHER_ACCOUNT'
  | 'LOGGED_IN_NEW';

export type RegisterResult = {
  case: RegisterCase;
  name?: string;
  expiryDate?: string; // ISO date, sent only to the account owner
  isCurrentUser?: boolean; // true when the matched account is the logged-in user
  loggedInName?: string; // name of the logged-in user (OTHER_ACCOUNT, LOGGED_IN_NEW)
};

export type PayState = 'idle' | 'success' | 'failed';

type Action = 'pay' | 'login' | 'membership' | 'logout';

type Props = {
  open: boolean;
  result: RegisterResult | null;
  paying?: boolean;
  payState?: PayState;
  paidExpiry?: string | null;
  payError?: string;
  onPay: () => void;
  onLogin: () => void;
  onGoMembership: () => void;
  onLogout: () => void;
  onClose: () => void;
};

const formatDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

type Content = {
  Icon: ElementType;
  title: string;
  message: string;
  primary: { label: string; action: Action };
  closeLabel: string;
  error?: boolean;
};

function getContent(
  result: RegisterResult,
  payState: PayState,
  paidExpiry?: string | null,
  payError?: string
): Content {
  if (payState === 'success') {
    return {
      Icon: CheckCircleIcon,
      title: 'Payment successful',
      message: paidExpiry
        ? `Your membership is active until ${formatDate(paidExpiry)}. You can now see your consultants.`
        : 'Your membership is now active. You can now see your consultants.',
      primary: { label: 'Go to My Membership', action: 'membership' },
      closeLabel: 'Close',
    };
  }

  if (payState === 'failed') {
    return {
      Icon: ErrorIcon,
      title: 'Payment not completed',
      message: payError || 'Something went wrong with the payment. Please try again.',
      primary: { label: 'Try again', action: 'pay' },
      closeLabel: 'Close',
      error: true,
    };
  }

  const isCurrentUser = result.isCurrentUser === true;

  switch (result.case) {
    case 'NEW': {
      const first = result.name?.split(' ')[0];
      return {
        Icon: CheckCircleIcon,
        title: 'Registered successfully',
        message: `${
          first ? `Welcome, ${first}. ` : ''
        }Pay ₹365 to activate your 1-year membership and get the consultant details.`,
        primary: { label: 'Pay ₹365 now', action: 'pay' },
        closeLabel: 'Later',
      };
    }

    case 'EXISTS_PENDING':
      if (isCurrentUser) {
        return {
          Icon: InfoOutlinedIcon,
          title: 'You’re already registered',
          message:
            'Complete your payment to activate your membership and get the consultant details.',
          primary: { label: 'Pay ₹365 now', action: 'pay' },
          closeLabel: 'Later',
        };
      }
      return {
        Icon: InfoOutlinedIcon,
        title: 'You’re already registered',
        message: 'Please login to activate your membership and get the consultant details.',
        primary: { label: 'Login to continue', action: 'login' },
        closeLabel: 'Close',
      };

    case 'EXISTS_ACTIVE':
      if (isCurrentUser) {
        return {
          Icon: VerifiedOutlinedIcon,
          title: 'You’re already a member',
          message: result.expiryDate
            ? `Your membership is active until ${formatDate(result.expiryDate)}.`
            : 'Your membership is active.',
          primary: { label: 'View consultant details', action: 'membership' },
          closeLabel: 'Close',
        };
      }
      return {
        Icon: VerifiedOutlinedIcon,
        title: 'You’re already a member',
        message: 'Please login to see the consultant details.',
        primary: { label: 'Login', action: 'login' },
        closeLabel: 'Close',
      };

    case 'EXISTS_EXPIRED':
      if (isCurrentUser) {
        return {
          Icon: InfoOutlinedIcon,
          title: 'Your membership has expired',
          message: 'Renew for ₹365 and get 1 more year of access to consultants.',
          primary: { label: 'Renew ₹365 now', action: 'pay' },
          closeLabel: 'Later',
        };
      }
      return {
        Icon: InfoOutlinedIcon,
        title: 'Your membership has expired',
        message: 'Please login to renew for ₹365 and get 1 more year of access to consultants.',
        primary: { label: 'Login to renew', action: 'login' },
        closeLabel: 'Close',
      };

    case 'OTHER_ACCOUNT':
      return {
        Icon: SwitchAccountOutlinedIcon,
        title: 'These details belong to another account',
        message: `You’re logged in${
          result.loggedInName ? ` as ${result.loggedInName}` : ''
        }. To continue with these details, logout and login to that account.`,
        primary: { label: 'Logout and switch', action: 'logout' },
        closeLabel: 'Cancel',
      };

    case 'LOGGED_IN_NEW':
      return {
        Icon: SwitchAccountOutlinedIcon,
        title: 'You’re already logged in',
        message: `You’re logged in${
          result.loggedInName ? ` as ${result.loggedInName}` : ''
        }. To register someone else, logout first.`,
        primary: { label: 'Logout and switch', action: 'logout' },
        closeLabel: 'Cancel',
      };
  }
}

export default function RegistrationDialog({
  open,
  result,
  paying = false,
  payState = 'idle',
  paidExpiry,
  payError,
  onPay,
  onLogin,
  onGoMembership,
  onLogout,
  onClose,
}: Props) {
  if (!result) return null;

  const { Icon, title, message, primary, closeLabel, error } = getContent(
    result,
    payState,
    paidExpiry,
    payError
  );

  const handlers: Record<Action, () => void> = {
    pay: onPay,
    login: onLogin,
    membership: onGoMembership,
    logout: onLogout,
  };
  const showPrice = primary.action === 'pay';
  const iconColor = error ? '#dc2626' : 'var(--primary)';
  const iconBg = error ? 'rgba(220, 38, 38, 0.1)' : 'rgba(22, 163, 74, 0.12)';

  return (
    <Dialog
      open={open}
      onClose={paying ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{ paper: { sx: { borderRadius: 4, p: { xs: 1, sm: 2 } } } }}
    >
      <DialogContent>
        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              bgcolor: iconBg,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon sx={{ fontSize: 56, color: iconColor }} />
          </Box>

          <Typography component="h2" sx={{ fontSize: '1.4rem', fontWeight: 700 }}>
            {title}
          </Typography>

          <Typography sx={{ color: 'text.secondary', lineHeight: 1.7 }}>{message}</Typography>

          {showPrice && (
            <Box
              sx={{
                px: 2,
                py: 0.75,
                borderRadius: 999,
                bgcolor: 'rgba(22, 163, 74, 0.1)',
                color: 'var(--primary)',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              ₹365 · 1 year membership
            </Box>
          )}

          <Stack spacing={1.25} sx={{ width: '100%', pt: 1 }}>
            <Button
              variant="contained"
              size="large"
              disabled={paying}
              onClick={handlers[primary.action]}
              sx={{
                background: 'linear-gradient(90deg, var(--primary), #22c55e)',
                borderRadius: '14px',
                py: 1.4,
                fontWeight: 600,
                boxShadow: '0 8px 20px rgba(22, 163, 74, 0.35)',
                '&.Mui-disabled': { color: 'var(--white)', opacity: 0.7 },
              }}
            >
              {paying ? <CircularProgress size={24} color="inherit" /> : primary.label}
            </Button>

            <Button
              variant="text"
              color="inherit"
              disabled={paying}
              onClick={onClose}
              sx={{ borderRadius: '14px', py: 1.2, color: 'text.secondary' }}
            >
              {closeLabel}
            </Button>
          </Stack>

          {showPrice && (
            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
              The membership fee is non-refundable.
            </Typography>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}