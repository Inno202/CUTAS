import React, { useState } from 'react';
import { User, ScholarCategory } from '../types';
import { X, Lock, AlertTriangle, ShieldCheck, UserPlus, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  type: 'LOGIN' | 'REGISTER' | 'CHANGE_PASSWORD' | 'DELETE_ACCOUNT';
  currentUser: User | null;
  onClose: () => void;
  onSwitchType?: (type: 'LOGIN' | 'REGISTER') => void;
  onLoginSuccess: (username: string) => void;
  onRegisterSuccess: (newUser: Omit<User, 'id'>) => void;
  onPasswordChangeSuccess: () => void;
  onDeleteAccountSuccess: () => void;
}

export const AuthModals: React.FC<AuthModalProps> = ({
  isOpen,
  type,
  currentUser,
  onClose,
  onSwitchType,
  onLoginSuccess,
  onRegisterSuccess,
  onPasswordChangeSuccess,
  onDeleteAccountSuccess,
}) => {
  if (!isOpen) return null;

  // Login form
  const [loginUsername, setLoginUsername] = useState('naledi_dlamini');
  const [loginPassword, setLoginPassword] = useState('ScholarPass123!');

  // Register form
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regStudentNum, setRegStudentNum] = useState('');
  const [regCategory, setRegCategory] = useState<ScholarCategory>('CAT_B');
  const [regFaculty, setRegFaculty] = useState('Faculty of Engineering, Built Environment & Information Technology');
  const [regPassword, setRegPassword] = useState('');

  // Password change
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Account deletion
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess(loginUsername);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    onRegisterSuccess({
      username: regUsername,
      email: regEmail,
      firstName: regFirstName,
      lastName: regLastName,
      role: 'SCHOLAR',
      title: 'Mr.',
      category: regCategory,
      faculty: regFaculty,
      department: 'Department of Applied Research',
      studentNumber: regStudentNum,
      bio: 'Newly registered postgraduate scholar pursuing cutting-edge inquiry at Central University of Technology.',
      cvSummaryText: 'CUT Postgraduate Scholar. Academic record maintained in the institutional repository.',
    });
    onClose();
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    onPasswordChangeSuccess();
    onClose();
  };

  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmation.trim() !== 'DELETE') {
      setDeleteError('You must type exactly "DELETE" to confirm account deletion.');
      return;
    }
    onDeleteAccountSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#003261] text-white px-5 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between border-b-2 border-[#FBB927] flex-shrink-0">
          <div className="flex items-center space-x-2">
            {type === 'DELETE_ACCOUNT' ? (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            ) : type === 'CHANGE_PASSWORD' ? (
              <KeyRound className="w-5 h-5 text-[#FBB927]" />
            ) : (
              <Lock className="w-5 h-5 text-[#FBB927]" />
            )}
            <h3 className="text-sm sm:text-base font-bold">
              {type === 'LOGIN' && 'Sign In to CUTAS'}
              {type === 'REGISTER' && 'Register Postgraduate Scholar'}
              {type === 'CHANGE_PASSWORD' && 'Change Account Password'}
              {type === 'DELETE_ACCOUNT' && 'Delete Scholar Account & Data'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white cursor-pointer p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 text-xs text-slate-800 overflow-y-auto">
          {type === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <p className="text-slate-600">
                Sign in with your Central University of Technology academic credentials.
              </p>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Username or Student ID</label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#003261] hover:bg-[#002244] text-white font-bold rounded shadow transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </div>

              <div className="pt-2 text-center text-slate-500 text-[11px] space-y-1.5">
                <div>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => onSwitchType?.('REGISTER')}
                    className="text-[#003261] font-bold hover:underline cursor-pointer"
                  >
                    Register as Scholar
                  </button>
                </div>
                <div className="text-slate-400">
                  Tip: You can also use the role switcher at top right to instantly toggle between accounts.
                </div>
              </div>
            </form>
          )}

          {type === 'REGISTER' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Institutional Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="scholar@postgrad.cut.ac.za"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Portal Username</label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student Number</label>
                  <input
                    type="text"
                    value={regStudentNum}
                    onChange={(e) => setRegStudentNum(e.target.value)}
                    placeholder="20261019"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Scholar Category</label>
                <select
                  value={regCategory}
                  onChange={(e) => setRegCategory(e.target.value as ScholarCategory)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                >
                  <option value="CAT_A">Category A: Doctoral Candidates / Senior Fellows</option>
                  <option value="CAT_B">Category B: Master’s Scholars / Researchers</option>
                  <option value="CAT_C">Category C: Honours & Early Postgraduate Scholars</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Faculty</label>
                <select
                  value={regFaculty}
                  onChange={(e) => setRegFaculty(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                >
                  <option value="Faculty of Engineering, Built Environment & Information Technology">Faculty of Engineering, Built Environment & IT</option>
                  <option value="Faculty of Health & Environmental Sciences">Faculty of Health & Environmental Sciences</option>
                  <option value="Faculty of Management Sciences">Faculty of Management Sciences</option>
                  <option value="Faculty of Humanities">Faculty of Humanities</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
                  required
                  minLength={8}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#FBB927] hover:bg-amber-400 text-slate-900 font-bold rounded shadow transition-colors cursor-pointer"
                >
                  Register as Scholar
                </button>
              </div>

              <div className="pt-2 text-center text-slate-500 text-[11px]">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => onSwitchType?.('LOGIN')}
                  className="text-[#003261] font-bold hover:underline cursor-pointer"
                >
                  Sign In here
                </button>
              </div>
            </form>
          )}

          {type === 'CHANGE_PASSWORD' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <p className="text-slate-600">
                Update account credentials protected with salted PBKDF2 password hashing.
              </p>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
                  required
                  minLength={8}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#003261] hover:bg-[#002244] text-white font-bold rounded shadow transition-colors cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          )}

          {type === 'DELETE_ACCOUNT' && (
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 text-xs">
                <b>Irreversible Warning:</b> Deleting your account will permanently purge your scholar profile, study records, publication entries, challenges, and awards from the CUTAS database.
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Type <span className="font-mono text-red-700 font-extrabold">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => {
                    setDeleteConfirmation(e.target.value);
                    setDeleteError('');
                  }}
                  placeholder="DELETE"
                  className="w-full px-3 py-2 border border-red-300 rounded text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                  required
                />
                {deleteError && (
                  <p className="text-red-600 font-semibold mt-1 text-[11px]">{deleteError}</p>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded transition-colors shadow cursor-pointer"
                >
                  Confirm Account Deletion
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
