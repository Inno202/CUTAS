import React, { useState } from 'react';
import { Edit3, ExternalLink, FileDown, Plus, Trash2 } from 'lucide-react';
import { publicationsApi } from '../api/endpoints';
import { PageHeader, PageHeaderButton } from '../components/PageHeader';
import { Alert, ConfirmDialog, ErrorBlock, Field, LoadingBlock, Spinner, btnPrimary, btnSecondary, inputClass } from '../components/ui';
import { PUBLICATION_STATUS_LABELS, PUBLICATION_TYPE_LABELS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { errorMessage, useAction, useAsync } from '../hooks/useAsync';
import type { Publication, PublicationStatus, PublicationType } from '../types';
import { safeHref } from '../utils/format';

type FormState = Omit<Publication, 'id' | 'createdAt'>;

const STATUS_BADGE: Record<PublicationStatus, string> = {
  PUBLISHED: 'text-emerald-800 bg-emerald-50 border border-emerald-200',
  ACCEPTED: 'text-blue-800 bg-blue-50 border border-blue-200',
  UNDER_REVIEW: 'text-amber-800 bg-amber-50 border border-amber-200',
};

export const PublicationsPage: React.FC = () => {
  const { user } = useAuth();
  const list = useAsync(() => publicationsApi.list(), []);
  const blank = (): FormState => ({
    publicationType: 'ARTICLE', title: '', authors: user ? `${user.lastName}, ${user.firstName[0] ?? ''}.` : '',
    outletName: '', year: new Date().getFullYear(), volumeIssuePages: '', doiOrUrl: '', status: 'PUBLISHED',
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(blank);
  const [toDelete, setToDelete] = useState<Publication | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const save = useAction();
  const pdf = useAction();

  const pubs = list.data ?? [];
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const reset = () => {
    setForm(blank());
    setEditingId(null);
    setShowForm(false);
    save.clear();
  };

  const startEdit = (p: Publication) => {
    setEditingId(p.id);
    setForm({ publicationType: p.publicationType, title: p.title, authors: p.authors, outletName: p.outletName, year: p.year,
      volumeIssuePages: p.volumeIssuePages || '', doiOrUrl: p.doiOrUrl || '', status: p.status });
    setShowForm(true);
    save.clear();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await save.run(() => (editingId ? publicationsApi.update(editingId, form) : publicationsApi.create(form)));
    if (result) {
      list.setData((prev = []) => (editingId ? prev.map((p) => (p.id === editingId ? result : p)) : [result, ...prev])
        .sort((a, b) => b.year - a.year));
      setNotice(editingId ? 'Publication updated.' : 'Publication added to your record.');
      setTimeout(() => setNotice(null), 3500);
      reset();
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await publicationsApi.remove(toDelete.id);
      list.setData((prev = []) => prev.filter((p) => p.id !== toDelete.id));
      setToDelete(null);
    } catch (e) {
      setDeleteError(errorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        eyebrow="DHET Accredited Scholarly Outputs"
        title="Publication Record"
        description="Book chapters, peer-reviewed journal articles, and conference proceedings authored during your studies."
        actions={
          <>
            <PageHeaderButton variant="accent" onClick={() => (showForm ? reset() : (reset(), setShowForm(true)))} icon={<Plus className="w-4 h-4" />}>
              {showForm ? 'Close Form' : 'Add Publication'}
            </PageHeaderButton>
            <PageHeaderButton
              variant="secondary"
              onClick={() => pdf.run(() => publicationsApi.pdf())}
              disabled={pdf.busy}
              icon={pdf.busy ? <Spinner className="w-4 h-4" /> : <FileDown className="w-4 h-4" />}
            >
              Download Publication Record (PDF)
            </PageHeaderButton>
          </>
        }
      />

      {pdf.error && <Alert type="error" onClose={pdf.clear}>{pdf.error}</Alert>}
      {notice && <Alert type="success">{notice}</Alert>}

      {showForm && (
        <section className="bg-slate-50 border border-[#E2E8F0] rounded-[6px] p-4 sm:p-8 shadow-xs">
          <h2 className="text-base font-bold text-[#255190] mb-1">{editingId ? 'Edit Publication Record' : 'Record New Scholarly Publication'}</h2>
          <p className="text-xs text-slate-500 mb-4">Outputs are indexed on your CUTAS profile and included in your exportable record.</p>
          <form onSubmit={submit} className="space-y-4 text-xs">
            {save.error && <Alert type="error">{save.error}</Alert>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Publication Type" required error={save.errors.publicationType}>
                {(id) => (
                  <select id={id} value={form.publicationType} onChange={(e) => set('publicationType', e.target.value as PublicationType)} className={inputClass}>
                    {Object.entries(PUBLICATION_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                )}
              </Field>
              <Field label="Status" required error={save.errors.status}>
                {(id) => (
                  <select id={id} value={form.status} onChange={(e) => set('status', e.target.value as PublicationStatus)} className={inputClass}>
                    {Object.entries(PUBLICATION_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                )}
              </Field>
              <Field label="Title of Work" required error={save.errors.title} className="sm:col-span-2">
                {(id) => <input id={id} type="text" required maxLength={400} value={form.title} onChange={(e) => set('title', e.target.value)}
                  placeholder="Full title of article, chapter, or paper" className={inputClass} />}
              </Field>
              <Field label="Authors (in citation format)" required error={save.errors.authors} className="sm:col-span-2">
                {(id) => <input id={id} type="text" required maxLength={400} value={form.authors} onChange={(e) => set('authors', e.target.value)}
                  placeholder="e.g. Dlamini, N., Mthembu, K., & Sithole, P." className={inputClass} />}
              </Field>
              <Field label="Journal, Book, or Conference Name" required error={save.errors.outletName}>
                {(id) => <input id={id} type="text" required maxLength={300} value={form.outletName} onChange={(e) => set('outletName', e.target.value)}
                  placeholder="e.g. Journal of Applied Nanobiotechnology" className={inputClass} />}
              </Field>
              <Field label="Year of Publication" required error={save.errors.year}>
                {(id) => <input id={id} type="number" inputMode="numeric" required min={1950} max={2100} value={form.year}
                  onChange={(e) => set('year', parseInt(e.target.value, 10) || new Date().getFullYear())} className={inputClass} />}
              </Field>
              <Field label="Volume, Issue, Pages (optional)" error={save.errors.volumeIssuePages}>
                {(id) => <input id={id} type="text" maxLength={150} value={form.volumeIssuePages} onChange={(e) => set('volumeIssuePages', e.target.value)}
                  placeholder="Vol. 14, No. 2, pp. 110-128" className={inputClass} />}
              </Field>
              <Field label="DOI or Repository URL (optional)" error={save.errors.doiOrUrl} hint="https://… link, or a DOI such as 10.1016/j.x.2025.01.001">
                {(id) => <input id={id} type="text" inputMode="url" maxLength={255} value={form.doiOrUrl} onChange={(e) => set('doiOrUrl', e.target.value.trim())}
                  placeholder="https://doi.org/10.xxxx/yyyy" className={inputClass} />}
              </Field>
            </div>
            <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button type="button" onClick={reset} className={btnSecondary}>Cancel</button>
              <button type="submit" disabled={save.busy} className={btnPrimary}>
                {save.busy && <Spinner className="w-3.5 h-3.5" />} {editingId ? 'Save Changes' : '+ Add to Record'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="bg-white rounded-[6px] border border-[#E2E8F0] overflow-hidden shadow-xs">
        <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-b border-slate-200 text-xs">
          <h2 className="font-semibold uppercase tracking-wider text-[#255190] text-xs">Recorded Outputs ({pubs.length})</h2>
        </div>
        {list.loading && !list.data ? (
          <LoadingBlock />
        ) : list.error ? (
          <div className="p-4"><ErrorBlock message={list.error} onRetry={list.reload} /></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pubs.map((pub) => {
              const href = safeHref(pub.doiOrUrl);
              return (
                <article key={pub.id} className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                      <span className="font-semibold text-[#255190]">{PUBLICATION_TYPE_LABELS[pub.publicationType]}</span>
                      <span className="hidden sm:inline text-slate-300" aria-hidden="true">·</span>
                      <span className="text-slate-500">Year: <b>{pub.year}</b></span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-[4px] ${STATUS_BADGE[pub.status]}`}>
                        {PUBLICATION_STATUS_LABELS[pub.status]}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-[#255190] leading-snug break-words">{pub.title}</h3>
                    <p className="text-xs text-slate-600 break-words"><span className="text-slate-400">Authors:</span> {pub.authors}</p>
                    <p className="text-xs text-slate-500 italic break-words">{pub.outletName}{pub.volumeIssuePages && `, ${pub.volumeIssuePages}`}</p>
                    {href && (
                      <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="text-xs text-blue-700 hover:underline inline-flex items-center gap-1 pt-0.5 break-anywhere">
                        <span>{pub.doiOrUrl}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 text-xs">
                    <button type="button" onClick={() => startEdit(pub)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded transition-colors cursor-pointer flex items-center gap-1">
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button type="button" onClick={() => { setDeleteError(null); setToDelete(pub); }} className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded transition-colors cursor-pointer flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </article>
              );
            })}
            {pubs.length === 0 && (
              <div className="p-8 sm:p-12 text-center text-xs text-slate-500">
                No publications recorded yet. Use "Add Publication" above to add journal papers, book chapters, or conference proceedings.
              </div>
            )}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete publication?"
        message={<>"<b>{toDelete?.title}</b>" will be removed from your publication record. This cannot be undone.</>}
        confirmLabel="Delete"
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
};
