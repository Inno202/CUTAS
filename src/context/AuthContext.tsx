import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onSessionExpired, refreshSession, setAccessToken } from '../api/client';
import { authApi, toUser } from '../api/endpoints';
import type { ApiUser, MfaSetup, User } from '../types';

export type AuthStatus = 'loading' | 'anonymous' | 'authenticated';

export type LoginOutcome =
  | { kind: 'ok'; user: User }
  | { kind: 'mfa'; token: string; setup: MfaSetup | null };

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  notice: string | null;
  clearNotice: () => void;
  login: (identifier: string, password: string) => Promise<LoginOutcome>;
  verifyMfa: (token: string, code: string) => Promise<User>;
  logout: (message?: string) => Promise<void>;
  setApiUser: (u: ApiUser) => void;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// A non-secret hint that this browser has signed in before, so anonymous visitors do not
// make a pointless session-restore request on every page load. The real session lives in
// the HttpOnly cookie, which JavaScript cannot read.
const HINT_KEY = 'cutas.session-hint';
function readHint(): boolean {
  try {
    return window.localStorage.getItem(HINT_KEY) === '1';
  } catch {
    return true; // storage blocked: just try the restore
  }
}
function writeHint(on: boolean) {
  try {
    if (on) window.localStorage.setItem(HINT_KEY, '1');
    else window.localStorage.removeItem(HINT_KEY);
  } catch {
    /* ignore */
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const setApiUser = useCallback((u: ApiUser) => {
    setUser(toUser(u));
    setStatus('authenticated');
    writeHint(true);
  }, []);

  // Restore the session after a page load using the HttpOnly refresh cookie.
  useEffect(() => {
    let cancelled = false;
    if (!readHint()) {
      setStatus('anonymous');
      return;
    }
    refreshSession().then((u) => {
      if (cancelled) return;
      if (u) setApiUser(u as ApiUser);
      else {
        writeHint(false);
        setStatus('anonymous');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [setApiUser]);

  useEffect(() => {
    onSessionExpired(() => {
      writeHint(false);
      setAccessToken(null);
      setUser(null);
      setStatus('anonymous');
      setNotice('Your session has ended. Please sign in again.');
    });
    return () => onSessionExpired(null);
  }, []);

  const login = useCallback(async (identifier: string, password: string): Promise<LoginOutcome> => {
    const res = await authApi.login(identifier, password);
    if ('mfaRequired' in res && res.mfaRequired) {
      const setup = res.mfaSetup && res.secret && res.qrSvg && res.otpauthUri
        ? { secret: res.secret, qrSvg: res.qrSvg, otpauthUri: res.otpauthUri }
        : null;
      return { kind: 'mfa', token: res.mfaToken, setup };
    }
    const ok = res as { access: string; user: ApiUser };
    setAccessToken(ok.access);
    setApiUser(ok.user);
    setNotice(null);
    return { kind: 'ok', user: toUser(ok.user) };
  }, [setApiUser]);

  const verifyMfa = useCallback(async (token: string, code: string) => {
    const res = await authApi.loginMfa(token, code);
    setAccessToken(res.access);
    setApiUser(res.user);
    setNotice(null);
    return toUser(res.user);
  }, [setApiUser]);

  const logout = useCallback(async (message?: string) => {
    try {
      await authApi.logout();
    } catch {
      /* the cookie is cleared either way */
    }
    writeHint(false);
    setAccessToken(null);
    setUser(null);
    setStatus('anonymous');
    setNotice(message ?? null);
  }, []);

  const reloadUser = useCallback(async () => {
    setApiUser(await authApi.me());
  }, [setApiUser]);

  const value = useMemo<AuthContextValue>(() => ({
    status, user, notice, clearNotice: () => setNotice(null), login, verifyMfa, logout, setApiUser, reloadUser,
  }), [status, user, notice, login, verifyMfa, logout, setApiUser, reloadUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export const isAdmin = (u: User | null) => !!u && (u.role === 'ADMIN' || u.role === 'SUPERADMIN');
export const isSuperAdmin = (u: User | null) => !!u && u.role === 'SUPERADMIN';
