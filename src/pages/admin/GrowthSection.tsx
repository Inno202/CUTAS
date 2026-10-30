import React, { useEffect, useState } from 'react';
import { MessageSquare, Search } from 'lucide-react';
import { adminApi } from '../../api/endpoints';
import { Alert, ErrorBlock, Field, LoadingBlock, Modal, Spinner, StatusPill, btnPrimary, btnSecondary, inputClass } from '../../components/ui';
import { CATEGORY_LABELS, COMPETENCY_LABELS } from '../../constants';
import { errorMessage, useAction } from '../../hooks/useAsync';
import type { GrowthSuggestion, Paginated } from '../../types';
import { FilterChips, Pager, SectionCard, SectionProps, useDebounced } from './shared';

type State = 'awaiting' | 'completed' | '';

export const GrowthSection: React.FC<SectionProps> = ({ onChanged }) => {
  const [state, setState] = useState<State>('awaiting');
  const [search, setSearch] = useState('');
  const query = useDebounced(search);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<GrowthSuggestion> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [editing, setEditing] = useState<GrowthSuggestion | null>(null);
  const [note, setNote] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const save = useAction();

  useEffect(() => setPage(1), [state, query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    adminApi.growth({ state, search: query, page })
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(errorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [state, query, page, reloadKey]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const res = await save.run(() => adminApi.mentorNote(editing.id, note));
    if (res) {
      setEditing(null);
      setNotice('Mentor feedback saved. The scholar sees it on their growth plan.');
      setTimeout(() => setNotice(null), 3500);
      setReloadKey((k) => k + 1);
      onChanged();
    }
  };

  const rows = data?.results ?? [];
  return (
    <SectionCard title="Growth Plans & Mentor Feedback" description="Read scholars' development targets and add advisor feedback.">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <FilterChips<State> label="Filter" value={state} onChange={setState}
          options={[{ value: 'awaiting', label: 'Awaiting feedback' }, { value: 'completed', label: 'Achieved' }, { value: '', label: 'All' }]} />
        <div className="relative md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search objective or scholar" aria-label="Search growth plans" maxLength={100} className={`${inputClass} pl-8`} />
        </div>
      </div>
      {notice && <Alert type="success">{notice}</Alert>}
      {loading && !data ? <LoadingBlock /> : error ? <ErrorBlock message={error} onRetry={() => setReloadKey((k) => k + 1)} /> : (
        <div className="space-y-3">
          {rows.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 border border-slate-200 rounded-[6px]">Nothing here.</div>
          ) : rows.map((g) => (
            <article key={g.id} className="p-4 rounded-[6px] border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-900">{g.scholarName}</span>
                  {g.scholarCategory && <span className="text-[11px] text-slate-400">({CATEGORY_LABELS[g.scholarCategory]})</span>}
                  {g.isCompleted ? <StatusPill className="bg-emerald-100 text-emerald-800">Achieved</StatusPill>
                    : <StatusPill className="bg-slate-100 text-slate-600">{g.targetQuarter}</StatusPill>}
                </div>
                <div className="text-[11px] font-semibold text-[#255190] uppercase">{COMPETENCY_LABELS[g.area]}</div>
                <h3 className="font-semibold text-[#255190] text-sm break-words">{g.growthObjective}</h3>
                <p className="text-slate-600 whitespace-pre-line line-clamp-4 max-w-none break-words">{g.milestoneActions}</p>
                {g.mentorNotes && <div className="text-[11px] p-2 bg-amber-50 border border-amber-200 rounded text-amber-900 break-words"><b>Feedback:</b> {g.mentorNotes}</div>}
              </div>
              <button type="button" onClick={() => { save.clear(); setEditing(g); setNote(g.mentorNotes || ''); }} className={`${btnSecondary} flex-shrink-0 w-full sm:w-auto`}>
                <MessageSquare className="w-3.5 h-3.5" /> {g.mentorNotes ? 'Edit feedback' : 'Add feedback'}
              </button>
            </article>
          ))}
          {data && <Pager page={page} count={data.count} onPage={setPage} />}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Mentor feedback"
        footer={
          <>
            <button type="button" onClick={() => setEditing(null)} className={btnSecondary}>Cancel</button>
            <button type="submit" form="mentor-form" disabled={save.busy} className={btnPrimary}>{save.busy && <Spinner className="w-3.5 h-3.5" />} Save feedback</button>
          </>
        }>
        {editing && (
          <form id="mentor-form" onSubmit={submit} className="space-y-3 text-xs">
            {save.error && <Alert type="error">{save.error}</Alert>}
            <p className="text-slate-700"><b>{editing.scholarName}</b>: {editing.growthObjective}</p>
            <Field label="Feedback for the scholar" error={save.errors.mentorNotes}>
              {(id) => <textarea id={id} rows={5} maxLength={4000} value={note} onChange={(e) => setNote(e.target.value)} className={`${inputClass} leading-relaxed`} />}
            </Field>
          </form>
        )}
      </Modal>
    </SectionCard>
  );
};
