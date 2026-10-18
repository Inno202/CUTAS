import React, { useState } from 'react';
import { User, TabId, ScholarCategory } from '../types';
import { PageHeader } from '../components/PageHeader';
import { 
  User as UserIcon, Shield, KeyRound, ExternalLink, Settings, 
  Trash2, CheckCircle2, AlertCircle, Upload, BookOpen, Award, 
  FileText, ArrowRight, Bell, Save, ChevronDown
} from 'lucide-react';

interface ProfilePageProps {
  currentUser: User | null;
  users: User[];
  onUpdateUser: (updatedUser: User) => void;
  onSwitchUser: (userId: string | null) => void;
  onNavigate: (tab: TabId) => void;
  onDeleteAccount: () => void;
}

type ProfileTab = 'personal' | 'security' | 'shortcuts' | 'settings' | 'roles';

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  users,
  onUpdateUser,
  onSwitchUser,
  onNavigate,
  onDeleteAccount,
}) => {
  if (!currentUser) {
    return (
      <div className="bg-white rounded-[6px] border border-[#E2E8F0] p-8 text-center max-w-lg mx-auto my-12 shadow-xs">
        <Shield className="w-10 h-10 text-[#255190] mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-[#255190]">Authentication Required</h2>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          You must be signed in to access your scholar profile and security dossier.
        </p>
        <button
          onClick={() => onNavigate('login')}
          className="mt-5 h-11 px-6 bg-[#255190] hover:bg-[#183765] text-white font-semibold text-xs rounded-[4px] cursor-pointer transition-colors"
        >
          Proceed to Sign in
        </button>
      </div>
    );
  }

  // Active section for desktop tabs
  const [activeSection, setActiveSection] = useState<ProfileTab>('personal');

  // Mobile accordion states (each can be toggled open/closed)
  const [mobileSections, setMobileSections] = useState<Record<ProfileTab, boolean>>({
    personal: true,
    security: false,
    shortcuts: false,
    settings: false,
    roles: false,
  });

  const toggleMobileSection = (section: ProfileTab) => {
    setMobileSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // 1. Personal Details Form State
  const [firstName, setFirstName] = useState(currentUser.firstName);
  const [lastName, setLastName] = useState(currentUser.lastName);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '+27 51 507 3911');
  const [faculty, setFaculty] = useState(currentUser.faculty || 'Engineering, Built Env & IT');
  const [department, setDepartment] = useState(currentUser.department || 'Applied Research');
  const [studentNumber, setStudentNumber] = useState(currentUser.studentNumber || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [cvSummary, setCvSummary] = useState(currentUser.cvSummaryText || '');
  const [category, setCategory] = useState<ScholarCategory>(currentUser.category || 'CAT_B');

  const [personalSuccess, setPersonalSuccess] = useState<string | null>(null);

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      faculty,
      department,
      studentNumber,
      avatarUrl: avatarUrl.trim() || undefined,
      cvSummaryText: cvSummary.trim(),
      category: currentUser.role !== 'SCHOLAR' ? category : currentUser.category,
    });
    setPersonalSuccess('Personal details updated successfully.');
    setTimeout(() => setPersonalSuccess(null), 3000);
  };

  // 2. Security / Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);
    setSecuritySuccess(null);

    if (newPassword.length < 8) {
      setSecurityError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityError('New passwords do not match.');
      return;
    }

    setSecuritySuccess('Account security credentials updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSecuritySuccess(null), 3500);
  };

  // 3. Settings / Notifications State
  const [emailFundingAlerts, setEmailFundingAlerts] = useState(true);
  const [emailWorkshopAlerts, setEmailWorkshopAlerts] = useState(true);
  const [emailReviewUpdates, setEmailReviewUpdates] = useState(true);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccess('Notification and portal preferences saved.');
    setTimeout(() => setSettingsSuccess(null), 3000);
  };

  // Delete account confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const confirmDelete = () => {
    if (deleteInput.trim() !== 'DELETE') {
      setDeleteError('Please type exactly "DELETE" to verify.');
      return;
    }
    setShowDeleteModal(false);
    onDeleteAccount();
  };

  // Roles available for this user
  const canSwitchRole = users.length > 1;

  return (
    <div className="space-y-6">
      {/* Page Header Stack (Task 2) */}
      <PageHeader
        eyebrow="SCHOLAR DOSSIER & PROFILE"
        title="My Profile & Account Settings"
        description="Manage your institutional scholar credentials, security settings, academic record shortcuts, and notification preferences."
        badge={
          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#255190] text-white px-2 py-0.5 rounded-[4px]">
            {currentUser.role.replace('_', ' ')}
            {currentUser.category && ` · ${currentUser.category.replace('_', ' ')}`}
          </span>
        }
      />

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Sidebar Navigation Tabs (>= 1024px) */}
        <div className="hidden lg:block bg-white rounded-[6px] border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center space-x-3 bg-slate-50/50">
            <div className="w-10 h-10 rounded-full bg-[#255190] text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
              {currentUser.firstName[0]}{currentUser.lastName[0]}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#255190] block truncate">
                {currentUser.title} {currentUser.firstName} {currentUser.lastName}
              </span>
              <span className="text-[11px] text-slate-500 block truncate">
                {currentUser.email}
              </span>
            </div>
          </div>

          <nav className="p-2 space-y-1 text-xs">
            <button
              onClick={() => setActiveSection('personal')}
              className={`w-full text-left px-3 py-2.5 rounded-[4px] font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeSection === 'personal'
                  ? 'bg-[#255190] text-white'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Personal Details</span>
            </button>

            <button
              onClick={() => setActiveSection('security')}
              className={`w-full text-left px-3 py-2.5 rounded-[4px] font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeSection === 'security'
                  ? 'bg-[#255190] text-white'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Security & Password</span>
            </button>

            <button
              onClick={() => setActiveSection('shortcuts')}
              className={`w-full text-left px-3 py-2.5 rounded-[4px] font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeSection === 'shortcuts'
                  ? 'bg-[#255190] text-white'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ExternalLink className="w-4 h-4" />
              <span>Academic Shortcuts</span>
            </button>

            <button
              onClick={() => setActiveSection('settings')}
              className={`w-full text-left px-3 py-2.5 rounded-[4px] font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeSection === 'settings'
                  ? 'bg-[#255190] text-white'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Account Settings</span>
            </button>

            {canSwitchRole && (
              <button
                onClick={() => setActiveSection('roles')}
                className={`w-full text-left px-3 py-2.5 rounded-[4px] font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  activeSection === 'roles'
                    ? 'bg-[#255190] text-white'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Role Switcher</span>
              </button>
            )}
          </nav>
        </div>

        {/* Content Area (Desktop tab panel or Mobile collapsible accordions) */}
        <div className="lg:col-span-3 space-y-4">
          {/* ============================================================== */}
          {/* SECTION 1: PERSONAL DETAILS */}
          {/* ============================================================== */}
          <div className="bg-white rounded-[6px] border border-[#E2E8F0] shadow-xs overflow-hidden">
            {/* Mobile accordion toggle header */}
            <button
              type="button"
              onClick={() => toggleMobileSection('personal')}
              className="lg:hidden w-full px-4 py-3 bg-slate-50 flex items-center justify-between border-b border-slate-100 text-left font-semibold text-xs text-[#255190] cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" /> Personal Details
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileSections.personal ? 'rotate-180' : ''}`} />
            </button>

            {/* Desktop section header (hidden on mobile) */}
            <div className="hidden lg:block px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-semibold text-[#255190]">Personal & Academic Details</h2>
              <p className="text-xs text-slate-500 mt-0.5">Manage your identity information and public scholar profile.</p>
            </div>

            {/* Section body */}
            <div className={`p-4 sm:p-6 ${!mobileSections.personal ? 'hidden lg:block' : ''} ${activeSection !== 'personal' ? 'lg:hidden' : ''}`}>
              {personalSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[4px] text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{personalSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSavePersonal} className="space-y-4 text-xs">
                {/* Names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190]"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Institutional Email *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Contact Telephone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190]"
                    />
                  </div>
                </div>

                {/* Profile Picture Simulation */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Profile Photo URL or Avatar</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... or leave blank for initials"
                      className="flex-1 px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190]"
                    />
                    <label className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[4px] flex items-center gap-1.5 cursor-pointer font-semibold border border-slate-300">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setAvatarUrl(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Faculty & Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Faculty</label>
                    <input
                      type="text"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190]"
                    />
                  </div>
                </div>

                {/* Category: Read-only for scholars, editable by admin */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">Scholar Category</label>
                    {currentUser.role === 'SCHOLAR' ? (
                      <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Assigned by Academic Executive (Read-Only)
                      </span>
                    ) : (
                      <span className="text-[10px] text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Admin Editable
                      </span>
                    )}
                  </div>
                  {currentUser.role === 'SCHOLAR' ? (
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-[4px] text-slate-800 font-semibold flex items-center justify-between">
                      <span>{category.replace('_', ' ')} - Postgraduate Researcher</span>
                      <span className="text-[10px] text-slate-500 font-normal">CUT Institutional Registry</span>
                    </div>
                  ) : (
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ScholarCategory)}
                      className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] bg-white"
                    >
                      <option value="CAT_A">Category A - Proposal & Candidacy</option>
                      <option value="CAT_B">Category B - Advanced Thesis & Defense</option>
                      <option value="CAT_C">Category C - Postdoctoral Fellow</option>
                    </select>
                  )}
                </div>

                {/* Short CV Summary (Viewable and editable, not downloadable) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">Scholar Biography & CV Summary</label>
                    <span className="text-[10px] text-slate-400">POPIA Protected (View-Only in Portal)</span>
                  </div>
                  <textarea
                    rows={4}
                    value={cvSummary}
                    onChange={(e) => setCvSummary(e.target.value)}
                    placeholder="Brief summary of academic background, research interests, and qualifications..."
                    className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    This academic summary is visible to vetted CUT researchers and reviewers. Direct file downloads remain restricted.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="h-11 px-6 bg-[#255190] hover:bg-[#183765] text-white font-semibold rounded-[4px] text-xs transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Personal Details</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION 2: SECURITY */}
          {/* ============================================================== */}
          <div className="bg-white rounded-[6px] border border-[#E2E8F0] shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleMobileSection('security')}
              className="lg:hidden w-full px-4 py-3 bg-slate-50 flex items-center justify-between border-b border-slate-100 text-left font-semibold text-xs text-[#255190] cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <KeyRound className="w-4 h-4" /> Security & Password
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileSections.security ? 'rotate-180' : ''}`} />
            </button>

            <div className="hidden lg:block px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-semibold text-[#255190]">Security & Authentication</h2>
              <p className="text-xs text-slate-500 mt-0.5">Change your institutional password and manage login access.</p>
            </div>

            <div className={`p-4 sm:p-6 ${!mobileSections.security ? 'hidden lg:block' : ''} ${activeSection !== 'security' ? 'lg:hidden' : ''}`}>
              {securityError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-[4px] text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">{securityError}</div>
                </div>
              )}

              {securitySuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[4px] text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{securitySuccess}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs max-w-md">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current Password *</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Password *</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="h-11 px-6 bg-[#255190] hover:bg-[#183765] text-white font-semibold rounded-[4px] text-xs transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION 3: ACADEMIC SHORTCUTS */}
          {/* ============================================================== */}
          <div className="bg-white rounded-[6px] border border-[#E2E8F0] shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleMobileSection('shortcuts')}
              className="lg:hidden w-full px-4 py-3 bg-slate-50 flex items-center justify-between border-b border-slate-100 text-left font-semibold text-xs text-[#255190] cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" /> Academic Shortcuts
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileSections.shortcuts ? 'rotate-180' : ''}`} />
            </button>

            <div className="hidden lg:block px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-semibold text-[#255190]">Academic Shortcuts</h2>
              <p className="text-xs text-slate-500 mt-0.5">Jump directly to your research records, publications, and milestone plans.</p>
            </div>

            <div className={`p-4 sm:p-6 ${!mobileSections.shortcuts ? 'hidden lg:block' : ''} ${activeSection !== 'shortcuts' ? 'lg:hidden' : ''}`}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('studies')}
                  className="p-4 rounded-[6px] border border-slate-200 hover:border-[#255190] hover:bg-blue-50/40 text-left transition-colors cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-8 h-8 rounded-[4px] bg-blue-100 text-[#255190] flex items-center justify-center mb-2.5">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-xs text-slate-900 block group-hover:text-[#255190]">
                      Study Details
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1 leading-snug">
                      View and edit supervisor, timeline, and topic dossier.
                    </span>
                  </div>
                  <div className="mt-3 flex items-center text-[11px] font-bold text-[#255190]">
                    <span>Open Study Details</span>
                    <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('publications')}
                  className="p-4 rounded-[6px] border border-slate-200 hover:border-[#255190] hover:bg-blue-50/40 text-left transition-colors cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-8 h-8 rounded-[4px] bg-blue-100 text-[#255190] flex items-center justify-center mb-2.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-xs text-slate-900 block group-hover:text-[#255190]">
                      Publication Record
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1 leading-snug">
                      Record DHET-accredited journal articles and chapters.
                    </span>
                  </div>
                  <div className="mt-3 flex items-center text-[11px] font-bold text-[#255190]">
                    <span>Manage Publications</span>
                    <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('awards')}
                  className="p-4 rounded-[6px] border border-slate-200 hover:border-[#255190] hover:bg-blue-50/40 text-left transition-colors cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-8 h-8 rounded-[4px] bg-amber-100 text-amber-800 flex items-center justify-center mb-2.5">
                      <Award className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-xs text-slate-900 block group-hover:text-[#255190]">
                      Awards & Honours
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1 leading-snug">
                      Log national fellowships, conference awards, and recognitions.
                    </span>
                  </div>
                  <div className="mt-3 flex items-center text-[11px] font-bold text-[#255190]">
                    <span>View Awards</span>
                    <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION 4: ACCOUNT SETTINGS */}
          {/* ============================================================== */}
          <div className="bg-white rounded-[6px] border border-[#E2E8F0] shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleMobileSection('settings')}
              className="lg:hidden w-full px-4 py-3 bg-slate-50 flex items-center justify-between border-b border-slate-100 text-left font-semibold text-xs text-[#255190] cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" /> Account Settings
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileSections.settings ? 'rotate-180' : ''}`} />
            </button>

            <div className="hidden lg:block px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-semibold text-[#255190]">Account Settings & Preferences</h2>
              <p className="text-xs text-slate-500 mt-0.5">Control notification alerts and manage account lifecycle.</p>
            </div>

            <div className={`p-4 sm:p-6 ${!mobileSections.settings ? 'hidden lg:block' : ''} ${activeSection !== 'settings' ? 'lg:hidden' : ''}`}>
              {settingsSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[4px] text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{settingsSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div className="space-y-2.5">
                  <span className="font-semibold text-slate-800 block text-xs flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[#255190]" />
                    Email Notification Subscriptions
                  </span>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailFundingAlerts}
                      onChange={(e) => setEmailFundingAlerts(e.target.checked)}
                      className="rounded text-[#255190] focus:ring-[#255190]"
                    />
                    <span className="text-slate-700">Receive alerts when new postgraduate bursaries or grants are published</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailWorkshopAlerts}
                      onChange={(e) => setEmailWorkshopAlerts(e.target.checked)}
                      className="rounded text-[#255190] focus:ring-[#255190]"
                    />
                    <span className="text-slate-700">Workshop & methodology seminar announcements</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailReviewUpdates}
                      onChange={(e) => setEmailReviewUpdates(e.target.checked)}
                      className="rounded text-[#255190] focus:ring-[#255190]"
                    />
                    <span className="text-slate-700">Peer challenge resolution and review notifications</span>
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="h-11 px-6 bg-[#255190] hover:bg-[#183765] text-white font-semibold rounded-[4px] text-xs transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Preferences</span>
                  </button>
                </div>
              </form>

              {/* Danger Zone: Account Deletion */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="bg-red-50/70 border border-red-200 rounded-[6px] p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        Delete Scholar Account & Data
                      </h3>
                      <p className="text-[11px] text-red-700 mt-1 max-w-lg leading-relaxed">
                        Permanently purge your scholar profile, study records, and associated publications from the CUT Academic Society portal. This action is irreversible.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setDeleteInput('');
                        setDeleteError(null);
                        setShowDeleteModal(true);
                      }}
                      className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-[4px] text-xs cursor-pointer transition-colors shadow-xs"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION 5: ROLE SWITCHING */}
          {/* ============================================================== */}
          {canSwitchRole && (
            <div className="bg-white rounded-[6px] border border-[#E2E8F0] shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => toggleMobileSection('roles')}
                className="lg:hidden w-full px-4 py-3 bg-slate-50 flex items-center justify-between border-b border-slate-100 text-left font-semibold text-xs text-[#255190] cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Switch Role / Test Profile
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileSections.roles ? 'rotate-180' : ''}`} />
              </button>

              <div className="hidden lg:block px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm font-semibold text-[#255190]">Institutional Role Switcher</h2>
                <p className="text-xs text-slate-500 mt-0.5">Switch active user session between verified scholar and administrator accounts.</p>
              </div>

              <div className={`p-4 sm:p-6 ${!mobileSections.roles ? 'hidden lg:block' : ''} ${activeSection !== 'roles' ? 'lg:hidden' : ''}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {users.map((u) => {
                    const isCurrent = u.id === currentUser.id;
                    return (
                      <div
                        key={u.id}
                        className={`p-3 rounded-[6px] border flex items-center justify-between gap-3 ${
                          isCurrent
                            ? 'bg-blue-50/70 border-[#255190]'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate">
                            {u.title} {u.firstName} {u.lastName}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {u.role.replace('_', ' ')} {u.category && `· ${u.category.replace('_', ' ')}`}
                          </span>
                        </div>

                        {isCurrent ? (
                          <span className="text-[10px] font-bold uppercase text-[#255190] bg-[#255190]/10 px-2 py-1 rounded-[4px]">
                            Active
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSwitchUser(u.id)}
                            className="px-3 py-1.5 bg-[#255190] hover:bg-[#183765] text-white font-semibold text-xs rounded-[4px] cursor-pointer transition-colors"
                          >
                            Switch
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[6px] border border-slate-300 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>Confirm Permanent Account Deletion</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete your scholar profile for <b>{currentUser.firstName} {currentUser.lastName}</b>? All your registered study records and publications will be purged from the institutional database.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Type <span className="text-red-600 font-mono">DELETE</span> below to confirm:
              </label>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 text-xs rounded-[4px] border border-slate-300 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              {deleteError && (
                <span className="text-red-600 text-[11px] mt-1 block">{deleteError}</span>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[4px] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-[4px] text-xs font-bold cursor-pointer"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
