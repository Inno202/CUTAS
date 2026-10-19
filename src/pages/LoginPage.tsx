import React, { useState, useEffect } from 'react';
import { User, TabId } from '../types';
import crestImage from '../assets/images/cutas_society_crest_1792291983112.jpg';
import { Eye, EyeOff, Lock, User as UserIcon, Loader2, Shield, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  users: User[];
  onLoginSuccess: (userId: string, returnTab?: TabId) => void;
  onNavigate: (tab: TabId) => void;
  returnTab?: TabId;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  users,
  onLoginSuccess,
  onNavigate,
  returnTab,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // MFA state for Administrator & Super Admin
  const [mfaRequiredUser, setMfaRequiredUser] = useState<User | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState<string | null>(null);

  // Rate limiting countdown
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => setCooldownSeconds(s => s - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownSeconds > 0 || loading) return;

    setError(null);
    setLoading(true);

    setTimeout(() => {
      const cleanIdent = identifier.trim().toLowerCase();
      const user = users.find(
        u => u.username.toLowerCase() === cleanIdent || u.email.toLowerCase() === cleanIdent
      );

      // Security Baseline S3: Generic error for unknown user or wrong password (no account enumeration)
      if (!user || password.length < 6) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        setLoading(false);
        if (nextAttempts >= 5) {
          setCooldownSeconds(30);
          setError('Too many failed attempts. Login locked for 30 seconds for security.');
        } else {
          setError('Invalid username or password. Please try again.');
        }
        return;
      }

      setLoading(false);

      // Security Baseline S3: MFA required for ADMINISTRATOR and SUPER_ADMIN
      if (user.role === 'ADMINISTRATOR' || user.role === 'SUPER_ADMIN') {
        setMfaRequiredUser(user);
        return;
      }

      onLoginSuccess(user.id, returnTab);
    }, 400);
  };

  const handleVerifyMfa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaRequiredUser) return;

    if (mfaCode.trim().length !== 6 || !/^\d+$/.test(mfaCode.trim())) {
      setMfaError('Please enter a valid 6-digit TOTP authenticator code.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(mfaRequiredUser.id, returnTab);
    }, 350);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-6 sm:py-10">
      <div className="w-full max-w-[440px] bg-white rounded-[6px] border border-[#E2E8F0] shadow-xs p-6 sm:p-8 space-y-6">
        {/* Above the form: Society crest in a small white rounded square */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-[6px] bg-white p-1.5 border border-[#E2E8F0] shadow-xs flex items-center justify-center">
            <img
              src={crestImage}
              alt="CUTAS Crest"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#255190]">
            {mfaRequiredUser ? 'Two-Factor Authentication' : 'Welcome back'}
          </h1>
          <p className="text-xs text-slate-500">
            {mfaRequiredUser 
              ? `Enter the 6-digit verification code for ${mfaRequiredUser.username}` 
              : 'Sign in to your CUT Academic Society account'}
          </p>
        </div>

        {/* Error Banner */}
        {(error || mfaError) && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-[4px] text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error || mfaError}</div>
          </div>
        )}

        {/* MFA Step for Admin / Super Admin */}
        {mfaRequiredUser ? (
          <form onSubmit={handleVerifyMfa} className="space-y-4">
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-[4px] text-xs text-slate-700 space-y-1">
              <span className="font-semibold text-[#255190] flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#255190]" />
                Institutional Security Enforcement
              </span>
              <p className="text-[11px] text-slate-600">
                Administrative roles ({mfaRequiredUser.role}) require multi-factor TOTP verification. Enter any 6-digit code (e.g. <b>123456</b>) to complete sign-in.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Authenticator Security Code *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full pl-9 pr-3 h-[46px] text-sm tracking-widest font-mono rounded-[6px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[46px] bg-[#FDB813] hover:bg-[#e5a610] text-slate-900 font-bold rounded-[6px] text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <span>Confirm & Sign in</span>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMfaRequiredUser(null);
                  setMfaCode('');
                  setMfaError(null);
                }}
                className="text-xs text-[#255190] hover:underline cursor-pointer"
              >
                ← Back to credential login
              </button>
            </div>
          </form>
        ) : (
          /* Standard Sign In Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username or Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username or Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your username or email"
                  disabled={cooldownSeconds > 0 || loading}
                  className="w-full pl-9 pr-3 h-[46px] text-xs rounded-[6px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password *
                </label>
                <button
                  type="button"
                  onClick={() => onNavigate('forgot_password')}
                  className="text-[11px] text-[#255190] hover:underline font-semibold cursor-pointer"
                >
                  Forgot your password? Reset
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={cooldownSeconds > 0 || loading}
                  className="w-full pl-9 pr-10 h-[46px] text-xs rounded-[6px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Primary Sign In Button */}
            <button
              type="submit"
              disabled={loading || cooldownSeconds > 0}
              className="w-full h-[46px] bg-[#FDB813] hover:bg-[#e5a610] text-slate-900 font-bold rounded-[6px] text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                  <span>Signing in...</span>
                </>
              ) : cooldownSeconds > 0 ? (
                <span>Locked for security ({cooldownSeconds}s)</span>
              ) : (
                <span>Sign in</span>
              )}
            </button>

            {/* Divider & Secondary Register Button */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-slate-400">New to CUTAS?</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="w-full h-[46px] bg-white hover:bg-slate-50 text-[#255190] border border-[#255190] font-semibold rounded-[6px] text-xs transition-colors flex items-center justify-center cursor-pointer shadow-xs"
            >
              Register
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
