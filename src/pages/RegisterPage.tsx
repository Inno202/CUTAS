import React, { useState } from 'react';
import { CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, User as UserIcon } from 'lucide-react';
import { authApi } from '../api/endpoints';
import { Alert, Modal, btnPrimary } from '../components/ui';
import { FACULTIES } from '../constants';
import { useAuth } from '../context/AuthContext';
import { errorMessage, fieldErrors } from '../hooks/useAsync';
import { navigate } from '../router';
import { AuthCard } from './LoginPage';

const input = 'w-full px-3 h-[46px] rounded-[6px] border focus:outline-none focus:ring-2 focus:ring-[#255190] text-xs';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [faculty, setFaculty] = useState(FACULTIES[0].value);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  const border = (k: string) => (errors[k] ? 'border-red-500' : 'border-slate-300');
  const err = (k: string) => errors[k] && <span className="text-[11px] text-red-600 mt-1 block" role="alert">{errors[k]}</span>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    const local: Record<string, string> = {};
    if (password !== confirmPassword) local.password2 = 'Passwords do not match.';
    if (!(hasMinLength && hasLetter && hasNumber)) local.password = 'Use at least 8 characters with letters and numbers.';
    if (!agreeTerms) local.agreeTerms = 'You must accept the terms and data policy.';
    setErrors(local);
    if (Object.keys(local).length) return;

    setLoading(true);
    try {
      await authApi.register({
        username: username.trim(), email: email.trim(), firstName: firstName.trim(), lastName: lastName.trim(),
        password, password2: confirmPassword, studentNumber: studentNumber.trim(), faculty, agreeTerms,
      });
      // Sign straight in after a successful registration.
      await login(username.trim(), password);
      navigate('studies', { replace: true });
    } catch (e2) {
      setErrors(fieldErrors(e2));
      setGlobalError(errorMessage(e2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Create your account" subtitle="Join the CUT Academic Society" wide>
      {globalError && <Alert type="error">{globalError}</Alert>}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="reg-first" className="block font-semibold text-slate-700 mb-1">First Name *</label>
            <input id="reg-first" type="text" required autoComplete="given-name" maxLength={100} value={firstName}
              onChange={(e) => setFirstName(e.target.value)} placeholder="e.g. Naledi" className={`${input} ${border('firstName')}`} />
            {err('firstName')}
          </div>
          <div>
            <label htmlFor="reg-last" className="block font-semibold text-slate-700 mb-1">Last Name *</label>
            <input id="reg-last" type="text" required autoComplete="family-name" maxLength={100} value={lastName}
              onChange={(e) => setLastName(e.target.value)} placeholder="e.g. Dlamini" className={`${input} ${border('lastName')}`} />
            {err('lastName')}
          </div>
        </div>

        <div>
          <label htmlFor="reg-username" className="block font-semibold text-slate-700 mb-1">Username *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><UserIcon className="w-4 h-4" /></div>
            <input id="reg-username" type="text" required autoComplete="username" autoCapitalize="none" spellCheck={false}
              minLength={3} maxLength={150} pattern="[\w.@+\-]+" value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. naledi_dlamini" className={`${input} pl-9 ${border('username')}`} />
          </div>
          {err('username') || <span className="text-[11px] text-slate-500 mt-1 block">Letters, numbers and . _ - @ + only.</span>}
        </div>

        <div>
          <label htmlFor="reg-email" className="block font-semibold text-slate-700 mb-1">Email Address *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Mail className="w-4 h-4" /></div>
            <input id="reg-email" type="email" required autoComplete="email" maxLength={254} value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="scholar@cut.ac.za" className={`${input} pl-9 ${border('email')}`} />
          </div>
          {err('email')}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="reg-student" className="block font-semibold text-slate-700 mb-1">Student / Staff Number</label>
            <input id="reg-student" type="text" maxLength={30} value={studentNumber} onChange={(e) => setStudentNumber(e.target.value)}
              placeholder="e.g. 219034821" className={`${input} ${border('studentNumber')}`} />
            {err('studentNumber')}
          </div>
          <div>
            <label htmlFor="reg-faculty" className="block font-semibold text-slate-700 mb-1">Faculty</label>
            <select id="reg-faculty" value={faculty} onChange={(e) => setFaculty(e.target.value)} className={`${input} ${border('faculty')} bg-white`}>
              {FACULTIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            {err('faculty')}
          </div>
        </div>

        <div>
          <label htmlFor="reg-password" className="block font-semibold text-slate-700 mb-1">Password *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Lock className="w-4 h-4" /></div>
            <input id="reg-password" type={showPassword ? 'text' : 'password'} required autoComplete="new-password" maxLength={128}
              value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters"
              className={`${input} pl-9 pr-11 ${border('password')}`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {err('password') || (
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px]">
              {[['8+ characters', hasMinLength], ['Letters', hasLetter], ['Numbers', hasNumber]].map(([label, ok]) => (
                <span key={label as string} className={ok ? 'text-emerald-700 font-semibold flex items-center gap-1' : 'text-slate-400 flex items-center gap-1'}>
                  <CheckCircle2 className="w-3 h-3" /> {label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="reg-password2" className="block font-semibold text-slate-700 mb-1">Confirm Password *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Lock className="w-4 h-4" /></div>
            <input id="reg-password2" type={showPassword ? 'text' : 'password'} required autoComplete="new-password" maxLength={128}
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password"
              className={`${input} pl-9 ${border('password2')}`} />
          </div>
          {err('password2')}
        </div>

        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
            <input type="checkbox" required checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)}
              className="rounded text-[#255190] focus:ring-[#255190] mt-0.5 w-4 h-4 flex-shrink-0" />
            <span>
              I agree to the society's{' '}
              <button type="button" onClick={() => setPolicyOpen(true)} className="text-[#255190] font-semibold underline cursor-pointer">
                terms and data policy
              </button>{' '}
              (POPIA compliant).
            </span>
          </label>
          {err('agreeTerms')}
        </div>

        <button type="submit" disabled={loading}
          className="w-full h-[46px] bg-[#FDB813] hover:bg-[#e5a610] text-slate-900 font-bold rounded-[6px] text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 mt-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Creating account…</span></> : <span>Create account</span>}
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
          <div className="relative flex justify-center text-xs"><span className="px-3 bg-white text-slate-400">Already have an account?</span></div>
        </div>
        <button type="button" onClick={() => navigate('login')}
          className="w-full h-[46px] bg-white hover:bg-slate-50 text-[#255190] border border-[#255190] font-semibold rounded-[6px] text-xs transition-colors flex items-center justify-center cursor-pointer shadow-xs">
          Sign in
        </button>
      </form>

      <Modal
        open={policyOpen}
        onClose={() => setPolicyOpen(false)}
        title={<span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600" /> CUTAS Terms & POPIA Data Policy</span>}
        footer={<button type="button" onClick={() => setPolicyOpen(false)} className={btnPrimary}>I Understand</button>}
      >
        <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
          <p><b>1. Purpose:</b> CUTAS collects registration data only for academic mentorship, bursary endorsements, publication monitoring and resolving research bottlenecks.</p>
          <p><b>2. POPIA:</b> phone numbers, student numbers and research abstracts are protected under the Protection of Personal Information Act. Other scholars see only your name, faculty, biography and CV summary; CV files are never downloadable by others.</p>
          <p><b>3. Categories:</b> Scholar categories (A, B, C) are assigned by the CUTAS steering committee based on your registered degree level.</p>
          <p><b>4. Your rights:</b> you can update your information at any time and permanently delete your account and all your records from your profile page.</p>
        </div>
      </Modal>
    </AuthCard>
  );
};
