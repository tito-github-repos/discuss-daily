'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type AuthUser = { id: number; name: string; email: string; mobile: string };
export type AuthMembership = {
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED';
  startDate: string | null;
  expiryDate: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  membership: AuthMembership | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [membership, setMembership] = useState<AuthMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      setUser(data.user ?? null);
      setMembership(data.membership ?? null);
    } catch {
      setUser(null);
      setMembership(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      setMembership(null);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      membership,
      loading,
      refresh,
      logout,
      loginOpen,
      openLogin: () => setLoginOpen(true),
      closeLogin: () => setLoginOpen(false),
    }),
    [user, membership, loading, refresh, logout, loginOpen]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}