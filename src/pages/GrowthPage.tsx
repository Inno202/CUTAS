import React, { useState } from 'react';
import { CheckCircle2, Clock, FileDown, Plus, Trash2 } from 'lucide-react';
import { growthApi } from '../api/endpoints';
import { PageHeader, PageHeaderButton } from '../components/PageHeader';
import { Alert, ConfirmDialog, ErrorBlock, Field, LoadingBlock, Spinner, btnPrimary, btnSecondary, inputClass } from '../components/ui';
import { COMPETENCY_LABELS } from '../constants';
import { errorMessage, useAction, useAsync } from '../hooks/useAsync';
import type { GrowthCompetency, GrowthSuggestion } from '../types';

function defaultQuarter() {
  const d = new Date();
  const q = Math.floor(d.getMonth() / 3) + 2;
  return q > 4 ? `Q1 ${d.getFullYear() + 1}` : `Q${q} ${d.getFullYear()}`;
}

export const GrowthPage: React.FC = () => {
  const list = useAsync(() => growthApi.list(), []);
  const [showForm, setShowForm] = useState(false);
  const [area, setArea] = useState<GrowthCompetency>('WRITING');
  const [growthObjective, setGrowthObjective] = useState('');
  const [milestoneActions, setMilestoneActions] = useState('');
  const [targetQuarter, setTargetQuarter] = useState(defaultQuarter);
  const [toggling, setToggling] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<GrowthSuggestion | null>(null);
  const [deleting, setDeleting] = useState(false);
  const save = useAction();
  const pdf = useAction();
  const items = list.data ?? [];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await save.run(() => growthApi.create({ area, growthObjective, milestoneActions, targetQuarter, isCompleted: false }));
    if (created) {
      list.setData((prev = []) => [created, ...prev]);
      setGrowthObjective('');
      setMilestoneActions('');
      setShowForm(false);
    }
  };

  const toggle = async (item: GrowthSuggestion) => {
    setToggling(item.id);
    setActionError(null);
    try {
      const updated = await growthApi.update(item.id, { isCompleted: !item.isCompleted });
      list.setData((prev = []) => prev.map((g) => (g.id === item.id ? updated : g)));
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setToggling(null);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await growthApi.remove(toDelete.id);
      list.setData((prev = []) => prev.filter((g) => g.id !== toDelete.id));
      setToDelete(null);
    } catch (e) {
      setActionError(errorMessage(e));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        eyebrow="Individual Scholar Development Plan"
        title="Suggestions for Your Growth"
        description="Scholar-populated milestones, targeted research competencies, and timeline commitments. Mentors can add feedback."
        actions={
          <>
            <PageHeaderButton variant="accent" onClick={() => { setShowForm(!showForm); save.clear(); }} icon={<Plus className="w-4 h-4" />}>
              {showForm ? 'Close Form' : 'Add Target'}
            </PageHeaderButton>
            <PageHeaderButton variant="secondary" onClick={() => pdf.run(() => growthApi.pdf())} disabled={pdf.busy}
              icon={pdf.busy ? <Spinner className="w-4 h-4" /> : <FileDown className="w-4 h-4" />}>
              Download Growth Plan (PDF)
            </PageHeaderButton>
          </>
        }
      />

      {pdf.error && <Alert type="error" onClose={pdf.clear}>{pdf.error}</Alert>}
      {actionError && <Alert type="error" onClose={() => setActionError(null)}>{actionError}</Alert>}

      {showForm && (
        <section className="bg-slate-50 border border-[#E2E8F0] rounded-[6px] p-4 sm:p-8 shadow-xs">
          <h2 className="text-base font-bold text-[#255190] mb-1">Define New Growth Objective</h2>
          <p className="text-xs text-slate-500 mb-4">Identify skill goals such as competitive grant drafting, quantitative modelling, or high-impact writing.</p>
          <form onSubmit={submit} className="space-y-4 text-xs">
            {save.error && <Alert type="error">{save.error}</Alert>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Competency Area" required error={save.errors.area}>
                {(id) => (
                  <select id={id} value={area} onChange={(e) => setArea(e.target.value as GrowthCompetency)} className={inputClass}>
                    {Object.entries(COMPETENCY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                )}
              </Field>
              <Field label="Target Timeline" required error={save.errors.targetQuarter}>
                {(id) => <input id={id} type="text" required maxLength={50} value={targetQuarter} onChange={(e) => setTargetQuarter(e.target.value)}
                  placeholder="e.g. Q3 2026" className={inputClass} />}
              </Field>
              <Field label="Growth Objective" required error={save.errors.growthObjective} className="sm:col-span-2">
                {(id) => <input id={id} type="text" required maxLength={300} value={growthObjective} onChange={(e) => setGrowthObjective(e.target.value)}
                  placeholder="e.g. Master Structural Equation Modelling in Jamovi / R" className={inputClass} />}
              </Field>
              <Field label="Action Steps & Concrete Milestones" required error={save.errors.milestoneActions} className="sm:col-span-2">
                {(id) => <textarea id={id} rows={4} required maxLength={6000} value={milestoneActions} onChange={(e) => setMilestoneActions(e.target.value)}
                  placeholder="Step-by-step actions to achieve this competency…" className={`${inputClass} leading-relaxed`} />}
              </Field>
            </div>
            <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className={btnSecondary}>Cancel</button>
              <button type="submit" disabled={save.busy} className={btnPrimary}>
                {save.busy && <Spinner className="w-3.5 h-3.5" />} Save Growth Target
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
          {items.map((item) => (
            <article key={item.id} className={`rounded-[6px] border p-4 sm:p-6 shadow-xs transition-all flex flex-col justify-between ${
              item.isCompleted ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-[#E2E8F0] hover:border-slate-300'
            }`}>
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs mb-3">
                  <span className="font-semibold text-[#255190] uppercase tracking-wider text-[11px]">{COMPETENCY_LABELS[item.area]}</span>
                  <button
                    type="button"
                    onClick={() => toggle(item)}
                    disabled={toggling === item.id}
                    aria-pressed={item.isCompleted}
                    className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-[4px] cursor-pointer transition-colors flex items-center gap-1 disabled:opacity-60 ${
                      item.isCompleted ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {toggling === item.id ? <Spinner className="w-3.5 h-3.5" /> : item.isCompleted
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> : <Clock className="w-3.5 h-3.5 text-slate-500" />}
                    {item.isCompleted ? 'Achieved' : `In Progress (${item.targetQuarter})`}
                  </button>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#255190] mb-2 leading-snug break-words">{item.growthObjective}</h3>
                <div className="text-xs text-slate-700 space-y-2 mb-4">
                  <div className="bg-slate-50 p-3 rounded-[4px] border border-slate-100">
                    <span className="font-bold text-slate-800 block mb-1">Milestones & Action Plan:</span>
                    <p className="whitespace-pre-line text-slate-600 leading-relaxed max-w-none break-words">{item.milestoneActions}</p>
                  </div>
                  {item.mentorNotes && (
                    <div className="p-3 bg-amber-50 rounded-[4px] border border-amber-200 text-amber-900">
                      <span className="font-bold block mb-0.5">Advisor / Mentor Feedback:</span>
                      <p className="text-amber-800 leading-relaxed whitespace-pre-line max-w-none break-words">{item.mentorNotes}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between gap-2">
                <span>Target: {item.targetQuarter}</span>
                <button type="button" onClick={() => setToDelete(item)} className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer" aria-label={`Delete growth target ${item.growthObjective}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
          {items.length === 0 && (
            <div className="md:col-span-2 bg-white rounded-[6px] border border-[#E2E8F0] p-8 sm:p-12 text-center text-xs text-slate-500">
              No growth targets yet. Use "Add Target" to plan competencies, grant skills, and research objectives.
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete growth target?"
        message={<>"<b>{toDelete?.growthObjective}</b>" and any mentor feedback on it will be removed.</>}
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
};
