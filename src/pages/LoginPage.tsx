import React, { useEffect, useState } from 'react';
import { AlertCircle, Eye, EyeOff, KeyRound, Loader2, Lock, Shield, Smartphone, User as UserIcon } from 'lucide-react';
import logo from '../assets/images/cutas-logo.svg';
import { ApiError } from '../api/client';
import { Alert } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../hooks/useAsync';
import { navigate, queryParam, safeNext } from '../router';
import type { MfaSetup } from '../types';

const field =
  'w-full pl-9 pr-3 h-[46px] text-xs rounded-[6px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] focus:border-transparent transition-all disabled:bg-slate-50';

export const AuthCard: React.FC<{ title: string; subtitle: string; children: React.ReactNode; wide?: boolean }> = ({
  title, subtitle, children, wide,
}) => (
  <div className="min-h-[70vh] flex items-center justify-center py-4 sm:py-10">
    <div className={`w-full ${wide ? 'max-w-[480px]' : 'max-w-[440px]'} bg-white rounded-[6px] border border-[#E2E8F0] shadow-xs p-5 sm:p-8 space-y-6`}>
      <div className="text-center space-y-2">
        <img src={logo} alt="CUTAS - Central University of Technology Academic Society" className="w-60 sm:w-64 h-auto mx-auto mb-3" width={256} height={57} />
        <h1 className="text-xl sm:text-2xl font-semibold text-[#255190]">{title}</h1>
        <p className="text-xs text-slate-500 mx-auto">{subtitle}</p>
      </div>
      {children}
    </div>
  </div>
);

export const LoginPage: React.FC = () => {
  const { login, verifyMfa, user, notice, clearNotice } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [mfaSetup, setMfaSetup] = useState<MfaSetup | null>(null);
  const [code, setCode] = useState('');

  const next = safeNext(queryParam('next'));

  useEffect(() => {
    if (user && !mfaToken) navigate(next ?? (user.role === 'SCHOLAR' ? 'studies' : 'admin_dashboard'), { replace: true });
  }, [user, mfaToken, next]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0 || loading) return;
    setError(null);
    clearNotice();
    setLoading(true);
    try {
      const outcome = await login(identifier.trim(), password);
      if (outcome.kind === 'mfa') {
        setMfaToken(outcome.token);
        setMfaSetup(outcome.setup);
        setPassword('');
      }
    } catch (err) {
      setError(errorMessage(err));
      if (err instanceof ApiError && err.status === 429) {
        const retry = (err.data as { retry_after?: number } | null)?.retry_after;
        setCooldown(Math.min(retry ?? 60, 900));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaToken) return;
    if (!/^\d{6}$/.test(code.replace(/\s/g, ''))) {
      setError('Enter the 6-digit code from your authenticator app.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await verifyMfa(mfaToken, code.replace(/\s/g, ''));
      setMfaToken(null);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'mfa_expired') {
        setMfaToken(null);
        setMfaSetup(null);
      }
      setError(errorMessage(err));
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  if (mfaToken) {
    return (
      <AuthCard
        title={mfaSetup ? 'Set up two-factor authentication' : 'Two-factor authentication'}
        subtitle={mfaSetup ? 'Administrator accounts are protected with an authenticator app.' : 'Enter the 6-digit code from your authenticator app.'}
        wide={!!mfaSetup}
      >
        {error && <Alert type="error">{error}</Alert>}
        <form onSubmit={handleVerify} className="space-y-4">
          {mfaSetup && (
            <div className="space-y-3 text-xs text-slate-700">
              <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed">
                <li>Install an authenticator app (Microsoft Authenticator, Google Authenticator or similar) on your phone.</li>
                <li>Scan this QR code with the app, or type the setup key manually.</li>
                <li>Enter the 6-digit code the app shows to finish signing in.</li>
              </ol>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-[6px]">
                <img src={mfaSetup.qrSvg} alt="QR code for your authenticator app" className="w-40 h-40 bg-white p-1 rounded border border-slate-200" />
                <div className="min-w-0 text-center sm:text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Setup key</span>
                  <code className="font-mono text-xs font-bold text-slate-900 break-all select-all">{mfaSetup.secret}</code>
                  <p className="text-[11px] text-slate-500 mt-2">Keep this key private. Anyone with it can generate your codes.</p>
                </div>
              </div>
            </div>
          )}
          <div>
            <label htmlFor="mfa-code" className="block text-xs font-semibold text-slate-700 mb-1">Authenticator code</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                {mfaSetup ? <Smartphone className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
              </div>
              <input
                id="mfa-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9 ]{6,7}"
                maxLength={7}
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^\d ]/g, ''))}
                placeholder="123 456"
                className={`${field} tracking-widest font-mono text-sm`}
              />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full h-[46px] bg-[#FDB813] hover:bg-[#e5a610] text-slate-900 font-bold rounded-[6px] text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Verifying…</span></> : <span>{mfaSetup ? 'Activate & Sign in' : 'Verify & Sign in'}</span>}
          </button>
          <div className="text-center pt-1">
            <button type="button" onClick={() => { setMfaToken(null); setMfaSetup(null); setCode(''); setError(null); }}
              className="text-xs text-[#255190] hover:underline cursor-pointer py-1">
              ← Back to sign in
            </button>
          </div>
          <p className="text-[11px] text-slate-500 flex items-start gap-1.5">
            <Shield className="w-3.5 h-3.5 flex-shrink-0 text-[#255190] mt-0.5" />
            Lost access to your authenticator? Ask the CUTAS Super Administrator to reset your two-factor setup.
          </p>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your CUT Academic Society account">
      {notice && <Alert type="warning" onClose={clearNotice}>{notice}</Alert>}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-[4px] text-xs flex items-start gap-2" role="alert">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-identifier" className="block text-xs font-semibold text-slate-700 mb-1">Username or Email *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><UserIcon className="w-4 h-4" /></div>
            <input id="login-identifier" type="text" required autoComplete="username" autoCapitalize="none" spellCheck={false}
              maxLength={254} value={identifier} onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your username or email" disabled={loading} className={field} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1 gap-2">
            <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700">Password *</label>
            <button type="button" onClick={() => navigate('forgot_password')} className="text-[11px] text-[#255190] hover:underline font-semibold cursor-pointer py-1">
              Forgot your password?
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Lock className="w-4 h-4" /></div>
            <input id="login-password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" maxLength={256}
              value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" disabled={loading}
              className={`${field} pr-11`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading || cooldown > 0}
          className="w-full h-[46px] bg-[#FDB813] hover:bg-[#e5a610] text-slate-900 font-bold rounded-[6px] text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Signing in…</span></>
            : cooldown > 0 ? <span>Please wait ({cooldown}s)</span> : <span>Sign in</span>}
        </button>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
          <div className="relative flex justify-center text-xs"><span className="px-3 bg-white text-slate-400">New to CUTAS?</span></div>
        </div>
        <button type="button" onClick={() => navigate('register')}
          className="w-full h-[46px] bg-white hover:bg-slate-50 text-[#255190] border border-[#255190] font-semibold rounded-[6px] text-xs transition-colors flex items-center justify-center cursor-pointer shadow-xs">
          Register
        </button>
      </form>
    </AuthCard>
  );
};
