'use client';

import { ReactNode } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from '@/components/AuthProvider';
import LoginDialog from '@/components/LoginDialog';

const theme = createTheme({
  palette: {
    primary: { main: '#16a34a', contrastText: '#ffffff' },
    secondary: { main: '#7c3aed', contrastText: '#ffffff' },
    background: { default: '#ffffff', paper: '#ffffff' },
    text: { primary: '#000000', secondary: '#4b5563' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'var(--font-poppins), system-ui, sans-serif',
    button: { textTransform: 'none', fontWeight: 500 },
  },
});

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        {children}
        <LoginDialog />
      </AuthProvider>
    </ThemeProvider>
  );
}