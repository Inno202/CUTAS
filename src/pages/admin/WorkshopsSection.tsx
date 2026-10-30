import React, { useState } from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/endpoints';
import { Alert, ConfirmDialog, ErrorBlock, Field, LoadingBlock, Modal, Spinner, StatusPill, btnAccent, btnPrimary, btnSecondary, inputClass } from '../../components/ui';
import { errorMessage, useAction, useAsync } from '../../hooks/useAsync';
import type { PublishStatus, Workshop } from '../../types';
import { formatDate, formatTime, isPastDate, timeRange } from '../../utils/format';
import { SectionCard, SectionProps } from './shared';

type Form = Omit<Workshop, 'id'>;
const blank = (): Form => ({
  title: '', facilitator: '', eventDate: '', eventTime: '10:00', endTime: '', venueOrLink: '', description: '',
  category: 'Methodology & Writing', status: 'PUBLISHED',
});

export const WorkshopsSection: React.FC<SectionProps> = ({ onChanged }) => {
  const list = useAsync(() => adminApi.workshops.list(), []);
  const [editing, setEditing] = useState<Workshop | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(blank);
  const [toDelete, setToDelete] = useState<Workshop | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const save = useAction();
  const items = list.data ?? [];
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const openForm = (item?: Workshop) => {
    save.clear();
    setEditing(item ?? null);
    setForm(item ? { ...item, eventTime: formatTime(item.eventTime), endTime: formatTime(item.endTime) } : blank());
    setOpen(true);
  };

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, endTime: form.endTime || null };
    const res = await save.run(() => (editing ? adminApi.workshops.update(editing.id, payload) : adminApi.workshops.create(payload)));
    if (res) {
      list.setData((prev = []) => (editing ? prev.map((x) => (x.id === res.id ? res : x)) : [...prev, res])
        .sort((a, b) => (a.eventDate + a.eventTime).localeCompare(b.eventDate + b.eventTime)));
      setOpen(false);
      flash(editing ? 'Workshop updated.' : 'Workshop scheduled.');
      onChanged();
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await adminApi.workshops.remove(toDelete.id);
      list.setData((prev = []) => prev.filter((x) => x.id !== toDelete.id));
      flash('Workshop removed.');
      onChanged();
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  const pill = (w: Workshop) =>
    w.status === 'DRAFT' ? <StatusPill className="bg-slate-100 text-slate-600">Draft</StatusPill>
      : isPastDate(w.eventDate) ? <StatusPill className="bg-slate-200 text-slate-700">Past</StatusPill>
        : <StatusPill className="bg-emerald-100 text-emerald-800">Published</StatusPill>;

  return (
    <SectionCard
      title="Workshops & Methodology Clinics"
      description="Schedule, edit or cancel workshops and colloquiums. Published upcoming events show on the home and workshop pages."
      actions={<button type="button" onClick={() => openForm()} className={btnAccent}><Plus className="w-3.5 h-3.5" /> Schedule Workshop</button>}
    >
      {notice && <Alert type="success">{notice}</Alert>}
      {actionError && <Alert type="error" onClose={() => setActionError(null)}>{actionError}</Alert>}
      {list.loading && !list.data ? <LoadingBlock /> : list.error ? <ErrorBlock message={list.error} onRetry={list.reload} /> : items.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-8">No workshops yet.</p>
      ) : (
        <>
          <ul className="md:hidden space-y-3">
            {items.map((ws) => (
              <li key={ws.id} className="p-3 border border-slate-200 rounded-[6px] space-y-2 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 break-words">{ws.title}</div>
                    <div className="text-[11px] text-slate-500">By {ws.facilitator}</div>
                  </div>
                  {pill(ws)}
                </div>
                <div className="text-slate-600">{formatDate(ws.eventDate)} · {timeRange(ws.eventTime, ws.endTime)} · {ws.venueOrLink}</div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => openForm(ws)} className={`${btnSecondary} flex-1`}><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                  <button type="button" onClick={() => setToDelete(ws)} className={`${btnSecondary} flex-1 text-red-700`}><Trash2 className="w-3.5 h-3.5" /> Cancel event</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="hidden md:block border border-slate-200 rounded-[6px] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Title & Facilitator</th>
                  <th scope="col" className="p-3 font-semibold whitespace-nowrap">Date & Time</th>
                  <th scope="col" className="p-3 font-semibold">Venue</th>
                  <th scope="col" className="p-3 font-semibold">Status</th>
                  <th scope="col" className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((ws) => (
                  <tr key={ws.id} className="hover:bg-slate-50/50 align-top">
                    <td className="p-3 min-w-[200px]">
                      <span className="font-semibold text-slate-900 block">{ws.title}</span>
                      <span className="text-[11px] text-slate-500">By {ws.facilitator}</span>
                    </td>
                    <td className="p-3 text-slate-600 whitespace-nowrap">
                      <span>{formatDate(ws.eventDate)}</span>
                      <span className="block text-[11px] text-slate-400">{timeRange(ws.eventTime, ws.endTime)}</span>
                    </td>
                    <td className="p-3 text-slate-600 max-w-[200px] break-words">{ws.venueOrLink}</td>
                    <td className="p-3">{pill(ws)}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => openForm(ws)} className="px-2.5 py-1.5 text-slate-700 hover:text-[#255190] bg-slate-100 hover:bg-blue-50 rounded-[4px] font-semibold cursor-pointer">Edit</button>
                        <button type="button" onClick={() => setToDelete(ws)} className="px-2.5 py-1.5 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-[4px] font-semibold cursor-pointer">Cancel</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal open={open} onClose={() => setOpen(false)} size="lg" title={editing ? 'Edit Workshop' : 'Schedule New Workshop'}
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className={btnSecondary}>Close</button>
            <button type="submit" form="workshop-form" disabled={save.busy} className={btnPrimary}>
              {save.busy && <Spinner className="w-3.5 h-3.5" />} {editing ? 'Save Changes' : form.status === 'PUBLISHED' ? 'Schedule & Publish' : 'Save Draft'}
            </button>
          </>
        }>
        <form id="workshop-form" onSubmit={submit} className="space-y-3 text-xs">
          {save.error && <Alert type="error">{save.error}</Alert>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Workshop Title" required error={save.errors.title}>
              {(id) => <input id={id} type="text" required maxLength={300} value={form.title} onChange={(e) => set('title', e.target.value)} className={inputClass} />}
            </Field>
            <Field label="Lead Facilitator" required error={save.errors.facilitator}>
              {(id) => <input id={id} type="text" required maxLength={200} value={form.facilitator} onChange={(e) => set('facilitator', e.target.value)} className={inputClass} />}
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Date" required error={save.errors.eventDate}>
              {(id) => <input id={id} type="date" required value={form.eventDate} onChange={(e) => set('eventDate', e.target.value)} className={inputClass} />}
            </Field>
            <Field label="Start time (SAST)" required error={save.errors.eventTime}>
              {(id) => <input id={id} type="time" required value={form.eventTime} onChange={(e) => set('eventTime', e.target.value)} className={inputClass} />}
            </Field>
            <Field label="End time (optional)" error={save.errors.endTime}>
              {(id) => <input id={id} type="time" value={form.endTime ?? ''} onChange={(e) => set('endTime', e.target.value)} className={inputClass} />}
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Venue or online link" required error={save.errors.venueOrLink} hint="Links must start with https://">
              {(id) => <input id={id} type="text" required maxLength={300} value={form.venueOrLink} onChange={(e) => set('venueOrLink', e.target.value)} placeholder="e.g. Library Room 204 or https://teams…" className={inputClass} />}
            </Field>
            <Field label="Category" required error={save.errors.category}>
              {(id) => <input id={id} type="text" required maxLength={100} value={form.category} onChange={(e) => set('category', e.target.value)} className={inputClass} />}
            </Field>
          </div>
          <Field label="Syllabus & Synopsis" required error={save.errors.description}>
            {(id) => <textarea id={id} rows={4} required maxLength={6000} value={form.description} onChange={(e) => set('description', e.target.value)} className={inputClass} />}
          </Field>
          <label className="flex items-center gap-2">
            <span className="font-semibold">Status</span>
            <select value={form.status} onChange={(e) => set('status', e.target.value as PublishStatus)} className={`${inputClass} w-auto`}>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </label>
        </form>
      </Modal>

      <ConfirmDialog open={!!toDelete} title="Cancel and remove workshop?" confirmLabel="Remove workshop" busy={deleting}
        message={<>"<b>{toDelete?.title}</b>" will be removed from the schedule.</>}
        onConfirm={remove} onCancel={() => setToDelete(null)} />
    </SectionCard>
  );
};
