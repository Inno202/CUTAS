import React, { useState } from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/endpoints';
import { Alert, ConfirmDialog, ErrorBlock, Field, LoadingBlock, Modal, Spinner, StatusPill, btnAccent, btnPrimary, btnSecondary, inputClass } from '../../components/ui';
import { errorMessage, useAction, useAsync } from '../../hooks/useAsync';
import type { FundingOpportunity, PublishStatus } from '../../types';
import { formatDate, isPastDate } from '../../utils/format';
import { SectionCard, SectionProps } from './shared';

type Form = Omit<FundingOpportunity, 'id' | 'createdAt' | 'updatedAt'>;
const blank = (): Form => ({
  title: '', funder: '', amountRange: '', deadline: '', eligibility: '', applicationProcess: '', portalUrl: '',
  featuredOnLanding: true, isActive: true, status: 'PUBLISHED',
});

function statusOf(f: FundingOpportunity) {
  if (f.status === 'DRAFT') return { label: 'Draft', cls: 'bg-slate-100 text-slate-600' };
  if (!f.isActive) return { label: 'Inactive', cls: 'bg-amber-100 text-amber-800' };
  if (isPastDate(f.deadline)) return { label: 'Closed', cls: 'bg-slate-200 text-slate-700' };
  return { label: 'Published', cls: 'bg-emerald-100 text-emerald-800' };
}

export const FundingSection: React.FC<SectionProps> = ({ onChanged }) => {
  const list = useAsync(() => adminApi.funding.list(), []);
  const [editing, setEditing] = useState<FundingOpportunity | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(blank);
  const [toDelete, setToDelete] = useState<FundingOpportunity | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const save = useAction();
  const items = list.data ?? [];
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const openForm = (item?: FundingOpportunity) => {
    save.clear();
    setEditing(item ?? null);
    setForm(item ? { ...blank(), ...item } : blank());
    setOpen(true);
  };

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await save.run(() => (editing ? adminApi.funding.update(editing.id, form) : adminApi.funding.create(form)));
    if (res) {
      list.setData((prev = []) => (editing ? prev.map((x) => (x.id === res.id ? res : x)) : [...prev, res])
        .sort((a, b) => a.deadline.localeCompare(b.deadline)));
      setOpen(false);
      flash(editing ? 'Funding call updated.' : 'Funding call created.');
      onChanged();
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await adminApi.funding.remove(toDelete.id);
      list.setData((prev = []) => prev.filter((x) => x.id !== toDelete.id));
      flash('Funding call deleted.');
      onChanged();
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  return (
    <SectionCard
      title="Bursary & Grant Calls"
      description="Create, edit, feature and publish funding calls. Published calls appear on the funding and home pages; opted-in scholars are e-mailed."
      actions={<button type="button" onClick={() => openForm()} className={btnAccent}><Plus className="w-3.5 h-3.5" /> New Funding Call</button>}
    >
      {notice && <Alert type="success">{notice}</Alert>}
      {actionError && <Alert type="error" onClose={() => setActionError(null)}>{actionError}</Alert>}
      {list.loading && !list.data ? <LoadingBlock /> : list.error ? <ErrorBlock message={list.error} onRetry={list.reload} /> : items.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-8">No funding calls yet.</p>
      ) : (
        <>
          {/* Phones: cards */}
          <ul className="md:hidden space-y-3">
            {items.map((item) => {
              const st = statusOf(item);
              return (
                <li key={item.id} className="p-3 border border-slate-200 rounded-[6px] space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 break-words">{item.title}</div>
                      <div className="text-[11px] text-slate-500">{item.funder}</div>
                    </div>
                    <StatusPill className={st.cls}>{st.label}</StatusPill>
                  </div>
                  <div className="text-slate-600">{item.amountRange} · closes {formatDate(item.deadline)}</div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => openForm(item)} className={`${btnSecondary} flex-1`}><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                    <button type="button" onClick={() => setToDelete(item)} className={`${btnSecondary} flex-1 text-red-700`}><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                  </div>
                </li>
              );
            })}
          </ul>
          {/* Tablets & desktops: table */}
          <div className="hidden md:block border border-slate-200 rounded-[6px] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Title & Funder</th>
                  <th scope="col" className="p-3 font-semibold">Amount</th>
                  <th scope="col" className="p-3 font-semibold whitespace-nowrap">Deadline</th>
                  <th scope="col" className="p-3 font-semibold">Status</th>
                  <th scope="col" className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const st = statusOf(item);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 align-top">
                      <td className="p-3 min-w-[200px]">
                        <span className="font-semibold text-slate-900 block">{item.title}</span>
                        <span className="text-[11px] text-slate-500">{item.funder}{item.featuredOnLanding ? ' · featured' : ''}</span>
                      </td>
                      <td className="p-3 font-medium text-emerald-800 min-w-[140px]">{item.amountRange}</td>
                      <td className="p-3 text-slate-600 whitespace-nowrap">{formatDate(item.deadline)}</td>
                      <td className="p-3"><StatusPill className={st.cls}>{st.label}</StatusPill></td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button type="button" onClick={() => openForm(item)} className="px-2.5 py-1.5 text-slate-700 hover:text-[#255190] bg-slate-100 hover:bg-blue-50 rounded-[4px] font-semibold cursor-pointer">Edit</button>
                          <button type="button" onClick={() => setToDelete(item)} className="px-2.5 py-1.5 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-[4px] font-semibold cursor-pointer">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal open={open} onClose={() => setOpen(false)} size="lg" title={editing ? 'Edit Funding Call' : 'Create New Funding Call'}
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className={btnSecondary}>Cancel</button>
            <button type="submit" form="funding-form" disabled={save.busy} className={btnPrimary}>
              {save.busy && <Spinner className="w-3.5 h-3.5" />} {editing ? 'Save Changes' : form.status === 'PUBLISHED' ? 'Save & Publish' : 'Save Draft'}
            </button>
          </>
        }>
        <form id="funding-form" onSubmit={submit} className="space-y-3 text-xs">
          {save.error && <Alert type="error">{save.error}</Alert>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Opportunity Title" required error={save.errors.title}>
              {(id) => <input id={id} type="text" required maxLength={300} value={form.title} onChange={(e) => set('title', e.target.value)} className={inputClass} />}
            </Field>
            <Field label="Funder / Organisation" required error={save.errors.funder}>
              {(id) => <input id={id} type="text" required maxLength={200} value={form.funder} onChange={(e) => set('funder', e.target.value)} className={inputClass} />}
            </Field>
            <Field label="Amount / Value" required error={save.errors.amountRange}>
              {(id) => <input id={id} type="text" required maxLength={150} value={form.amountRange} onChange={(e) => set('amountRange', e.target.value)} placeholder="e.g. R150,000 p.a." className={inputClass} />}
            </Field>
            <Field label="Application Deadline" required error={save.errors.deadline}>
              {(id) => <input id={id} type="date" required value={form.deadline} onChange={(e) => set('deadline', e.target.value)} className={inputClass} />}
            </Field>
            <Field label="Portal URL (https://)" error={save.errors.portalUrl} className="sm:col-span-2">
              {(id) => <input id={id} type="url" inputMode="url" maxLength={200} value={form.portalUrl} onChange={(e) => set('portalUrl', e.target.value.trim())} placeholder="https://…" className={inputClass} />}
            </Field>
          </div>
          <Field label="Eligibility Criteria" required error={save.errors.eligibility}>
            {(id) => <textarea id={id} rows={3} required maxLength={6000} value={form.eligibility} onChange={(e) => set('eligibility', e.target.value)} className={inputClass} />}
          </Field>
          <Field label="Application Process Instructions" required error={save.errors.applicationProcess}>
            {(id) => <textarea id={id} rows={4} required maxLength={6000} value={form.applicationProcess} onChange={(e) => set('applicationProcess', e.target.value)} className={inputClass} />}
          </Field>
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.featuredOnLanding} onChange={(e) => set('featuredOnLanding', e.target.checked)} className="w-4 h-4 rounded text-[#255190]" />
              <span>Feature on home page</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="w-4 h-4 rounded text-[#255190]" />
              <span>Active / accepting applications</span>
            </label>
            <label className="flex items-center gap-2 sm:ml-auto">
              <span className="font-semibold">Status</span>
              <select value={form.status} onChange={(e) => set('status', e.target.value as PublishStatus)} className={`${inputClass} w-auto`}>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </label>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!toDelete} title="Delete funding call?" confirmLabel="Delete" busy={deleting}
        message={<>"<b>{toDelete?.title}</b>" will be removed from the public catalogue.</>}
        onConfirm={remove} onCancel={() => setToDelete(null)} />
    </SectionCard>
  );
};
