import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { adminApi, directoryApi } from '../../api/endpoints';
import { Alert, ErrorBlock, LoadingBlock, Spinner, inputClass } from '../../components/ui';
import { CATEGORY_LABELS } from '../../constants';
import { errorMessage } from '../../hooks/useAsync';
import type { DirectoryPage, ScholarCategory } from '../../types';
import { Pager, SectionCard, SectionProps, useDebounced } from './shared';

const OPTIONS: { value: ScholarCategory; label: string }[] = [
  { value: 'CAT_A', label: 'Category A (PhD / Postdoc)' },
  { value: 'CAT_B', label: "Category B (Master's)" },
  { value: 'CAT_C', label: 'Category C (Honours)' },
];

export const ScholarsSection: React.FC<SectionProps> = ({ onChanged }) => {
  const [search, setSearch] = useState('');
  const query = useDebounced(search);
  const [category, setCategory] = useState<ScholarCategory | ''>('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<DirectoryPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => setPage(1), [query, category]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    directoryApi.list({ search: query, category, page })
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(errorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [query, category, page, reloadKey]);

  const assign = async (id: number, name: string, value: ScholarCategory) => {
    setSaving(id);
    setNotice(null);
    try {
      await adminApi.setCategory(id, value);
      setData((d) => d && { ...d, results: d.results.map((r) => (r.id === id ? { ...r, category: value } : r)) });
      setNotice({ type: 'success', text: `${name} is now in ${CATEGORY_LABELS[value]}.` });
      onChanged();
    } catch (e) {
      setNotice({ type: 'error', text: errorMessage(e) });
    } finally {
      setSaving(null);
    }
  };

  const rows = data?.results ?? [];
  const select = (id: number, name: string, value: ScholarCategory) => (
    <div className="flex items-center gap-2">
      <select value={value} disabled={saving === id} onChange={(e) => assign(id, name, e.target.value as ScholarCategory)}
        aria-label={`Category for ${name}`}
        className="px-2 py-1.5 text-xs font-bold rounded-[4px] border border-slate-300 bg-white text-[#255190] cursor-pointer w-full sm:w-auto">
        {OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {saving === id && <Spinner className="w-3.5 h-3.5 text-[#255190]" />}
    </div>
  );

  return (
    <SectionCard title="Scholars Directory & Tier Assignments" description="Administrators assign scholar categories (A/B/C). Scholars cannot change their own category.">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input type="search" placeholder="Name, student number, e-mail, faculty…" aria-label="Search scholars" maxLength={100}
            value={search} onChange={(e) => setSearch(e.target.value)} className={`${inputClass} pl-8`} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value as ScholarCategory | '')} aria-label="Filter by category" className={`${inputClass} sm:w-48`}>
          <option value="">All categories</option>
          {OPTIONS.map((o) => <option key={o.value} value={o.value}>{CATEGORY_LABELS[o.value]}</option>)}
        </select>
      </div>
      {notice && <Alert type={notice.type} onClose={() => setNotice(null)}>{notice.text}</Alert>}

      {loading && !data ? <LoadingBlock /> : error ? <ErrorBlock message={error} onRetry={() => setReloadKey((k) => k + 1)} /> : rows.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-8">No scholars found.</p>
      ) : (
        <>
          <ul className="md:hidden space-y-3">
            {rows.map((s) => (
              <li key={s.id} className="p-3 border border-slate-200 rounded-[6px] space-y-2 text-xs">
                <div>
                  <div className="font-semibold text-slate-900">{s.title ? `${s.title} ` : ''}{s.name}</div>
                  <div className="text-[11px] text-slate-500 break-all">{s.email}</div>
                  <div className="text-[11px] text-slate-500">{s.studentNumber || 'No student number'} · {s.faculty}</div>
                </div>
                {select(s.id, s.name, s.category)}
              </li>
            ))}
          </ul>
          <div className="hidden md:block border border-slate-200 rounded-[6px] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Scholar</th>
                  <th scope="col" className="p-3 font-semibold whitespace-nowrap">Student / Staff No.</th>
                  <th scope="col" className="p-3 font-semibold">Faculty / Department</th>
                  <th scope="col" className="p-3 font-semibold">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 align-top">
                    <td className="p-3 min-w-[180px]">
                      <span className="font-semibold text-slate-900 block">{s.title ? `${s.title} ` : ''}{s.name}</span>
                      <span className="text-[11px] text-slate-500 break-all">{s.email}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-700">{s.studentNumber || '—'}</td>
                    <td className="p-3 text-slate-600 max-w-[240px]">
                      <span className="block">{s.faculty}</span>
                      <span className="text-[11px] text-slate-400 block">{s.department}</span>
                    </td>
                    <td className="p-3">{select(s.id, s.name, s.category)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {data && <Pager page={page} count={data.count} onPage={setPage} />}
    </SectionCard>
  );
};
