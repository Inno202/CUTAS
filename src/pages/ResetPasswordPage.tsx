import React, { useState } from 'react';
import { TabId } from '../types';
import crestImage from '../assets/images/cutas_society_crest_1792291983112.jpg';
import { ArrowLeft, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ResetPasswordPageProps {
  onNavigate: (tab: TabId) => void;
  onPasswordResetSuccess?: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  onNavigate,
  onPasswordResetSuccess,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('New password must contain at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      onPasswordResetSuccess?.();
      setTimeout(() => {
        onNavigate('login');
      }, 1500);
    }, 600);
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

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md bg-white rounded-[6px] border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="p-6 pb-4 text-center border-b border-slate-100 bg-slate-50/50">
            <div className="w-12 h-12 mx-auto rounded-[6px] bg-white p-1 border border-slate-200 flex items-center justify-center mb-3 shadow-xs">
              <img src={crestImage} alt="CUTAS Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <h1 className="text-lg font-semibold text-[#255190] leading-snug">
              Set New Account Password
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Create a new secure password for your CUT Academic Society scholar profile.
            </p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-[4px] text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">{error}</div>
              </div>
            )}

            {success ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-[4px] text-xs text-emerald-900 space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="font-bold text-sm text-emerald-800">Password Updated Successfully</div>
                <p className="leading-relaxed text-slate-600">
                  Your new credentials are now active. Redirecting you to Sign in...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full pl-9 pr-10 py-2 text-xs rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full pl-9 pr-10 py-2 text-xs rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[#FDB813] hover:bg-[#e5a610] text-slate-900 font-bold rounded-[4px] text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>

                <div className="text-center pt-3">
                  <button
                    type="button"
                    onClick={() => onNavigate('login')}
                    className="text-xs text-[#255190] hover:underline font-semibold cursor-pointer"
                  >
                    Back to Sign in
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-slate-500 border-t border-slate-200 bg-white">
        &copy; {new Date().getFullYear()} Central University of Technology Academic Society. All rights reserved.
      </footer>
    </div>
  );
};
