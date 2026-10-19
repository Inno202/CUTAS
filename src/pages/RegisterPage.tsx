import React, { useState } from 'react';
import { User, TabId, ScholarCategory } from '../types';
import crestImage from '../assets/images/cutas_society_crest_1792291983112.jpg';
import { Eye, EyeOff, Lock, User as UserIcon, Mail, Building, Loader2, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field-level error messages
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);

  // Live password strength calculation
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const isPasswordValid = hasMinLength && hasLetter && hasNumber;

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    if (field === 'username') {
      const clean = value.trim().toLowerCase();
      if (!clean) {
        newErrors.username = 'Username is required.';
      } else if (existingUsers.some(u => u.username.toLowerCase() === clean)) {
        newErrors.username = 'Username is already registered.';
      } else {
        delete newErrors.username;
      }
    }

    if (field === 'email') {
      const clean = value.trim().toLowerCase();
      if (!clean) {
        newErrors.email = 'Email address is required.';
      } else if (!clean.includes('@') || !clean.includes('.')) {
        newErrors.email = 'Please enter a valid email address.';
      } else if (existingUsers.some(u => u.email.toLowerCase() === clean)) {
        newErrors.email = 'An account with this email already exists.';
      } else {
        delete newErrors.email;
      }
    }

    if (field === 'password') {
      if (value.length < 8) {
        newErrors.password = 'Password must be at least 8 characters with letters and numbers.';
      } else {
        delete newErrors.password;
      }
    }

    if (field === 'confirmPassword') {
      if (value !== password) {
        newErrors.confirmPassword = 'Passwords do not match.';
      } else {
        delete newErrors.confirmPassword;
      }
    }

    setErrors(newErrors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    // Final checks
    const cleanUsername = username.trim().toLowerCase();
    if (existingUsers.some(u => u.username.toLowerCase() === cleanUsername)) {
      setGlobalError(`Username "${username}" is already taken.`);
      return;
    }

    if (existingUsers.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setGlobalError(`An account with email "${email}" already exists.`);
      return;
    }

    if (password !== confirmPassword) {
      setGlobalError('Passwords do not match.');
      return;
    }

    if (!isPasswordValid) {
      setGlobalError('Password must contain at least 8 characters with a mix of letters and numbers.');
      return;
    }

    if (!agreeTerms) {
      setGlobalError('You must agree to the society terms and data policy to create an account.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Security Baseline S4: Users must NOT choose role or category. Default is pending CAT_A.
      onRegisterSuccess({
        username: cleanUsername,
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: 'SCHOLAR',
        title: 'Candidate',
        category: 'CAT_A', // Default initial category, assigned/verified by admins in Console
        faculty,
        department: 'Postgraduate Research Division',
        studentNumber: studentNumber.trim() || 'CUT2026-REG',
        bio: 'Postgraduate scholar registered at Central University of Technology.',
        cvSummaryText: 'CUT Scholar. Academic record maintained in institutional portal.',
      });

      setLoading(false);
      onNavigate('login');
    }, 500);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-6 sm:py-10">
      <div className="w-full max-w-[480px] bg-white rounded-[6px] border border-[#E2E8F0] shadow-xs p-6 sm:p-8 space-y-6">
        {/* Above form: Crest and title */}
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
            Create your account
          </h1>
          <p className="text-xs text-slate-500">
            Join the CUT Academic Society
          </p>
        </div>

        {globalError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-[4px] text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{globalError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* First name & Last name (two columns on desktop, stacked on mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Naledi"
                className="w-full px-3 h-[46px] rounded-[6px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Dlamini"
                className="w-full px-3 h-[46px] rounded-[6px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190]"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Username *
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
                onBlur={(e) => validateField('username', e.target.value)}
                placeholder="e.g. naledi_dlamini"
                className={`w-full pl-9 pr-3 h-[46px] rounded-[6px] border ${
                  errors.username ? 'border-red-500' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-[#255190]`}
              />
            </div>
            {errors.username && (
              <span className="text-[11px] text-red-600 mt-1 block">{errors.username}</span>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Email Address *
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
                onBlur={(e) => validateField('email', e.target.value)}
                placeholder="scholar@cut.ac.za"
                className={`w-full pl-9 pr-3 h-[46px] rounded-[6px] border ${
                  errors.email ? 'border-red-500' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-[#255190]`}
              />
            </div>
            {errors.email && (
              <span className="text-[11px] text-red-600 mt-1 block">{errors.email}</span>
            )}
          </div>

          {/* Student/Staff Number & Faculty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Student / Staff Number
              </label>
              <input
                type="text"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                placeholder="e.g. 219034821"
                className="w-full px-3 h-[46px] rounded-[6px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Faculty
              </label>
              <select
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="w-full px-3 h-[46px] rounded-[6px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] bg-white truncate"
              >
                <option value="Faculty of Engineering, Built Environment & Information Technology">Engineering & IT</option>
                <option value="Faculty of Health and Environmental Sciences">Health & Env Sciences</option>
                <option value="Faculty of Humanities">Humanities</option>
                <option value="Faculty of Management Sciences">Management Sciences</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
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
                onBlur={(e) => validateField('password', e.target.value)}
                placeholder="Minimum 8 characters"
                className={`w-full pl-9 pr-10 h-[46px] rounded-[6px] border ${
                  errors.password ? 'border-red-500' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-[#255190]`}
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
            {errors.password ? (
              <span className="text-[11px] text-red-600 mt-1 block">{errors.password}</span>
            ) : (
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                <span className={hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                  ✓ 8+ chars
                </span>
                <span className={hasLetter ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                  ✓ Letters
                </span>
                <span className={hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                  ✓ Numbers
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
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
                onBlur={(e) => validateField('confirmPassword', e.target.value)}
                placeholder="Repeat password"
                className={`w-full pl-9 pr-10 h-[46px] rounded-[6px] border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-[#255190]`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="text-[11px] text-red-600 mt-1 block">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Required Checkbox for Terms and Data Policy */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="rounded text-[#255190] focus:ring-[#255190] mt-0.5"
              />
              <span>
                I agree to the society's{' '}
                <button
                  type="button"
                  onClick={() => setPolicyModalOpen(true)}
                  className="text-[#255190] font-semibold underline cursor-pointer"
                >
                  terms and data policy
                </button>
                {' '}(POPIA compliant).
              </span>
            </label>
          </div>

          {/* Primary Button: Create account */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[46px] bg-[#FDB813] hover:bg-[#e5a610] text-slate-900 font-bold rounded-[6px] text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create account</span>
            )}
          </button>

          {/* Divider & Secondary Sign In Button */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-slate-400">Already have an account?</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="w-full h-[46px] bg-white hover:bg-slate-50 text-[#255190] border border-[#255190] font-semibold rounded-[6px] text-xs transition-colors flex items-center justify-center cursor-pointer shadow-xs"
          >
            Sign in
          </button>
        </form>
      </div>

      {/* Terms & Data Policy Modal */}
      {policyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[6px] border border-slate-300 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#255190] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                CUTAS Terms & POPIA Data Policy
              </h3>
              <button
                type="button"
                onClick={() => setPolicyModalOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-2.5 max-h-60 overflow-y-auto leading-relaxed">
              <p>
                <b>1. Institutional Mandate:</b> The Central University of Technology Academic Society (CUTAS) collects scholar registration data strictly for academic mentorship, bursary endorsements, DHET publication monitoring, and research bottleneck resolution.
              </p>
              <p>
                <b>2. POPIA Compliance:</b> All personal telephone numbers, student numbers, and research abstracts are protected under South Africa's Protection of Personal Information Act. Scholar CVs are presented in-portal for verified academic collaboration only; direct file downloads are restricted by institutional policy.
              </p>
              <p>
                <b>3. Category Assignment:</b> Scholar Categories (A, B, C) are assigned and verified by the CUTAS Steering Committee based on registered degree level.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPolicyModalOpen(false)}
                className="px-4 py-2 bg-[#255190] text-white rounded-[4px] text-xs font-semibold cursor-pointer"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
