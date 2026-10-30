import React, { useState } from 'react';
import { FileDown, Plus, Trash2, Trophy } from 'lucide-react';
import { awardsApi } from '../api/endpoints';
import { PageHeader, PageHeaderButton } from '../components/PageHeader';
import { Alert, ConfirmDialog, ErrorBlock, Field, LoadingBlock, Spinner, btnPrimary, btnSecondary, inputClass } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { errorMessage, useAction, useAsync } from '../hooks/useAsync';
import type { Award } from '../types';
import { fullName } from '../utils/format';

export const AwardsPage: React.FC = () => {
  const { user } = useAuth();
  const list = useAsync(() => awardsApi.list(), []);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [awardingBody, setAwardingBody] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [description, setDescription] = useState('');
  const [toDelete, setToDelete] = useState<Award | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const save = useAction();
  const pdf = useAction();
  const awards = list.data ?? [];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await save.run(() => awardsApi.create({ title, awardingBody, year, description }));
    if (created) {
      list.setData((prev = []) => [created, ...prev].sort((a, b) => b.year - a.year));
      setTitle('');
      setAwardingBody('');
      setDescription('');
      setShowForm(false);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await awardsApi.remove(toDelete.id);
      list.setData((prev = []) => prev.filter((a) => a.id !== toDelete.id));
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
        eyebrow="Academic Honours & Distinctions"
        title="Awards and Recognitions"
        description="Scholar-populated academic honours, best paper presentations, postgraduate merit distinctions, and fellowship awards."
        actions={
          <>
            <PageHeaderButton variant="accent" onClick={() => { setShowForm(!showForm); save.clear(); }} icon={<Plus className="w-4 h-4" />}>
              {showForm ? 'Close Form' : 'Add Recognition'}
            </PageHeaderButton>
            <PageHeaderButton variant="secondary" onClick={() => pdf.run(() => awardsApi.pdf())} disabled={pdf.busy}
              icon={pdf.busy ? <Spinner className="w-4 h-4" /> : <FileDown className="w-4 h-4" />}>
              Download Awards Dossier (PDF)
            </PageHeaderButton>
          </>
        }
      />

      {pdf.error && <Alert type="error" onClose={pdf.clear}>{pdf.error}</Alert>}

      {showForm && (
        <section className="bg-slate-50 border border-[#E2E8F0] rounded-[6px] p-4 sm:p-8 shadow-xs">
          <h2 className="text-base font-bold text-[#255190] mb-1">Record Scholarly Award or Honour</h2>
          <p className="text-xs text-slate-500 mb-4">Honours are archived in your CUTAS profile and included in your exportable dossier.</p>
          <form onSubmit={submit} className="space-y-4 text-xs">
            {save.error && <Alert type="error">{save.error}</Alert>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Award Title" required error={save.errors.title} className="sm:col-span-2">
                {(id) => <input id={id} type="text" required maxLength={300} value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Best Oral Presentation Award - PowerAfrica 2024" className={inputClass} />}
              </Field>
              <Field label="Awarding Institution / Body" required error={save.errors.awardingBody}>
                {(id) => <input id={id} type="text" required maxLength={200} value={awardingBody} onChange={(e) => setAwardingBody(e.target.value)}
                  placeholder="e.g. IEEE Power & Energy Society" className={inputClass} />}
              </Field>
              <Field label="Year Conferred" required error={save.errors.year}>
                {(id) => <input id={id} type="number" inputMode="numeric" required min={1950} max={2100} value={year}
                  onChange={(e) => setYear(parseInt(e.target.value, 10) || new Date().getFullYear())} className={inputClass} />}
              </Field>
              <Field label="Description / Citation Background" error={save.errors.description} className="sm:col-span-2">
                {(id) => <textarea id={id} rows={3} maxLength={4000} value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe the criteria or achievement recognised…" className={`${inputClass} leading-relaxed`} />}
              </Field>
            </div>
            <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className={btnSecondary}>Cancel</button>
              <button type="submit" disabled={save.busy} className={btnPrimary}>
                {save.busy && <Spinner className="w-3.5 h-3.5" />} Save Award Record
              </button>
            </div>
          </form>
        </section>
      )}

      {list.loading && !list.data ? (
        <LoadingBlock />
      ) : list.error ? (
        <ErrorBlock message={list.error} onRetry={list.reload} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {awards.map((item) => (
            <article key={item.id} className="bg-white rounded-[6px] border border-[#E2E8F0] p-4 sm:p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs mb-3">
                  <span className="font-semibold text-[#255190] uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-[#FDB813]" aria-hidden="true" /> Year {item.year} Distinction
                  </span>
                  <button type="button" onClick={() => { setDeleteError(null); setToDelete(item); }}
                    className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer p-1.5" aria-label={`Delete award ${item.title}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#255190] mb-1.5 leading-snug break-words">{item.title}</h3>
                <div className="text-xs text-slate-500 font-medium mb-3 break-words">
                  Conferred by: <span className="text-slate-800">{item.awardingBody}</span>
                </div>
                {item.description && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-[4px] border border-slate-100 max-w-none whitespace-pre-line break-words">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-400">
                Scholar: {user ? fullName(user) : ''}
              </div>
            </article>
          ))}
          {awards.length === 0 && (
            <div className="md:col-span-2 bg-white rounded-[6px] border border-[#E2E8F0] p-8 sm:p-12 text-center text-xs text-slate-500">
              No awards or distinctions recorded yet. Use "Add Recognition" to add your achievements.
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete award?"
        message={<>"<b>{toDelete?.title}</b>" will be removed from your record.</>}
        confirmLabel="Delete"
        busy={deleting}
        error={deleteError}
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
};
