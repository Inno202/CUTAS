import React, { useEffect, useState } from 'react';
import { KeyRound, Plus, Search, Smartphone, UserCheck, UserX } from 'lucide-react';
import { adminApi } from '../../api/endpoints';
import { Alert, ConfirmDialog, ErrorBlock, Field, LoadingBlock, Modal, Spinner, StatusPill, btnAccent, btnPrimary, btnSecondary, inputClass } from '../../components/ui';
import { ROLE_LABELS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { errorMessage, useAction } from '../../hooks/useAsync';
import type { AdminUser, Paginated, UserRole } from '../../types';
import { formatDateTime } from '../../utils/format';
import { FilterChips, Pager, SectionCard, SectionProps, useDebounced } from './shared';

type RoleFilter = UserRole | '';
const blank = { username: '', email: '', firstName: '', lastName: '', role: 'ADMIN' as UserRole, password: '' };

export const UsersSection: React.FC<SectionProps> = ({ onChanged }) => {
  const { user: me } = useAuth();
  const [role, setRole] = useState<RoleFilter>('');
  const [search, setSearch] = useState('');
  const query = useDebounced(search);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<AdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('ADMIN');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState<{ kind: 'toggle' | 'mfa'; user: AdminUser } | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const save = useAction();

  useEffect(() => setPage(1), [role, query]);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    adminApi.users({ role, search: query, page })
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(errorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [role, query, page, reloadKey]);

  const done = (text: string) => {
    setNotice({ type: 'success', text });
    setReloadKey((k) => k + 1);
    onChanged();
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await save.run(() => adminApi.createUser(form));
    if (res) {
      setCreateOpen(false);
      setForm(blank);
      done(`${res.username} created as ${ROLE_LABELS[res.role]}. They will set up two-factor authentication at first sign-in.`);
    }
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const res = await save.run(() => adminApi.updateUser(editing.id, { role: editRole, ...(newPassword ? { password: newPassword } : {}) }));
    if (res) {
      setEditing(null);
      setNewPassword('');
      done(`${res.username} updated${newPassword ? ' (password reset; their sessions were signed out)' : ''}.`);
    }
  };

  const runConfirm = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      if (confirm.kind === 'toggle') {
        const res = await adminApi.updateUser(confirm.user.id, { isActive: !confirm.user.isActive });
        done(`${res.username} ${res.isActive ? 'reactivated' : 'deactivated and signed out everywhere'}.`);
      } else {
        await adminApi.resetUserMfa(confirm.user.id);
        done(`Two-factor reset for ${confirm.user.username}. They will enrol again at next sign-in.`);
      }
    } catch (e) {
      setNotice({ type: 'error', text: errorMessage(e) });
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  const rows = data?.results ?? [];
  const actions = (u: AdminUser) => (
    <div className="flex flex-wrap gap-1.5 justify-end">
      <button type="button" onClick={() => { save.clear(); setEditing(u); setEditRole(u.role); setNewPassword(''); }}
        className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 rounded-[4px] font-semibold cursor-pointer inline-flex items-center gap-1">
        <KeyRound className="w-3.5 h-3.5" /> Edit
      </button>
      {u.id !== me?.id && (
        <button type="button" onClick={() => setConfirm({ kind: 'toggle', user: u })}
          className={`px-2.5 py-1.5 rounded-[4px] font-semibold cursor-pointer inline-flex items-center gap-1 ${u.isActive ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}`}>
          {u.isActive ? <><UserX className="w-3.5 h-3.5" /> Deactivate</> : <><UserCheck className="w-3.5 h-3.5" /> Reactivate</>}
        </button>
      )}
      {u.mfaEnabled && (
        <button type="button" onClick={() => setConfirm({ kind: 'mfa', user: u })}
          className="px-2.5 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-[4px] font-semibold cursor-pointer inline-flex items-center gap-1">
          <Smartphone className="w-3.5 h-3.5" /> Reset 2FA
        </button>
      )}
    </div>
  );

  return (
    <SectionCard
      title="User Accounts"
      description="Create administrator accounts, change roles, reset passwords or two-factor, and deactivate accounts. Deactivation signs the person out everywhere."
      actions={<button type="button" onClick={() => { save.clear(); setForm(blank); setCreateOpen(true); }} className={btnAccent}><Plus className="w-3.5 h-3.5" /> New account</button>}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <FilterChips<RoleFilter> label="Role" value={role} onChange={setRole}
          options={[{ value: '', label: 'All' }, { value: 'SCHOLAR', label: 'Scholars' }, { value: 'ADMIN', label: 'Administrators' }, { value: 'SUPERADMIN', label: 'Super admins' }]} />
        <div className="relative md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Username, name or e-mail" aria-label="Search users" maxLength={100} className={`${inputClass} pl-8`} />
        </div>
      </div>
      {notice && <Alert type={notice.type} onClose={() => setNotice(null)}>{notice.text}</Alert>}

      {loading && !data ? <LoadingBlock /> : error ? <ErrorBlock message={error} onRetry={() => setReloadKey((k) => k + 1)} /> : (
        <ul className="divide-y divide-slate-100 border border-slate-200 rounded-[6px]">
          {rows.map((u) => (
            <li key={u.id} className="p-3 sm:p-4 text-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="min-w-0 space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-900">{`${u.firstName} ${u.lastName}`.trim() || u.username}</span>
                  <span className="text-slate-400">@{u.username}</span>
                  <StatusPill className={u.role === 'SCHOLAR' ? 'bg-slate-100 text-slate-700' : 'bg-blue-100 text-[#255190]'}>{ROLE_LABELS[u.role]}</StatusPill>
                  {!u.isActive && <StatusPill className="bg-red-100 text-red-800">Inactive</StatusPill>}
                  {u.mfaEnabled && <StatusPill className="bg-emerald-100 text-emerald-800">2FA</StatusPill>}
                </div>
                <div className="text-slate-500 break-all">{u.email}</div>
                <div className="text-[11px] text-slate-400">Last sign-in: {u.lastLogin ? formatDateTime(u.lastLogin) : 'never'}</div>
              </div>
              {actions(u)}
            </li>
          ))}
          {rows.length === 0 && <li className="p-6 text-center text-xs text-slate-500">No accounts match.</li>}
        </ul>
      )}
      {data && <Pager page={page} count={data.count} onPage={setPage} />}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create account"
        footer={<><button type="button" onClick={() => setCreateOpen(false)} className={btnSecondary}>Cancel</button>
          <button type="submit" form="create-user" disabled={save.busy} className={btnPrimary}>{save.busy && <Spinner className="w-3.5 h-3.5" />} Create</button></>}>
        <form id="create-user" onSubmit={create} className="space-y-3 text-xs">
          {save.error && <Alert type="error">{save.error}</Alert>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="First name" error={save.errors.firstName}>{(id) => <input id={id} type="text" maxLength={100} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputClass} />}</Field>
            <Field label="Last name" error={save.errors.lastName}>{(id) => <input id={id} type="text" maxLength={100} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputClass} />}</Field>
            <Field label="Username" required error={save.errors.username}>{(id) => <input id={id} type="text" required minLength={3} maxLength={150} autoCapitalize="none" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className={inputClass} />}</Field>
            <Field label="E-mail" required error={save.errors.email}>{(id) => <input id={id} type="email" required maxLength={254} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />}</Field>
            <Field label="Role" required error={save.errors.role}>
              {(id) => (
                <select id={id} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} className={inputClass}>
                  <option value="ADMIN">Administrator / Project Leader</option>
                  <option value="SUPERADMIN">Super Administrator</option>
                  <option value="SCHOLAR">Scholar</option>
                </select>
              )}
            </Field>
            <Field label="Temporary password" required error={save.errors.password} hint="Share it securely; ask them to change it after first sign-in.">
              {(id) => <input id={id} type="password" required minLength={8} maxLength={128} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} />}
            </Field>
          </div>
        </form>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing ? `Edit ${editing.username}` : ''}
        footer={<><button type="button" onClick={() => setEditing(null)} className={btnSecondary}>Cancel</button>
          <button type="submit" form="edit-user" disabled={save.busy} className={btnPrimary}>{save.busy && <Spinner className="w-3.5 h-3.5" />} Save</button></>}>
        {editing && (
          <form id="edit-user" onSubmit={saveEdit} className="space-y-3 text-xs">
            {save.error && <Alert type="error">{save.error}</Alert>}
            <Field label="Role" error={save.errors.role}>
              {(id) => (
                <select id={id} value={editRole} disabled={editing.id === me?.id} onChange={(e) => setEditRole(e.target.value as UserRole)} className={inputClass}>
                  <option value="SCHOLAR">Scholar</option>
                  <option value="ADMIN">Administrator / Project Leader</option>
                  <option value="SUPERADMIN">Super Administrator</option>
                </select>
              )}
            </Field>
            <Field label="Reset password (optional)" error={save.errors.password} hint="Leave blank to keep the current password. Setting one signs the user out everywhere.">
              {(id) => <input id={id} type="password" minLength={8} maxLength={128} autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} />}
            </Field>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        busy={busy}
        title={confirm?.kind === 'mfa' ? 'Reset two-factor authentication?' : confirm?.user.isActive ? 'Deactivate account?' : 'Reactivate account?'}
        confirmLabel={confirm?.kind === 'mfa' ? 'Reset 2FA' : confirm?.user.isActive ? 'Deactivate' : 'Reactivate'}
        danger={confirm?.kind === 'mfa' || !!confirm?.user.isActive}
        message={confirm?.kind === 'mfa'
          ? <>Only do this if <b>{confirm.user.username}</b> lost their authenticator and you have verified who they are.</>
          : confirm?.user.isActive
            ? <><b>{confirm.user.username}</b> will be signed out everywhere and will not be able to sign in.</>
            : <><b>{confirm?.user.username}</b> will be able to sign in again.</>}
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />
    </SectionCard>
  );
};
