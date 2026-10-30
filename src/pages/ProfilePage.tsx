import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle, ArrowRight, Award, Bell, BookOpen, ChevronDown, Download, ExternalLink, FileText, KeyRound, Save,
  Settings, ShieldCheck, Smartphone, Trash2, Upload, User as UserIcon,
} from 'lucide-react';
import { authApi, profileApi } from '../api/endpoints';
import { Avatar } from '../components/Avatar';
import { PageHeader } from '../components/PageHeader';
import { Alert, Field, Modal, Spinner, btnDanger, btnPrimary, btnSecondary, inputClass } from '../components/ui';
import { CATEGORY_DESCRIPTIONS, CATEGORY_LABELS, FACULTIES, ROLE_LABELS, TITLES } from '../constants';
import { useAuth } from '../context/AuthContext';
import { errorMessage, useAction } from '../hooks/useAsync';
import { navigate } from '../router';
import type { MfaSetup, User } from '../types';
import { fullName, initials } from '../utils/format';

type Section = 'personal' | 'security' | 'shortcuts' | 'settings';

const SECTIONS: { id: Section; label: string; heading: string; sub: string; icon: React.ElementType }[] = [
  { id: 'personal', label: 'Personal Details', heading: 'Personal & Academic Details', sub: 'Your identity information and public scholar profile.', icon: UserIcon },
  { id: 'security', label: 'Security & Password', heading: 'Security & Authentication', sub: 'Change your password and manage two-factor authentication.', icon: KeyRound },
  { id: 'shortcuts', label: 'Academic Shortcuts', heading: 'Academic Shortcuts', sub: 'Jump to your research records.', icon: ExternalLink },
  { id: 'settings', label: 'Account Settings', heading: 'Account Settings & Preferences', sub: 'Notification e-mails and account removal.', icon: Settings },
];

const MAX_FILE = 5 * 1024 * 1024;

// ---------------------------------------------------------------- personal details
const PersonalSection: React.FC<{ user: User }> = ({ user }) => {
  const { reloadUser } = useAuth();
  const [form, setForm] = useState({
    firstName: user.firstName, lastName: user.lastName, email: user.email, title: user.title, phone: user.phone,
    faculty: user.faculty || FACULTIES[0].value, department: user.department, studentNumber: user.studentNumber,
    bio: user.bio, cvSummary: user.cvSummaryText,
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const save = useAction();
  const upload = useAction();
  const photoInput = useRef<HTMLInputElement>(null);
  const cvInput = useRef<HTMLInputElement>(null);
  const emailChanged = form.email.trim().toLowerCase() !== user.email.toLowerCase();
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await save.run(async () => {
      await authApi.updateMe({
        firstName: form.firstName.trim(), lastName: form.lastName.trim(),
        ...(emailChanged ? { email: form.email.trim(), currentPassword } : {}),
      });
      await profileApi.update({
        title: form.title, phoneNumber: form.phone.trim(), faculty: form.faculty, department: form.department.trim(),
        studentNumber: form.studentNumber.trim(), bio: form.bio, cvSummaryText: form.cvSummary,
      });
      await reloadUser();
      return true;
    });
    if (ok) {
      setCurrentPassword('');
      flash('Personal details saved.');
    }
  };

  const handleFile = async (field: 'profile_picture' | 'cv_file', file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_FILE) {
      upload.setError('Files must be 5 MB or smaller.');
      return;
    }
    const ok = await upload.run(async () => {
      await profileApi.upload(field, file);
      await reloadUser();
      return true;
    });
    if (ok) flash(field === 'profile_picture' ? 'Profile photo updated.' : 'CV uploaded.');
  };

  const remove = async (what: 'picture' | 'cv') => {
    const ok = await upload.run(async () => {
      await profileApi.update(what === 'picture' ? { removePicture: true } : { removeCv: true });
      await reloadUser();
      return true;
    });
    if (ok) flash(what === 'picture' ? 'Profile photo removed.' : 'CV removed.');
  };

  return (
    <div className="space-y-5">
      {success && <Alert type="success">{success}</Alert>}
      {(save.error || upload.error) && <Alert type="error">{save.error || upload.error}</Alert>}

      {/* Photo & CV */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-[6px] border border-slate-200 bg-slate-50/60 flex items-center gap-4">
          <Avatar name={fullName(user)} initialsText={initials(user.firstName, user.lastName)} pictureUrl={user.pictureUrl} size="xl" />
          <div className="space-y-2 min-w-0">
            <div className="text-xs font-semibold text-slate-800">Profile photo</div>
            <p className="text-[11px] text-slate-500">JPG, PNG or WebP, max 5 MB. Location data is removed automatically.</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => photoInput.current?.click()} disabled={upload.busy} className={`${btnSecondary} min-h-9 px-3`}>
                {upload.busy ? <Spinner className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />} {user.hasPicture ? 'Replace' : 'Upload'}
              </button>
              {user.hasPicture && (
                <button type="button" onClick={() => remove('picture')} disabled={upload.busy} className="text-xs text-red-700 hover:underline cursor-pointer px-1">
                  Remove
                </button>
              )}
            </div>
            <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={(e) => { handleFile('profile_picture', e.target.files?.[0]); e.target.value = ''; }} />
          </div>
        </div>
        <div className="p-4 rounded-[6px] border border-slate-200 bg-slate-50/60 flex items-center gap-4">
          <div className="w-20 h-20 rounded-[6px] bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
            <FileText className="w-8 h-8 text-[#255190]" aria-hidden="true" />
          </div>
          <div className="space-y-2 min-w-0">
            <div className="text-xs font-semibold text-slate-800">Full CV document {user.hasCvFile && <span className="text-emerald-700">(uploaded)</span>}</div>
            <p className="text-[11px] text-slate-500">PDF or TXT, max 5 MB. Only you can download it; others see your CV summary.</p>
            <div className="flex flex-wrap gap-2 items-center">
              <button type="button" onClick={() => cvInput.current?.click()} disabled={upload.busy} className={`${btnSecondary} min-h-9 px-3`}>
                <Upload className="w-3.5 h-3.5" /> {user.hasCvFile ? 'Replace' : 'Upload'}
              </button>
              {user.hasCvFile && (
                <>
                  <button type="button" onClick={() => upload.run(() => profileApi.downloadCv(user.cvFileName || 'CV.pdf'))}
                    className="text-xs text-[#255190] hover:underline cursor-pointer inline-flex items-center gap-1 px-1">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <button type="button" onClick={() => remove('cv')} disabled={upload.busy} className="text-xs text-red-700 hover:underline cursor-pointer px-1">
                    Remove
                  </button>
                </>
              )}
            </div>
            <input ref={cvInput} type="file" accept="application/pdf,.pdf,text/plain,.txt" className="hidden"
              onChange={(e) => { handleFile('cv_file', e.target.files?.[0]); e.target.value = ''; }} />
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr_1fr] gap-4">
          <Field label="Title" error={save.errors.title}>
            {(id) => (
              <select id={id} value={form.title} onChange={(e) => set('title', e.target.value)} className={inputClass}>
                {TITLES.map((t) => <option key={t} value={t}>{t || '—'}</option>)}
              </select>
            )}
          </Field>
          <Field label="First Name" required error={save.errors.firstName}>
            {(id) => <input id={id} type="text" required maxLength={100} autoComplete="given-name" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} className={inputClass} />}
          </Field>
          <Field label="Last Name" required error={save.errors.lastName}>
            {(id) => <input id={id} type="text" required maxLength={100} autoComplete="family-name" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} className={inputClass} />}
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="E-mail address" required error={save.errors.email}>
            {(id) => <input id={id} type="email" required maxLength={254} autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass} />}
          </Field>
          <Field label="Contact Telephone" error={save.errors.phoneNumber} hint="Never shown to other scholars.">
            {(id) => <input id={id} type="tel" maxLength={30} autoComplete="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputClass} />}
          </Field>
        </div>
        {emailChanged && (
          <Field label="Current password (required to change your e-mail)" required error={save.errors.currentPassword}>
            {(id) => <input id={id} type="password" required autoComplete="current-password" value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)} className={`${inputClass} sm:max-w-sm`} />}
          </Field>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Faculty" error={save.errors.faculty}>
            {(id) => (
              <select id={id} value={form.faculty} onChange={(e) => set('faculty', e.target.value)} className={inputClass}>
                {FACULTIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            )}
          </Field>
          <Field label="Department" error={save.errors.department}>
            {(id) => <input id={id} type="text" maxLength={150} value={form.department} onChange={(e) => set('department', e.target.value)} className={inputClass} />}
          </Field>
          <Field label="Student / Staff Number" error={save.errors.studentNumber} hint="Visible to administrators only.">
            {(id) => <input id={id} type="text" maxLength={30} value={form.studentNumber} onChange={(e) => set('studentNumber', e.target.value)} className={inputClass} />}
          </Field>
        </div>

        {user.role === 'SCHOLAR' && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <span className="block font-semibold text-slate-700">Scholar Category</span>
              <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Assigned by the CUTAS committee (read-only)</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-[4px] text-slate-800 font-semibold">
              {CATEGORY_LABELS[user.category]} – {CATEGORY_DESCRIPTIONS[user.category]}
            </div>
          </div>
        )}

        <Field label="Short Biography" error={save.errors.bio} hint={`${form.bio.length} / 2,000 · shown on your directory card`}>
          {(id) => <textarea id={id} rows={3} maxLength={2000} value={form.bio} onChange={(e) => set('bio', e.target.value)} className={`${inputClass} leading-relaxed`} />}
        </Field>
        <Field label="CV Summary (academic background, research interests, qualifications)" error={save.errors.cvSummaryText}
          hint="Visible in-portal to signed-in CUTAS members only. It cannot be downloaded by others.">
          {(id) => <textarea id={id} rows={5} maxLength={6000} value={form.cvSummary} onChange={(e) => set('cvSummary', e.target.value)} className={`${inputClass} leading-relaxed`} />}
        </Field>
        <div className="pt-1">
          <button type="submit" disabled={save.busy} className={btnPrimary}>
            {save.busy ? <Spinner className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />} Save Personal Details
          </button>
        </div>
      </form>
    </div>
  );
};

// ---------------------------------------------------------------- security
const SecuritySection: React.FC<{ user: User }> = ({ user }) => {
  const { logout, reloadUser } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const pw = useAction();
  const [setup, setSetup] = useState<MfaSetup | null>(null);
  const [mfaPassword, setMfaPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaMode, setMfaMode] = useState<'idle' | 'password' | 'code' | 'disable'>('idle');
  const [mfaMessage, setMfaMessage] = useState<string | null>(null);
  const mfa = useAction();

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      pw.setError('New passwords do not match.');
      return;
    }
    const res = await pw.run(() => authApi.changePassword(current, next));
    if (res) {
      await logout('Your password was changed and all devices were signed out. Please sign in with your new password.');
      navigate('login');
    }
  };

  const startSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await mfa.run(() => authApi.mfaSetup(mfaPassword));
    if (res) {
      setSetup(res);
      setMfaPassword('');
      setMfaMode('code');
    }
  };

  const confirmSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await mfa.run(() => authApi.mfaConfirm(mfaCode.replace(/\s/g, '')));
    if (res) {
      setSetup(null);
      setMfaCode('');
      setMfaMode('idle');
      setMfaMessage('Two-factor authentication is on. You will be asked for a code each time you sign in.');
      await reloadUser();
    }
  };

  const disable = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await mfa.run(() => authApi.mfaDisable(mfaPassword, mfaCode.replace(/\s/g, '')));
    if (res) {
      setMfaPassword('');
      setMfaCode('');
      setMfaMode('idle');
      setMfaMessage('Two-factor authentication has been turned off.');
      await reloadUser();
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={changePassword} className="space-y-4 text-xs max-w-md">
        <h3 className="text-sm font-semibold text-[#255190]">Change password</h3>
        {pw.error && <Alert type="error">{pw.errors.oldPassword || pw.errors.newPassword || pw.error}</Alert>}
        <Field label="Current Password" required>
          {(id) => <input id={id} type="password" required autoComplete="current-password" maxLength={256} value={current} onChange={(e) => setCurrent(e.target.value)} className={inputClass} />}
        </Field>
        <Field label="New Password" required hint="At least 8 characters with letters and numbers.">
          {(id) => <input id={id} type="password" required minLength={8} maxLength={128} autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={inputClass} />}
        </Field>
        <Field label="Confirm New Password" required>
          {(id) => <input id={id} type="password" required minLength={8} maxLength={128} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />}
        </Field>
        <p className="text-[11px] text-slate-500">For your safety, changing your password signs you out on every device.</p>
        <button type="submit" disabled={pw.busy} className={btnPrimary}>
          {pw.busy ? <Spinner className="w-3.5 h-3.5" /> : <KeyRound className="w-3.5 h-3.5" />} Update Password
        </button>
      </form>

      <div className="pt-6 border-t border-slate-200 space-y-4 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-[#255190] flex items-center gap-1.5"><Smartphone className="w-4 h-4" /> Two-factor authentication</h3>
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${user.mfaEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
            {user.mfaEnabled ? 'On' : 'Off'}
          </span>
          {user.mfaRequired && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">Required for administrators</span>}
        </div>
        <p className="text-slate-600 max-w-xl">
          A code from an authenticator app (Microsoft Authenticator, Google Authenticator) is needed in addition to your password, so a stolen password alone cannot open your account.
        </p>
        {mfaMessage && <Alert type="success" onClose={() => setMfaMessage(null)}>{mfaMessage}</Alert>}
        {mfa.error && <Alert type="error">{mfa.errors.password || mfa.errors.code || mfa.error}</Alert>}

        {!user.mfaEnabled && mfaMode === 'idle' && (
          <button type="button" onClick={() => { mfa.clear(); setMfaMode('password'); }} className={btnPrimary}>
            <ShieldCheck className="w-3.5 h-3.5" /> Turn on two-factor
          </button>
        )}
        {mfaMode === 'password' && (
          <form onSubmit={startSetup} className="space-y-3 max-w-sm">
            <Field label="Confirm your password" required>
              {(id) => <input id={id} type="password" required autoComplete="current-password" value={mfaPassword} onChange={(e) => setMfaPassword(e.target.value)} className={inputClass} />}
            </Field>
            <div className="flex gap-2">
              <button type="button" onClick={() => setMfaMode('idle')} className={btnSecondary}>Cancel</button>
              <button type="submit" disabled={mfa.busy} className={btnPrimary}>{mfa.busy && <Spinner className="w-3.5 h-3.5" />} Continue</button>
            </div>
          </form>
        )}
        {mfaMode === 'code' && setup && (
          <form onSubmit={confirmSetup} className="space-y-3 max-w-lg">
            <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-[6px]">
              <img src={setup.qrSvg} alt="QR code for your authenticator app" className="w-40 h-40 bg-white p-1 rounded border border-slate-200" />
              <div className="min-w-0 text-center sm:text-left space-y-1">
                <p>Scan the QR code with your authenticator app, or enter this setup key:</p>
                <code className="font-mono text-xs font-bold text-slate-900 break-all select-all block">{setup.secret}</code>
              </div>
            </div>
            <Field label="6-digit code from the app" required>
              {(id) => <input id={id} type="text" inputMode="numeric" autoComplete="one-time-code" required maxLength={7}
                value={mfaCode} onChange={(e) => setMfaCode(e.target.value.replace(/[^\d ]/g, ''))} className={`${inputClass} font-mono tracking-widest sm:max-w-[200px]`} />}
            </Field>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setMfaMode('idle'); setSetup(null); }} className={btnSecondary}>Cancel</button>
              <button type="submit" disabled={mfa.busy} className={btnPrimary}>{mfa.busy && <Spinner className="w-3.5 h-3.5" />} Activate</button>
            </div>
          </form>
        )}
        {user.mfaEnabled && !user.mfaRequired && mfaMode === 'idle' && (
          <button type="button" onClick={() => { mfa.clear(); setMfaMode('disable'); }} className={btnSecondary}>Turn off two-factor</button>
        )}
        {mfaMode === 'disable' && (
          <form onSubmit={disable} className="space-y-3 max-w-sm">
            <Field label="Password" required>
              {(id) => <input id={id} type="password" required autoComplete="current-password" value={mfaPassword} onChange={(e) => setMfaPassword(e.target.value)} className={inputClass} />}
            </Field>
            <Field label="Current 6-digit code" required>
              {(id) => <input id={id} type="text" inputMode="numeric" autoComplete="one-time-code" required maxLength={7}
                value={mfaCode} onChange={(e) => setMfaCode(e.target.value.replace(/[^\d ]/g, ''))} className={`${inputClass} font-mono tracking-widest`} />}
            </Field>
            <div className="flex gap-2">
              <button type="button" onClick={() => setMfaMode('idle')} className={btnSecondary}>Cancel</button>
              <button type="submit" disabled={mfa.busy} className={btnDanger}>{mfa.busy && <Spinner className="w-3.5 h-3.5" />} Turn off</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- shortcuts
const ShortcutsSection: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    {([
      ['studies', BookOpen, 'Study Details', 'Supervisor, timeline and topic dossier.', 'Open Study Details'],
      ['publications', FileText, 'Publication Record', 'Journal articles, chapters and proceedings.', 'Manage Publications'],
      ['awards', Award, 'Awards & Honours', 'Fellowships, conference awards and recognitions.', 'View Awards'],
    ] as const).map(([tab, Icon, title, text, cta]) => (
      <button key={tab} type="button" onClick={() => navigate(tab)}
        className="p-4 rounded-[6px] border border-slate-200 hover:border-[#255190] hover:bg-blue-50/40 text-left transition-colors cursor-pointer group flex flex-col justify-between">
        <div>
          <div className="w-8 h-8 rounded-[4px] bg-blue-100 text-[#255190] flex items-center justify-center mb-2.5"><Icon className="w-4 h-4" /></div>
          <span className="font-semibold text-xs text-slate-900 block group-hover:text-[#255190]">{title}</span>
          <span className="text-[11px] text-slate-500 block mt-1 leading-snug">{text}</span>
        </div>
        <div className="mt-3 flex items-center text-[11px] font-bold text-[#255190]">
          <span>{cta}</span>
          <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
        </div>
      </button>
    ))}
  </div>
);

// ---------------------------------------------------------------- settings & deletion
const SettingsSection: React.FC<{ user: User }> = ({ user }) => {
  const { reloadUser, logout } = useAuth();
  const [prefs, setPrefs] = useState({ notifyFunding: user.notifyFunding, notifyWorkshops: user.notifyWorkshops, notifyChallenges: user.notifyChallenges });
  const [saved, setSaved] = useState(false);
  const save = useAction();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteText, setDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const savePrefs = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await save.run(async () => {
      await profileApi.update(prefs);
      await reloadUser();
      return true;
    });
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const confirmDelete = async () => {
    setDeleteError(null);
    if (deleteText.trim() !== 'DELETE') {
      setDeleteError('Type DELETE (in capitals) to confirm.');
      return;
    }
    setDeleting(true);
    try {
      await authApi.deleteMe(deletePassword, deleteText.trim());
      await logout('Your account and all your records have been permanently deleted.');
      navigate('landing');
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const options: { key: keyof typeof prefs; label: string }[] = [
    { key: 'notifyFunding', label: 'E-mail me when new postgraduate bursaries or grants are published' },
    { key: 'notifyWorkshops', label: 'Workshop & methodology seminar announcements' },
    { key: 'notifyChallenges', label: 'Updates when an administrator reviews one of my challenges' },
  ];

  return (
    <div className="space-y-8">
      <form onSubmit={savePrefs} className="space-y-4 text-xs">
        {saved && <Alert type="success">Notification preferences saved.</Alert>}
        {save.error && <Alert type="error">{save.error}</Alert>}
        <fieldset className="space-y-3">
          <legend className="font-semibold text-slate-800 text-xs flex items-center gap-1.5 mb-1"><Bell className="w-3.5 h-3.5 text-[#255190]" /> E-mail notifications</legend>
          {options.map((o) => (
            <label key={o.key} className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={prefs[o.key]} onChange={(e) => setPrefs((p) => ({ ...p, [o.key]: e.target.checked }))}
                className="rounded text-[#255190] focus:ring-[#255190] w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-slate-700">{o.label}</span>
            </label>
          ))}
        </fieldset>
        <button type="submit" disabled={save.busy} className={btnPrimary}>
          {save.busy ? <Spinner className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />} Save Preferences
        </button>
      </form>

      {user.role === 'SCHOLAR' ? (
        <div className="pt-6 border-t border-slate-200">
          <div className="bg-red-50/70 border border-red-200 rounded-[6px] p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-red-900 flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5 text-red-600" /> Delete Scholar Account & Data</h3>
              <p className="text-[11px] text-red-700 mt-1 max-w-lg leading-relaxed">
                Permanently removes your profile, study record, publications, challenges, growth plan, awards and uploaded files. This cannot be undone.
              </p>
            </div>
            <button type="button" onClick={() => { setDeleteOpen(true); setDeletePassword(''); setDeleteText(''); setDeleteError(null); }} className={`${btnDanger} flex-shrink-0`}>
              Delete Account
            </button>
          </div>
        </div>
      ) : (
        <p className="pt-6 border-t border-slate-200 text-[11px] text-slate-500">
          Administrator accounts cannot be self-deleted. Ask the Super Administrator to deactivate the account instead.
        </p>
      )}

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        size="sm"
        title={<span className="flex items-center gap-2 text-red-700"><AlertCircle className="w-5 h-5" /> Permanently delete your account</span>}
        footer={
          <>
            <button type="button" onClick={() => setDeleteOpen(false)} className={btnSecondary} disabled={deleting}>Cancel</button>
            <button type="button" onClick={confirmDelete} className={btnDanger} disabled={deleting}>
              {deleting && <Spinner className="w-3.5 h-3.5" />} Permanently Delete
            </button>
          </>
        }
      >
        {deleteError && <Alert type="error">{deleteError}</Alert>}
        <p className="text-xs text-slate-600 leading-relaxed">
          All records for <b>{fullName(user)}</b> will be purged from the CUTAS database.
        </p>
        <Field label="Your password" required>
          {(id) => <input id={id} type="password" autoComplete="current-password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} className={inputClass} />}
        </Field>
        <Field label='Type "DELETE" to confirm' required>
          {(id) => <input id={id} type="text" autoCapitalize="characters" value={deleteText} onChange={(e) => setDeleteText(e.target.value)} placeholder="DELETE"
            className={`${inputClass} font-mono uppercase`} />}
        </Field>
      </Modal>
    </div>
  );
};

// ---------------------------------------------------------------- page shell
export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [active, setActive] = useState<Section>('personal');
  const [mobileOpen, setMobileOpen] = useState<Section | null>('personal');
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.location.hash === '#security') {
      setActive('security');
      setMobileOpen('security');
    }
  }, []);

  if (!user) return null;

  const select = (s: Section) => {
    setActive(s);
    setMobileOpen(s);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const body = (s: Section) =>
    s === 'personal' ? <PersonalSection key={user.id} user={user} />
      : s === 'security' ? <SecuritySection user={user} />
        : s === 'shortcuts' ? <ShortcutsSection />
          : <SettingsSection user={user} />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="SCHOLAR DOSSIER & PROFILE"
        title="My Profile & Account Settings"
        description="Manage your scholar profile, security settings, academic record shortcuts, and notification preferences."
        badge={
          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#255190] text-white px-2 py-0.5 rounded-[4px]">
            {ROLE_LABELS[user.role]}{user.role === 'SCHOLAR' && ` · ${CATEGORY_LABELS[user.category]}`}
          </span>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <aside className="hidden lg:block bg-white rounded-[6px] border border-[#E2E8F0] shadow-xs overflow-hidden lg:sticky lg:top-28">
          <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <Avatar name={fullName(user)} initialsText={initials(user.firstName, user.lastName)} pictureUrl={user.pictureUrl} size="sm" className="w-10 h-10" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#255190] block truncate">{fullName(user)}</span>
              <span className="text-[11px] text-slate-500 block truncate">{user.email}</span>
            </div>
          </div>
          <nav aria-label="Profile sections" className="p-2 space-y-1 text-xs">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => select(id)} aria-current={active === id ? 'true' : undefined}
                className={`w-full text-left px-3 py-2.5 rounded-[4px] font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  active === id ? 'bg-[#255190] text-white' : 'text-slate-700 hover:bg-slate-50'
                }`}>
                <Icon className="w-4 h-4" /> <span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div ref={topRef} className="lg:col-span-3 space-y-4 scroll-mt-28">
          {SECTIONS.map(({ id, label, heading, sub, icon: Icon }) => (
            <section key={id} className={`bg-white rounded-[6px] border border-[#E2E8F0] shadow-xs overflow-hidden ${active !== id ? 'lg:hidden' : ''}`}>
              <button type="button" onClick={() => setMobileOpen((p) => (p === id ? null : id))} aria-expanded={mobileOpen === id}
                className="lg:hidden w-full px-4 py-3.5 bg-slate-50 flex items-center justify-between border-b border-slate-100 text-left font-semibold text-xs text-[#255190] cursor-pointer">
                <span className="flex items-center gap-2"><Icon className="w-4 h-4" /> {label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileOpen === id ? 'rotate-180' : ''}`} />
              </button>
              <div className="hidden lg:block px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm font-semibold text-[#255190]">{heading}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
              </div>
              {/* Mobile shows the open accordion; desktop shows the active tab. */}
              <div className={`p-4 sm:p-6 ${mobileOpen === id ? 'block' : 'hidden'} ${active === id ? 'lg:block' : 'lg:hidden'}`}>
                {(mobileOpen === id || active === id) && body(id)}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};
