import React, { useEffect, useState } from 'react';
import { CheckCircle2, Search } from 'lucide-react';
import { adminApi } from '../../api/endpoints';
import { Alert, ErrorBlock, Field, LoadingBlock, Modal, Spinner, StatusPill, btnPrimary, btnSecondary, inputClass } from '../../components/ui';
import { CATEGORY_LABELS, CHALLENGE_CATEGORIES, CHALLENGE_STATUS_LABELS } from '../../constants';
import { errorMessage, useAction } from '../../hooks/useAsync';
import type { Challenge, ChallengeStatus, Paginated } from '../../types';
import { formatDate, formatDateTime } from '../../utils/format';
import { FilterChips, Pager, SectionCard, SectionProps, useDebounced } from './shared';

const PILL: Record<ChallengeStatus, string> = {
  OPEN: 'bg-red-100 text-red-800',
  IN_REVIEW: 'bg-amber-100 text-amber-800',
  RESOLVED: 'bg-emerald-100 text-emerald-800',
};

type Filter = ChallengeStatus | '';

export const ChallengesSection: React.FC<SectionProps> = ({ onChanged }) => {
  const [filter, setFilter] = useState<Filter>('OPEN');
  const [search, setSearch] = useState('');
  const query = useDebounced(search);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<Challenge> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [reviewing, setReviewing] = useState<Challenge | null>(null);
  const [status, setStatus] = useState<ChallengeStatus>('IN_REVIEW');
  const [notes, setNotes] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const save = useAction();

  useEffect(() => setPage(1), [filter, query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    adminApi.challenges({ status: filter, search: query, page })
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(errorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [filter, query, page, reloadKey]);

  const openReview = (ch: Challenge) => {
    save.clear();
    setReviewing(ch);
    setStatus(ch.status === 'OPEN' ? 'IN_REVIEW' : ch.status);
    setNotes(ch.resolutionNotes || '');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewing) return;
    const res = await save.run(() => adminApi.reviewChallenge(reviewing.id, { status, resolutionNotes: notes }));
    if (res) {
      setReviewing(null);
      setNotice(`Challenge #${res.id} updated to ${CHALLENGE_STATUS_LABELS[res.status]}. The scholar has been notified.`);
      setTimeout(() => setNotice(null), 4000);
      setReloadKey((k) => k + 1);
      onChanged();
    }
  };

  const rows = data?.results ?? [];

  return (
    <SectionCard
      title="Scholar Challenges & Interventions"
      description="Review Turnitin, funding, supervision, lab-access and writing bottlenecks logged by scholars, record the intervention, and resolve."
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <FilterChips<Filter> label="Status" value={filter} onChange={setFilter}
          options={[{ value: 'OPEN', label: 'Open' }, { value: 'IN_REVIEW', label: 'In Review' }, { value: 'RESOLVED', label: 'Resolved' }, { value: '', label: 'All' }]} />
        <div className="relative md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title or scholar" aria-label="Search challenges" maxLength={100} className={`${inputClass} pl-8`} />
        </div>
      </div>

      {notice && <Alert type="success">{notice}</Alert>}
      {loading && !data ? <LoadingBlock /> : error ? <ErrorBlock message={error} onRetry={() => setReloadKey((k) => k + 1)} /> : (
        <div className="space-y-3">
          {rows.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 border border-slate-200 rounded-[6px]">No challenges match this filter.</div>
          ) : rows.map((ch) => (
            <article key={ch.id} className="p-4 rounded-[6px] border border-slate-200 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <StatusPill className={PILL[ch.status]}>{CHALLENGE_STATUS_LABELS[ch.status]}</StatusPill>
                  <span className="font-bold text-slate-900">{ch.scholarName}</span>
                  {ch.scholarCategory && <span className="text-[11px] text-slate-400">({CATEGORY_LABELS[ch.scholarCategory]})</span>}
                  <span className="text-[11px] text-slate-400">· #{ch.id} · {formatDate(ch.createdAt)}</span>
                </div>
                <div className="text-[11px] font-semibold text-[#255190] uppercase tracking-wide">
                  {CHALLENGE_CATEGORIES.find((c) => c.value === ch.category)?.label}
                </div>
                <h3 className="font-semibold text-[#255190] text-sm break-words">{ch.title}</h3>
                <p className="text-slate-600 line-clamp-3 leading-relaxed max-w-none break-words">{ch.description}</p>
                {ch.resolutionNotes && (
                  <div className="text-[11px] text-emerald-900 bg-emerald-50/70 p-2 rounded border border-emerald-100 break-words">
                    <b>Notes:</b> {ch.resolutionNotes}
                  </div>
                )}
              </div>
              <button type="button" onClick={() => openReview(ch)} className={`${btnPrimary} flex-shrink-0 w-full sm:w-auto`}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Triage / Resolve
              </button>
            </article>
          ))}
          {data && <Pager page={page} count={data.count} onPage={setPage} />}
        </div>
      )}

      <Modal open={!!reviewing} onClose={() => setReviewing(null)} size="lg" title={reviewing ? `Review Challenge #${reviewing.id}` : ''}
        footer={
          <>
            <button type="button" onClick={() => setReviewing(null)} className={btnSecondary}>Cancel</button>
            <button type="submit" form="review-form" disabled={save.busy} className={btnPrimary}>
              {save.busy && <Spinner className="w-3.5 h-3.5" />} Save Review
            </button>
          </>
        }>
        {reviewing && (
          <>
            <dl className="space-y-2 text-xs">
              <div>
                <dt className="text-[10px] uppercase font-bold text-slate-400">Scholar</dt>
                <dd className="font-semibold text-slate-900">
                  {reviewing.scholarName}{reviewing.scholarEmail && <span className="font-normal text-slate-500"> · {reviewing.scholarEmail}</span>}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase font-bold text-slate-400">Issue</dt>
                <dd className="font-semibold text-slate-900 break-words">{reviewing.title}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase font-bold text-slate-400">Description</dt>
                <dd className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-700 leading-relaxed whitespace-pre-line max-h-56 overflow-y-auto break-words">
                  {reviewing.description}
                </dd>
              </div>
              {reviewing.resolvedAt && (
                <div className="text-[11px] text-slate-500">Resolved {formatDateTime(reviewing.resolvedAt)} by {reviewing.resolvedByName}</div>
              )}
            </dl>
            <form id="review-form" onSubmit={submit} className="space-y-3 text-xs pt-1">
              {save.error && <Alert type="error">{save.error}</Alert>}
              <Field label="Status" required>
                {(id) => (
                  <select id={id} value={status} onChange={(e) => setStatus(e.target.value as ChallengeStatus)} className={inputClass}>
                    <option value="OPEN">Open (pending review)</option>
                    <option value="IN_REVIEW">In review (committee intervention)</option>
                    <option value="RESOLVED">Resolved (intervention executed)</option>
                  </select>
                )}
              </Field>
              <Field label="Resolution & committee notes (visible to the scholar)" required={status === 'RESOLVED'} error={save.errors.resolutionNotes}>
                {(id) => (
                  <textarea id={id} rows={5} maxLength={8000} required={status === 'RESOLVED'} value={notes} onChange={(e) => setNotes(e.target.value)}
                    placeholder="Action taken or guidance provided to the scholar…" className={`${inputClass} leading-relaxed`} />
                )}
              </Field>
            </form>
          </>
        )}
      </Modal>
    </SectionCard>
  );
};
