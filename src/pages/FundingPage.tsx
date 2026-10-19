import React from 'react';
import { User, FundingOpportunity, TabId } from '../types';
import { PageHeader } from '../components/PageHeader';
import { ExternalLink, Calendar, DollarSign, CheckCircle2, Shield } from 'lucide-react';

interface FundingPageProps {
  currentUser: User | null;
  funding: FundingOpportunity[];
  onNavigate?: (tab: TabId) => void;
  onAddFunding?: (item: Omit<FundingOpportunity, 'id'>) => void;
  onEditFunding?: (id: string, updated: Partial<FundingOpportunity>) => void;
}

export const FundingPage: React.FC<FundingPageProps> = ({
  currentUser,
  funding,
  onNavigate,
}) => {
  const isCutAdmin = currentUser && currentUser.role !== 'SCHOLAR';

  // Public page only shows published items
  const publishedFunding = funding.filter(f => f.status !== 'DRAFT');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        eyebrow="BURSARIES, GRANTS & FELLOWSHIPS"
        title="Funding Available and Application Processes"
        description="Comprehensive directory of National Research Foundation (NRF) calls, CUT postgraduate bursaries, and international research mobility grants."
        actions={
          isCutAdmin && onNavigate ? (
            <button
              onClick={() => onNavigate('admin_dashboard')}
              className="text-xs text-[#255190] hover:underline font-semibold flex items-center gap-1.5 py-1 px-2.5 rounded-[4px] bg-blue-50 border border-blue-200 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-[#255190]" />
              <span>Manage in Admin Console</span>
            </button>
          ) : undefined
        }
      />

      {/* Funding Cards List */}
      <div className="space-y-6">
        {publishedFunding.map((opp) => (
          <div
            key={opp.id}
            className="bg-white rounded-[6px] border border-[#E2E8F0] p-6 sm:p-7 shadow-xs space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#255190] uppercase tracking-wider block">
                  {opp.funder}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {opp.title}
                </h3>
              </div>

              <div className="flex sm:flex-col sm:items-end gap-2 flex-shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-[4px] text-xs font-semibold">
                  <DollarSign className="w-3.5 h-3.5" />
                  {opp.amountRange}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                  <Calendar className="w-3 h-3" /> Deadline: {opp.deadline}
                </span>
              </div>
            </div>

            {/* Eligibility & Process */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Eligibility Criteria
                </h4>
                <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-line">
                  {opp.eligibility}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Application Process & Steps
                </h4>
                <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-line">
                  {opp.applicationProcess}
                </div>
              </div>
            </div>

            {/* Footer with External Link */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <a
                href={opp.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-5 bg-[#255190] hover:bg-[#183765] text-white text-xs font-semibold rounded-[4px] flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <span>Proceed to Application Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <span className="text-[11px] text-slate-400">
                Institutional Endorsement: CUT Research Development Office
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
