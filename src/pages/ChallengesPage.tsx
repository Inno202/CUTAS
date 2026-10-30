import React, { useState } from 'react';
import { CheckCircle, Clock, FileDown, Plus, Send, Shield } from 'lucide-react';
import { challengesApi } from '../api/endpoints';
import { PageHeader, PageHeaderButton } from '../components/PageHeader';
import { Alert, ErrorBlock, Field, LoadingBlock, Spinner, btnPrimary, btnSecondary, inputClass } from '../components/ui';
import { CHALLENGE_CATEGORIES, CHALLENGE_STATUS_LABELS } from '../constants';
import { isAdmin, useAuth } from '../context/AuthContext';
import { useAction, useAsync } from '../hooks/useAsync';
import { navigate } from '../router';
import type { ChallengeCategory, ChallengeStatus } from '../types';
import { formatDate, formatDateTime } from '../utils/format';

export const STATUS_STYLES: Record<ChallengeStatus, string> = {
  OPEN: 'bg-amber-100 text-amber-800 border-amber-300',
  IN_REVIEW: 'bg-blue-100 text-blue-800 border-blue-300',
  RESOLVED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
};

const categoryLabel = (c: ChallengeCategory) => CHALLENGE_CATEGORIES.find((x) => x.value === c)?.label ?? c;

export const ChallengesPage: React.FC = () => {
  const { user } = useAuth();
  const list = useAsync(() => challengesApi.list(), []);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<ChallengeCategory>('WRITING');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const save = useAction();
  const pdf = useAction();
  const challenges = list.data ?? [];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await save.run(() => challengesApi.create({ category, title, description }));
    if (created) {
      list.setData((prev = []) => [created, ...prev]);
      setTitle('');
      setDescription('');
      setShowForm(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        eyebrow="Institutional Research Intervention Desk"
        title="Challenges and Solutions"
        description="Submit research roadblocks (funding, Turnitin similarity index, thesis writing, lab access, ethics approval) for society leadership resolution."
        actions={
          <>
            <PageHeaderButton variant="accent" onClick={() => { setShowForm(!showForm); save.clear(); }} icon={<Plus className="w-4 h-4" />}>
              {showForm ? 'Close Form' : 'Submit Problem'}
            </PageHeaderButton>
            <PageHeaderButton
              variant="secondary"
              onClick={() => pdf.run(() => challengesApi.pdf())}
              disabled={pdf.busy}
              icon={pdf.busy ? <Spinner className="w-4 h-4" /> : <FileDown className="w-4 h-4" />}
            >
              Download Challenges Log (PDF)
            </PageHeaderButton>
          </>
        }
      />

      {isAdmin(user) && (
        <Alert type="info">
          <span className="flex flex-wrap items-center gap-2">
            This page shows challenges logged from your own account. The full scholar queue is in the{' '}
            <button type="button" onClick={() => navigate('admin_dashboard')} className="font-bold text-[#255190] underline inline-flex items-center gap-1 cursor-pointer">
              <Shield className="w-3.5 h-3.5" /> Administrator Console
            </button>
          </span>
        </Alert>
      )}
      {pdf.error && <Alert type="error" onClose={pdf.clear}>{pdf.error}</Alert>}
      {submitted && (
        <Alert type="success">Research problem logged. CUTAS administrators can now see it in their review queue.</Alert>
      )}

      {showForm && (
        <section className="bg-slate-50 border border-[#E2E8F0] rounded-[6px] p-4 sm:p-8 shadow-xs">
          <h2 className="text-base font-bold text-[#255190] mb-1">Submit a Research Challenge</h2>
          <p className="text-xs text-slate-500 mb-4">Confidential: only you and the CUTAS administrators can see it.</p>
          <form onSubmit={submit} className="space-y-4 text-xs">
            {save.error && <Alert type="error">{save.error}</Alert>}
            <Field label="Challenge Category" required error={save.errors.category}>
              {(id) => (
                <select id={id} value={category} onChange={(e) => setCategory(e.target.value as ChallengeCategory)} className={inputClass}>
                  {CHALLENGE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              )}
            </Field>
            <Field label="Problem Subject / Summary" required error={save.errors.title}>
              {(id) => <input id={id} type="text" required maxLength={255} value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief synopsis of the issue" className={inputClass} />}
            </Field>
            <Field label="Detailed Description & Impact on Your Milestones" required error={save.errors.description}
              hint={`${description.length.toLocaleString()} / 8,000 characters`}>
              {(id) => <textarea id={id} rows={6} required maxLength={8000} value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the bottleneck, what you have already tried, and what help you need from CUTAS leadership…" className={`${inputClass} leading-relaxed`} />}
            </Field>
            <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className={btnSecondary}>Cancel</button>
              <button type="submit" disabled={save.busy} className={btnPrimary}>
                {save.busy ? <Spinner className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />} Submit Research Problem
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
        <div className="space-y-4">
          <div className="text-xs text-slate-500 px-1">Showing {challenges.length} recorded item{challenges.length === 1 ? '' : 's'}</div>
          {challenges.map((ch) => (
            <article key={ch.id} className="bg-white rounded-[6px] border border-[#E2E8F0] p-4 sm:p-6 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                  <span className="font-semibold text-slate-800 uppercase tracking-wider">{categoryLabel(ch.category)}</span>
                  <span className="hidden sm:inline text-slate-300" aria-hidden="true">·</span>
                  <span className="text-slate-500">Ref #{ch.id} · Logged {formatDate(ch.createdAt)}</span>
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-[4px] border ${STATUS_STYLES[ch.status]}`}>
                  {CHALLENGE_STATUS_LABELS[ch.status]}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#255190] mt-3 mb-2 break-words">{ch.title}</h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line mb-4 bg-slate-50/60 p-4 rounded-[4px] border border-slate-100 max-w-none break-words">
                {ch.description}
              </p>
              {ch.resolutionNotes ? (
                <div className={`p-4 rounded-[4px] text-xs space-y-1 border ${ch.status === 'RESOLVED' ? 'bg-emerald-50/70 border-emerald-200' : 'bg-blue-50/60 border-blue-200'}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`font-bold flex items-center gap-1.5 ${ch.status === 'RESOLVED' ? 'text-emerald-900' : 'text-blue-900'}`}>
                      <CheckCircle className="w-3.5 h-3.5" />
                      {ch.status === 'RESOLVED' ? 'Official Society Resolution & Action Taken' : 'Administrator update'}
                    </span>
                    {ch.resolvedAt && <span className="text-[10px] text-emerald-700">{formatDateTime(ch.resolvedAt)}</span>}
                  </div>
                  <p className="leading-relaxed whitespace-pre-line pt-1 text-slate-800 max-w-none break-words">{ch.resolutionNotes}</p>
                  {ch.resolvedByName && <div className="text-[10px] text-emerald-700 pt-1">Resolved by: <b>{ch.resolvedByName}</b></div>}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] text-xs text-slate-500 italic flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>Pending review by a CUTAS project leader or assigned faculty mentor.</span>
                </div>
              )}
            </article>
          ))}
          {challenges.length === 0 && (
            <div className="bg-white rounded-[6px] border border-[#E2E8F0] p-8 sm:p-12 text-center text-xs text-slate-500">
              No research problems logged. If you hit roadblocks with Turnitin similarity, equipment, funding or supervision, use "Submit Problem".
            </div>
          )}
        </div>
      )}
    </div>
  );
};
