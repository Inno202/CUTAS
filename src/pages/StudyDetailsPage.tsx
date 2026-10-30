import React, { useEffect, useState } from 'react';
import { Edit3, FileDown, Save } from 'lucide-react';
import { studyApi } from '../api/endpoints';
import { PageHeader, PageHeaderButton } from '../components/PageHeader';
import { Alert, ErrorBlock, Field, LoadingBlock, Spinner, btnPrimary, btnSecondary, inputClass } from '../components/ui';
import { CATEGORY_LABELS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useAction, useAsync } from '../hooks/useAsync';
import type { StudyDetails } from '../types';
import { fullName } from '../utils/format';

const EMPTY: StudyDetails = {
  programme: '', university: '', yearOfStarting: new Date().getFullYear(), anticipatedYearOfCompletion: new Date().getFullYear() + 2,
  supervisor: '', coSupervisor: '', funding: '', researchTopic: '', researchAbstract: '',
};

export const StudyDetailsPage: React.FC = () => {
  const { user } = useAuth();
  const { data, error, loading, reload, setData } = useAsync(() => studyApi.get(), []);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<StudyDetails>(EMPTY);
  const [saved, setSaved] = useState(false);
  const save = useAction();
  const pdf = useAction();

  useEffect(() => {
    if (data) setForm({ ...EMPTY, ...data });
  }, [data]);

  if (!user) return null;
  if (loading && !data) return <LoadingBlock />;
  if (error && !data) return <ErrorBlock message={error} onRetry={reload} />;
  const study = data ?? EMPTY;

  const set = <K extends keyof StudyDetails>(k: K, v: StudyDetails[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await save.run(() => studyApi.update(form));
    if (updated) {
      setData(updated);
      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    }
  };

  const text = (key: keyof StudyDetails, label: string, opts: { required?: boolean; span?: boolean; max?: number } = {}) => (
    <Field label={label} required={opts.required} error={save.errors[key]} className={opts.span ? 'sm:col-span-2' : ''}>
      {(id) => (
        <input
          id={id}
          type="text"
          value={String(form[key] ?? '')}
          onChange={(e) => set(key, e.target.value as never)}
          required={opts.required}
          maxLength={opts.max ?? 255}
          className={inputClass}
        />
      )}
    </Field>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        eyebrow="Academic Enrolment & Supervision"
        title="Details on Your Studies"
        description="Official postgraduate degree records, supervisory arrangements, research topic, and funding status."
        actions={
          <PageHeaderButton
            variant="primary"
            onClick={() => pdf.run(() => studyApi.pdf())}
            disabled={pdf.busy}
            icon={pdf.busy ? <Spinner className="w-4 h-4" /> : <FileDown className="w-4 h-4 text-[#FDB813]" />}
          >
            Download Study Dossier (PDF)
          </PageHeaderButton>
        }
      />

      {pdf.error && <Alert type="error" onClose={pdf.clear}>{pdf.error}</Alert>}
      {saved && <Alert type="success">Study records updated and saved to the CUTAS database.</Alert>}

      <div className="bg-white rounded-[6px] border border-[#E2E8F0] p-5 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-200">
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-[#255190] uppercase tracking-wider block">Enrolled Postgraduate Scholar</span>
            <h2 className="text-lg sm:text-xl font-bold text-[#255190] mt-0.5 break-words">{fullName(user)}</h2>
            <div className="text-xs text-slate-500 mt-0.5">
              {user.studentNumber ? `Student ID: ${user.studentNumber} · ` : ''}
              {CATEGORY_LABELS[user.category]}
              {user.faculty ? ` · ${user.faculty}` : ''}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsEditing(!isEditing);
              setForm({ ...EMPTY, ...study });
              save.clear();
            }}
            className="self-start sm:self-auto px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditing ? 'Cancel Editing' : 'Update Details'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="py-6 space-y-4" noValidate={false}>
            {save.error && <Alert type="error">{save.error}</Alert>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {text('programme', 'Academic Programme', { required: true })}
              {text('university', 'University / Institution', { required: true })}
              <Field label="Commencement Year" required error={save.errors.yearOfStarting}>
                {(id) => (
                  <input id={id} type="number" inputMode="numeric" min={1950} max={2100} required value={form.yearOfStarting}
                    onChange={(e) => set('yearOfStarting', parseInt(e.target.value, 10) || 0)} className={inputClass} />
                )}
              </Field>
              <Field label="Anticipated Completion Year" required error={save.errors.anticipatedYearOfCompletion}>
                {(id) => (
                  <input id={id} type="number" inputMode="numeric" min={1950} max={2100} required value={form.anticipatedYearOfCompletion}
                    onChange={(e) => set('anticipatedYearOfCompletion', parseInt(e.target.value, 10) || 0)} className={inputClass} />
                )}
              </Field>
              {text('supervisor', 'Primary Supervisor', { required: true })}
              {text('coSupervisor', 'Co-Supervisor (if applicable)')}
              {text('funding', 'Funding Mechanism / Bursary', { required: true, span: true })}
              {text('researchTopic', 'Approved Research Topic', { required: true, span: true, max: 400 })}
              <Field label="Research Abstract & Methodology" required error={save.errors.researchAbstract} className="sm:col-span-2"
                hint={`${form.researchAbstract.length.toLocaleString()} / 12,000 characters`}>
                {(id) => (
                  <textarea id={id} rows={7} required maxLength={12000} value={form.researchAbstract}
                    onChange={(e) => set('researchAbstract', e.target.value)} className={`${inputClass} leading-relaxed`} />
                )}
              </Field>
            </div>
            <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button type="button" onClick={() => setIsEditing(false)} className={btnSecondary}>Cancel</button>
              <button type="submit" disabled={save.busy} className={btnPrimary}>
                {save.busy ? <Spinner className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />} Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="py-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">Academic Programme</span>
                <span className="text-sm font-semibold text-slate-900 block mt-1 break-words">{study.programme}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">University</span>
                <span className="text-sm font-semibold text-slate-900 block mt-1 break-words">{study.university}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">Registration Timeline</span>
                <span className="text-xs text-slate-800 block mt-1">
                  Commenced: <b>{study.yearOfStarting}</b> · Anticipated Completion: <b>{study.anticipatedYearOfCompletion}</b>
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">Supervisory Advisory Team</span>
                <span className="text-xs text-slate-800 block mt-1 break-words">
                  <b>{study.supervisor}</b>
                  {study.coSupervisor && ` · Co: ${study.coSupervisor}`}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">Funding</span>
                <span className="text-xs font-semibold text-emerald-800 block mt-1 bg-emerald-50 p-2.5 rounded-[4px] border border-emerald-200 break-words">
                  {study.funding}
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px] mb-1">Approved Research Topic</span>
              <h3 className="text-base font-bold text-[#255190] leading-snug break-words">{study.researchTopic}</h3>
            </div>
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px] mb-2">Research Abstract & Methodology Outline</span>
              <div className="p-4 bg-slate-50 rounded-[4px] border border-[#E2E8F0] text-xs text-slate-700 leading-relaxed whitespace-pre-line break-words">
                {study.researchAbstract}
              </div>
            </div>
          </div>
        )}
        <div className="pt-6 border-t border-slate-100 text-[11px] text-slate-400">Central University of Technology Postgraduate Research Records</div>
      </div>
    </div>
  );
};
