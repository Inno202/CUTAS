import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { authApi } from '../api/endpoints';
import { Alert } from '../components/ui';
import { errorMessage, fieldErrors } from '../hooks/useAsync';
import { navigate, queryParam } from '../router';
import { AuthCard } from './LoginPage';

const field =
  'w-full pl-9 pr-11 h-[46px] text-xs rounded-[6px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] focus:border-transparent';

export const ResetPasswordPage: React.FC = () => {
  const { uid, token } = useMemo(() => ({ uid: queryParam('uid') ?? '', token: queryParam('token') ?? '' }), []);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Remove the one-time token from the address bar (and browser history) straight away.
  useEffect(() => {
    if (uid || token) window.history.replaceState({}, '', '/reset-password');
  }, [uid, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    setLoading(true);
    try {
      await authApi.confirmReset(uid, token, newPassword);
      setDone(true);
      setTimeout(() => navigate('login'), 2500);
    } catch (err) {
      setError(fieldErrors(err).newPassword || errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!uid || !token) {
    return (
      <AuthCard title="Reset link required" subtitle="Open the link from your password-reset e-mail to choose a new password.">
        <button type="button" onClick={() => navigate('forgot_password')}
          className="w-full h-[46px] bg-[#FDB813] hover:bg-[#e5a610] text-slate-900 font-bold rounded-[6px] text-xs cursor-pointer">
          Request a new reset link
        </button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set a new password" subtitle="Choose a new password for your CUTAS account.">
      {error && <Alert type="error">{error}</Alert>}
      {done ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-[4px] text-xs text-emerald-900 space-y-2 text-center" role="status">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <div className="font-bold text-sm text-emerald-800">Password updated</div>
          <p className="leading-relaxed text-slate-600 mx-auto">Every device was signed out for safety. Redirecting you to Sign in…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {(['new', 'confirm'] as const).map((which) => (
            <div key={which}>
              <label htmlFor={`reset-${which}`} className="block text-xs font-semibold text-slate-700 mb-1">
                {which === 'new' ? 'New Password *' : 'Confirm New Password *'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Lock className="w-4 h-4" /></div>
                <input
                  id={`reset-${which}`}
                  type={show ? 'text' : 'password'}
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  value={which === 'new' ? newPassword : confirmPassword}
                  onChange={(e) => (which === 'new' ? setNewPassword : setConfirmPassword)(e.target.value)}
                  placeholder={which === 'new' ? '8+ characters, letters and numbers' : 'Repeat new password'}
                  className={field}
                />
                {which === 'new' && (
                  <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full h-[46px] bg-[#FDB813] hover:bg-[#e5a610] text-slate-900 font-bold rounded-[6px] text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Updating password…</span></> : <span>Update Password</span>}
          </button>
        </form>
      )}
    </AuthCard>
  );
};
