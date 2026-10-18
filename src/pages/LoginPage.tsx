import React, { useState } from 'react';
import { User, TabId } from '../types';
import crestImage from '../assets/images/cutas_society_crest_1792291983112.jpg';
import { ArrowLeft, Eye, EyeOff, Lock, User as UserIcon, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

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
  const [identifier, setIdentifier] = useState('naledi_dlamini');
  const [password, setPassword] = useState('ScholarPass123!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Rate limiting countdown
  React.useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => setCooldownSeconds(s => s - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownSeconds > 0) return;

    setError(null);
    setLoading(true);

    setTimeout(() => {
      // Find user by username or email
      const cleanIdent = identifier.trim().toLowerCase();
      const user = users.find(
        u => u.username.toLowerCase() === cleanIdent || u.email.toLowerCase() === cleanIdent
      );

      if (!user) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        setLoading(false);
        if (nextAttempts >= 5) {
          setCooldownSeconds(30);
          setError('Too many failed attempts. Login locked for 30 seconds to protect account security.');
        } else {
          setError(`Invalid credentials. Please verify your username/email and password (${5 - nextAttempts} attempts remaining).`);
        }
        return;
      }

      // Password verification simulation
      if (password.length < 6) {
        setLoading(false);
        setError('Password must contain at least 6 characters.');
        return;
      }

      setLoading(false);
      onLoginSuccess(user.id, returnTab);
    }, 450);
  };

  const handleTestUserClick = (testUsername: string) => {
    setIdentifier(testUsername);
    setPassword('ScholarPass123!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col justify-between">
      {/* Minimal Top Bar */}
      <header className="bg-[#255190] text-white border-t-[6px] border-[#FDB813] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center space-x-2.5 text-left cursor-pointer group"
        >
          <div className="w-8 h-8 rounded bg-white p-0.5 flex items-center justify-center flex-shrink-0">
            <img src={crestImage} alt="CUT Crest" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
          <div>
            <span className="text-white font-semibold text-sm block leading-none">CUT Academic Society</span>
            <span className="text-[10px] text-white/70 uppercase tracking-wider block mt-0.5">Central University of Technology</span>
          </div>
        </button>

        <button
          onClick={() => onNavigate('landing')}
          className="text-xs text-white/90 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-white/20 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </header>

      {/* Main Content: Centred Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md bg-white rounded-[6px] border border-[#E2E8F0] shadow-sm overflow-hidden">
          {/* Header Section */}
          <div className="p-6 pb-4 text-center border-b border-slate-100 bg-slate-50/50">
            <div className="w-12 h-12 mx-auto rounded-[6px] bg-white p-1 border border-slate-200 flex items-center justify-center mb-3 shadow-xs">
              <img src={crestImage} alt="CUTAS Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <h1 className="text-lg font-semibold text-[#255190] leading-snug">
              Central University of Technology Academic Society
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Scholar-led academic inquiry, DHET-accredited publication, and national funding.
            </p>
          </div>

          {/* Form Section */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-base font-semibold text-[#255190]">Sign in to Portal</h2>
              <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded-[4px]">
                CUT Institutional
              </span>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-[4px] text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username or Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username or Email Address
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
                    placeholder="e.g. naledi_dlamini or scholar@cut.ac.za"
                    disabled={cooldownSeconds > 0 || loading}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => onNavigate('forgot_password')}
                    className="text-[11px] text-[#255190] hover:underline font-semibold cursor-pointer"
                  >
                    Forgot password?
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
                    placeholder="Enter your security password"
                    disabled={cooldownSeconds > 0 || loading}
                    className="w-full pl-9 pr-10 py-2 text-xs rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] focus:border-transparent transition-all"
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || cooldownSeconds > 0}
                className="w-full h-11 bg-[#FDB813] hover:bg-[#e5a610] text-slate-900 font-bold rounded-[4px] text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : cooldownSeconds > 0 ? (
                  <span>Locked ({cooldownSeconds}s)</span>
                ) : (
                  <span>Sign in</span>
                )}
              </button>

              {/* CSRF & Rate limiting info */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> CSRF Protected
                </span>
                <span>Rate limited (max 5 attempts)</span>
              </div>
            </form>

            {/* Test Accounts Quick Access */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                Quick Test Credentials (CUT Demo)
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleTestUserClick('naledi_dlamini')}
                  className="text-left px-2 py-1.5 rounded-[4px] bg-slate-50 hover:bg-blue-50 text-slate-700 border border-slate-200 hover:border-blue-200 transition-colors cursor-pointer truncate"
                >
                  <b>Naledi Dlamini</b>
                  <span className="block text-[10px] text-slate-400">Scholar (Cat B)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTestUserClick('prof_nyokong')}
                  className="text-left px-2 py-1.5 rounded-[4px] bg-slate-50 hover:bg-blue-50 text-slate-700 border border-slate-200 hover:border-blue-200 transition-colors cursor-pointer truncate"
                >
                  <b>Prof. Nyokong</b>
                  <span className="block text-[10px] text-slate-400">Super Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTestUserClick('dr_kader')}
                  className="text-left px-2 py-1.5 rounded-[4px] bg-slate-50 hover:bg-blue-50 text-slate-700 border border-slate-200 hover:border-blue-200 transition-colors cursor-pointer truncate"
                >
                  <b>Dr. Kader Asmal</b>
                  <span className="block text-[10px] text-slate-400">Administrator</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTestUserClick('tumelo_molefe')}
                  className="text-left px-2 py-1.5 rounded-[4px] bg-slate-50 hover:bg-blue-50 text-slate-700 border border-slate-200 hover:border-blue-200 transition-colors cursor-pointer truncate"
                >
                  <b>Tumelo Molefe</b>
                  <span className="block text-[10px] text-slate-400">Scholar (Cat A)</span>
                </button>
              </div>
            </div>

            {/* Link to Register */}
            <div className="mt-5 text-center text-xs text-slate-600">
              New here?{' '}
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="text-[#255190] font-semibold hover:underline cursor-pointer"
              >
                Register as Scholar
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="text-center py-4 text-xs text-slate-500 border-t border-slate-200 bg-white">
        &copy; {new Date().getFullYear()} Central University of Technology Academic Society. All rights reserved.
      </footer>
    </div>
  );
};
