import React, { useState } from 'react';
import { User, TabId, ScholarCategory } from '../types';
import crestImage from '../assets/images/cutas_society_crest_1792291983112.jpg';
import { ArrowLeft, Eye, EyeOff, Lock, User as UserIcon, Mail, Building, Loader2, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface RegisterPageProps {
  existingUsers: User[];
  onRegisterSuccess: (newUser: Omit<User, 'id'>) => void;
  onNavigate: (tab: TabId) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  existingUsers,
  onRegisterSuccess,
  onNavigate,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [faculty, setFaculty] = useState('Faculty of Engineering, Built Environment & Information Technology');
  const [department, setDepartment] = useState('Department of Information Technology');
  const [category, setCategory] = useState<ScholarCategory>('CAT_A');
  const [title, setTitle] = useState('Candidate');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Password strength hint
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUpper = /[A-Z]/.test(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    const cleanUsername = username.trim().toLowerCase();
    if (existingUsers.some(u => u.username.toLowerCase() === cleanUsername)) {
      setError(`Username "${username}" is already registered. Please choose another.`);
      return;
    }

    if (existingUsers.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setError(`An account with email "${email}" already exists. Please sign in instead.`);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your passwords.');
      return;
    }

    if (!hasMinLength) {
      setError('Password must be at least 8 characters in length.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      onRegisterSuccess({
        username: cleanUsername,
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: 'SCHOLAR',
        title: title || 'Mr.',
        category,
        faculty,
        department,
        studentNumber: studentNumber.trim() || 'CUT2026-999',
        bio: 'Newly registered postgraduate scholar pursuing cutting-edge inquiry at Central University of Technology.',
        cvSummaryText: 'CUT Postgraduate Scholar. Academic record maintained in the institutional repository.',
      });

      setLoading(false);
      setSuccessMessage('Scholar account registered successfully! Redirecting to Sign in...');
      setTimeout(() => {
        onNavigate('login');
      }, 1200);
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

      {/* Main Content: Centred Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-xl bg-white rounded-[6px] border border-[#E2E8F0] shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-4 text-center border-b border-slate-100 bg-slate-50/50">
            <div className="w-12 h-12 mx-auto rounded-[6px] bg-white p-1 border border-slate-200 flex items-center justify-center mb-3 shadow-xs">
              <img src={crestImage} alt="CUTAS Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <h1 className="text-lg font-semibold text-[#255190] leading-snug">
              Central University of Technology Academic Society
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              Register as a scholar to maintain your research dossier, record DHET publications, and apply for academic support.
            </p>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-base font-semibold text-[#255190]">Scholar Registration</h2>
              <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-[4px]">
                Postgraduate Access
              </span>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-[4px] text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">{error}</div>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[4px] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Naledi"
                    className="w-full px-3 py-2 text-xs rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Dlamini"
                    className="w-full px-3 py-2 text-xs rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Username & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Scholar Username *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. naledi_dlamini"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CUT Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. scholar@cut.ac.za"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Scholar Category & Student Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Scholar Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ScholarCategory)}
                    className="w-full px-3 py-2 text-xs rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] focus:border-transparent bg-white"
                  >
                    <option value="CAT_A">Category A - Proposal & Candidacy</option>
                    <option value="CAT_B">Category B - Advanced Thesis & Defense</option>
                    <option value="CAT_C">Category C - Postdoctoral Fellow</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CUT Student / Staff Number
                  </label>
                  <input
                    type="text"
                    value={studentNumber}
                    onChange={(e) => setStudentNumber(e.target.value)}
                    placeholder="e.g. 219034821"
                    className="w-full px-3 py-2 text-xs rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Faculty & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Faculty Affiliation
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Building className="w-4 h-4" />
                    </div>
                    <select
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] focus:border-transparent bg-white truncate"
                    >
                      <option value="Faculty of Engineering, Built Environment & Information Technology">Engineering, Built Env & IT</option>
                      <option value="Faculty of Health and Environmental Sciences">Health & Environmental Sciences</option>
                      <option value="Faculty of Humanities">Humanities</option>
                      <option value="Faculty of Management Sciences">Management Sciences</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Information Technology"
                    className="w-full px-3 py-2 text-xs rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Password and Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full pl-9 pr-9 py-2 text-xs rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] focus:border-transparent"
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
                    Confirm Password *
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
                      placeholder="Repeat password"
                      className="w-full pl-9 pr-9 py-2 text-xs rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] focus:border-transparent"
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
              </div>

              {/* Password strength hint */}
              <div className="p-2.5 bg-slate-50 rounded-[4px] border border-slate-200 text-[11px] text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                <span className={hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                  ✓ 8+ Characters
                </span>
                <span className={hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                  ✓ Includes number
                </span>
                <span className={hasUpper ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                  ✓ Includes uppercase
                </span>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#FDB813] hover:bg-[#e5a610] text-slate-900 font-bold rounded-[4px] text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                    <span>Creating Scholar Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> POPIA Compliant & Secure
                </span>
                <span>Central University of Technology</span>
              </div>
            </form>

            <div className="mt-5 text-center text-xs text-slate-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="text-[#255190] font-semibold hover:underline cursor-pointer"
              >
                Sign in
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
