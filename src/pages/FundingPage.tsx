import React from 'react';
import { Calendar, ExternalLink, Wallet } from 'lucide-react';
import { publicApi } from '../api/endpoints';
import { PageHeader } from '../components/PageHeader';
import { EmptyState, ErrorBlock, LoadingBlock, StatusPill } from '../components/ui';
import { isAdmin, useAuth } from '../context/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { formatLongDate, isPastDate, safeHref } from '../utils/format';
import { ManageInConsole } from './AboutPage';

export const FundingPage: React.FC = () => {
  const { user } = useAuth();
  const { data, error, loading, reload } = useAsync(() => publicApi.funding(), [user?.id]);
  // Administrators also receive drafts from the API; the public page only ever shows published calls.
  const items = (data ?? []).filter((f) => f.status === 'PUBLISHED' && f.isActive);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        eyebrow="BURSARIES, GRANTS & FELLOWSHIPS"
        title="Funding Available and Application Processes"
        description="National Research Foundation (NRF) calls, CUT postgraduate bursaries, and international research mobility grants."
        actions={isAdmin(user) ? <ManageInConsole /> : undefined}
      />

      {loading && !data ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState>No funding calls are open right now. Check back soon.</EmptyState>
      ) : (
        <div className="space-y-5 sm:space-y-6">
          {items.map((opp) => {
            const closed = isPastDate(opp.deadline);
            const href = safeHref(opp.portalUrl);
            return (
              <article key={opp.id} className="bg-white rounded-[6px] border border-[#E2E8F0] p-4 sm:p-7 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1 min-w-0">
                    <span className="text-[11px] font-bold text-[#255190] uppercase tracking-wider block">{opp.funder}</span>
                    <h2 className="text-base sm:text-lg font-bold text-[#255190] leading-snug break-words">{opp.title}</h2>
                  </div>
                  <div className="flex flex-wrap sm:flex-col sm:items-end gap-2 flex-shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-[4px] text-xs font-semibold">
                      <Wallet className="w-3.5 h-3.5" /> {opp.amountRange}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <Calendar className="w-3 h-3" /> Deadline: {formatLongDate(opp.deadline)}
                    </span>
                    {closed && <StatusPill className="bg-slate-200 text-slate-700">Closed</StatusPill>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs">
                  <div className="space-y-2">
                    <h3 className="font-bold text-[#255190] uppercase tracking-wider text-[11px]">Eligibility Criteria</h3>
                    <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-line break-words">{opp.eligibility}</div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-[#255190] uppercase tracking-wider text-[11px]">Application Process & Steps</h3>
                    <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-line break-words">{opp.applicationProcess}</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {href && !closed ? (
                    <a href={href} target="_blank" rel="noopener noreferrer nofollow"
                      className="h-11 sm:h-10 px-5 bg-[#255190] hover:bg-[#183765] text-white text-xs font-semibold rounded-[4px] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs">
                      <span>Proceed to Application Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-500">{closed ? 'Applications for this call have closed.' : ''}</span>
                  )}
                  <span className="text-[11px] text-slate-400">Institutional Endorsement: CUT Research Development Office</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
