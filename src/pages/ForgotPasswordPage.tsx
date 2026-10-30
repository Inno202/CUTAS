import React, { useState } from 'react';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';
import { authApi } from '../api/endpoints';
import { Alert } from '../components/ui';
import { errorMessage } from '../hooks/useAsync';
import { navigate } from '../router';
import { AuthCard } from './LoginPage';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.requestReset(email.trim());
      setMessage(res.detail);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Reset your password" subtitle="Enter the e-mail address registered on your CUTAS account.">
      {error && <Alert type="error">{error}</Alert>}
      {message ? (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-[4px] text-xs text-emerald-900 space-y-2" role="status">
            <div className="flex items-center gap-2 font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Check your inbox
            </div>
            <p className="leading-relaxed">{message}</p>
            <p className="leading-relaxed text-emerald-800">The link is valid for one hour and can be used once.</p>
          </div>
          <div className="text-center">
            <button type="button" onClick={() => navigate('login')} className="text-xs text-[#255190] hover:underline font-semibold cursor-pointer py-1">
              ← Back to Sign in
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="forgot-email" className="block text-xs font-semibold text-slate-700 mb-1">Registered Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Mail className="w-4 h-4" /></div>
              <input id="forgot-email" type="email" required autoComplete="email" maxLength={254} value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="e.g. scholar@cut.ac.za"
                className="w-full pl-9 pr-3 h-[46px] text-xs rounded-[6px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] focus:border-transparent" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full h-[46px] bg-[#FDB813] hover:bg-[#e5a610] text-slate-900 font-bold rounded-[6px] text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Sending…</span></> : <span>Send Reset Link</span>}
          </button>
          <div className="text-center">
            <button type="button" onClick={() => navigate('login')} className="text-xs text-[#255190] hover:underline font-semibold cursor-pointer py-1">
              Back to Sign in
            </button>
          </div>
        </form>
      )}
    </AuthCard>
  );
};
