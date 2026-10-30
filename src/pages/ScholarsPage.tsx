import React, { useEffect, useState } from 'react';
import { CheckCircle, Eye, FileText, Lock, Search } from 'lucide-react';
import { directoryApi } from '../api/endpoints';
import { Avatar } from '../components/Avatar';
import { PageHeader } from '../components/PageHeader';
import { EmptyState, ErrorBlock, LoadingBlock, Modal, Spinner, btnSecondary, inputClass } from '../components/ui';
import { CATEGORY_DESCRIPTIONS, CATEGORY_LABELS } from '../constants';
import { errorMessage } from '../hooks/useAsync';
import type { DirectoryPage, DirectoryScholar, ScholarCategory } from '../types';
import { nameInitials } from '../utils/format';

type Filter = ScholarCategory | 'ALL';

export const ScholarsPage: React.FC = () => {
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState<DirectoryPage | null>(null);
  const [rows, setRows] = useState<DirectoryScholar[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageNo, setPageNo] = useState(1);
  const [viewing, setViewing] = useState<DirectoryScholar | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Debounce typing so the API is not called on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    directoryApi
      .list({ category: filter === 'ALL' ? '' : filter, search: query, page: 1 })
      .then((d) => {
        if (cancelled) return;
        setPage(d);
        setRows(d.results);
        setPageNo(1);
      })
      .catch((e) => !cancelled && setError(errorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [filter, query, reloadKey]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const d = await directoryApi.list({ category: filter === 'ALL' ? '' : filter, search: query, page: pageNo + 1 });
      setRows((prev) => [...prev, ...d.results]);
      setPage(d);
      setPageNo((n) => n + 1);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoadingMore(false);
    }
  };

  const counts = page?.counts;
  const tabs: { key: Filter; label: string }[] = [
    { key: 'ALL', label: 'All Scholars' },
    { key: 'CAT_A', label: 'Category A' },
    { key: 'CAT_B', label: 'Category B' },
    { key: 'CAT_C', label: 'Category C' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CUT Postgraduate Cohort"
        title="Scholars Directory"
        description="Registered postgraduate researchers grouped across academic categories at Central University of Technology."
      />

      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div role="tablist" aria-label="Scholar category" className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-[6px] border border-slate-200 lg:flex-1 lg:max-w-2xl">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={filter === t.key}
              onClick={() => setFilter(t.key)}
              className={`sm:flex-1 text-center py-2 px-3 text-xs font-semibold rounded-[4px] transition-all cursor-pointer ${
                filter === t.key ? 'bg-white text-[#255190] shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
              {counts && ` (${counts[t.key] ?? 0})`}
            </button>
          ))}
        </div>
        <div className="relative lg:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, faculty or department"
            aria-label="Search scholars"
            maxLength={100}
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>

      <div className="bg-amber-50/60 border border-amber-200/80 rounded-[4px] p-3 text-xs text-amber-900">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {(['CAT_A', 'CAT_B', 'CAT_C'] as ScholarCategory[]).map((c, i) => (
            <React.Fragment key={c}>
              {i > 0 && <span aria-hidden="true">·</span>}
              <span>
                <b>{CATEGORY_LABELS[c].replace('Category ', 'Cat ')}:</b> {CATEGORY_DESCRIPTIONS[c]}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {error && <ErrorBlock message={error} onRetry={() => setReloadKey((k) => k + 1)} />}
      {loading ? (
        <LoadingBlock label="Loading scholars…" />
      ) : rows.length === 0 ? (
        <EmptyState>{query ? `No scholars match "${query}".` : 'No scholars in this category yet.'}</EmptyState>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {rows.map((s) => (
              <article key={s.id} className="bg-white rounded-[6px] border border-[#E2E8F0] p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar name={s.name} initialsText={nameInitials(s.name)} pictureUrl={s.pictureUrl} size="lg" tone="light" className="w-16 h-16 text-lg" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#255190] block">{CATEGORY_LABELS[s.category]}</span>
                      <h3 className="text-base font-bold text-[#255190] break-words">{s.title ? `${s.title} ` : ''}{s.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{s.faculty}</p>
                      {s.department && <p className="text-[11px] text-slate-400 truncate">{s.department}</p>}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">{s.bio || 'No biography added yet.'}</p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-400 text-[11px] truncate">{s.studentNumber ? `ID: ${s.studentNumber}` : ''}</span>
                  <button
                    type="button"
                    onClick={() => setViewing(s)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-blue-50 text-[#255190] font-semibold rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#255190]" />
                    View Short CV
                  </button>
                </div>
              </article>
            ))}
          </div>
          {page?.next && (
            <div className="text-center">
              <button type="button" onClick={loadMore} disabled={loadingMore} className={btnSecondary}>
                {loadingMore && <Spinner className="w-3.5 h-3.5" />} Show more scholars ({rows.length} of {page.count})
              </button>
            </div>
          )}
        </>
      )}

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        size="lg"
        tone="brand"
        title={
          viewing && (
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#FDB813] flex-shrink-0" />
              <span className="truncate">Curriculum Vitae: {viewing.title ? `${viewing.title} ` : ''}{viewing.name}</span>
            </span>
          )
        }
        footer={
          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
              <CheckCircle className="w-3.5 h-3.5" /> Registered CUT scholar
            </span>
            <button type="button" onClick={() => setViewing(null)} className={btnSecondary}>
              Close Viewer
            </button>
          </div>
        }
      >
        {viewing && (
          <div className="space-y-5" onCopy={(e) => e.preventDefault()}>
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-[4px] text-amber-900 text-[11px] flex items-start gap-2">
              <Lock className="w-4 h-4 text-amber-700 flex-shrink-0" aria-hidden="true" />
              <span>
                <b>POPIA privacy notice:</b> scholar CVs are shown in-portal for verified academic collaboration only. Downloadable copies are not available.
              </span>
            </div>
            <div className="flex items-start gap-4 pb-4 border-b border-slate-200">
              <Avatar name={viewing.name} initialsText={nameInitials(viewing.name)} pictureUrl={viewing.pictureUrl} size="lg" />
              <div className="min-w-0">
                <div className="font-bold text-base text-slate-900 break-words">{viewing.title ? `${viewing.title} ` : ''}{viewing.name}</div>
                <div className="text-slate-600">{CATEGORY_LABELS[viewing.category]} · {viewing.faculty}</div>
                {viewing.department && <div className="text-slate-500">{viewing.department}</div>}
              </div>
            </div>
            <section>
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#255190] mb-2">Scholarly Biography</h3>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-[4px] border border-[#E2E8F0] max-w-none whitespace-pre-line break-words">
                {viewing.bio || 'No biography added yet.'}
              </p>
            </section>
            <section>
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#255190] mb-2">Academic Credentials & Research Track</h3>
              <div className="bg-slate-50 p-4 rounded-[4px] border border-[#E2E8F0] text-xs leading-relaxed text-slate-800 whitespace-pre-line break-words">
                {viewing.cvSummaryText || 'No CV summary added yet.'}
              </div>
            </section>
          </div>
        )}
      </Modal>
    </div>
  );
};
