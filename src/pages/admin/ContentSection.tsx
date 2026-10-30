import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { adminApi, publicApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { Alert, Field, LoadingBlock, Spinner, btnPrimary, inputClass } from '../../components/ui';
import { useAction } from '../../hooks/useAsync';
import type { ContentKey, PublishStatus } from '../../types';
import { formatDateTime } from '../../utils/format';
import { FilterChips, SectionCard, SectionProps } from './shared';

const KEYS: { value: ContentKey; label: string }[] = [
  { value: 'about_us', label: 'About Us' },
  { value: 'project_leaders', label: 'Leaders & Governance' },
  { value: 'landing_intro', label: 'Home page intro' },
];

export const ContentSection: React.FC<SectionProps> = () => {
  const [key, setKey] = useState<ContentKey>('about_us');
  const [title, setTitle] = useState('');
  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<PublishStatus>('PUBLISHED');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const save = useAction();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    save.clear();
    publicApi.content(key)
      .then((c) => {
        if (cancelled) return;
        setTitle(c.title); setHeadline(c.headline); setBody(c.body); setStatus(c.status); setUpdatedAt(c.updatedAt);
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 404) {
          setTitle(''); setHeadline(''); setBody(''); setStatus('PUBLISHED'); setUpdatedAt(null);
        } else setLoadError(e.message);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await save.run(() => adminApi.saveContent(key, { title, headline, body, status }));
    if (res) {
      setUpdatedAt(res.updatedAt);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <SectionCard
      title="Public Institutional Content"
      description="Publish and update the About Us, Leaders and home page text. Changes appear on the public site immediately."
      actions={<FilterChips label="Page" value={key} options={KEYS} onChange={setKey} />}
    >
      {loading ? (
        <LoadingBlock />
      ) : loadError ? (
        <Alert type="error">{loadError}</Alert>
      ) : (
        <form onSubmit={submit} className="space-y-4 text-xs">
          {saved && <Alert type="success">Content saved{status === 'DRAFT' ? ' as a draft (hidden from the public)' : ' and published'}.</Alert>}
          {save.error && <Alert type="error">{save.error}</Alert>}
          <Field label="Page Title" required error={save.errors.title}>
            {(id) => <input id={id} type="text" required maxLength={255} value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />}
          </Field>
          <Field label="Headline / Subtitle" error={save.errors.headline}>
            {(id) => <input id={id} type="text" maxLength={350} value={headline} onChange={(e) => setHeadline(e.target.value)} className={inputClass} />}
          </Field>
          <Field label="Body text" required error={save.errors.body} hint={`${body.length.toLocaleString()} / 20,000 characters · line breaks are kept`}>
            {(id) => <textarea id={id} rows={12} required maxLength={20000} value={body} onChange={(e) => setBody(e.target.value)} className={`${inputClass} leading-relaxed`} />}
          </Field>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <fieldset className="flex flex-wrap items-center gap-4">
              <legend className="sr-only">Visibility</legend>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="content_status" checked={status === 'PUBLISHED'} onChange={() => setStatus('PUBLISHED')} className="w-4 h-4 text-[#255190]" />
                <span className="font-semibold text-slate-800">Published</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="content_status" checked={status === 'DRAFT'} onChange={() => setStatus('DRAFT')} className="w-4 h-4" />
                <span className="text-slate-600">Draft (hidden)</span>
              </label>
            </fieldset>
            <button type="submit" disabled={save.busy} className={btnPrimary}>
              {save.busy ? <Spinner className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />} Save {KEYS.find((k) => k.value === key)?.label}
            </button>
          </div>
          {updatedAt && <p className="text-[11px] text-slate-400">Last updated {formatDateTime(updatedAt)}</p>}
        </form>
      )}
    </SectionCard>
  );
};
