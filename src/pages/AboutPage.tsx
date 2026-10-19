import React from 'react';
import { User, InstitutionalContent, TabId } from '../types';
import { PageHeader } from '../components/PageHeader';
import { Shield } from 'lucide-react';

interface AboutPageProps {
  currentUser: User | null;
  content: InstitutionalContent;
  onNavigate?: (tab: TabId) => void;
  onUpdateContent?: (key: 'about_us' | 'project_leaders', title: string, headline: string, body: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  currentUser,
  content,
  onNavigate,
}) => {
  const isCutAdmin = currentUser && currentUser.role !== 'SCHOLAR';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        eyebrow="INSTITUTIONAL IDENTITY & MANDATE"
        title={content.title}
        description={content.headline}
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

      {/* Main Narrative Card */}
      <div className="bg-white rounded-[6px] border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="p-4 bg-amber-50/70 rounded-[4px] border-l-4 border-[#FDB813] text-xs text-amber-950 font-medium italic">
          "Bringing back intellectualism within the corridors of Higher Education: Creating a new generation of thinkers in UoTs"
        </div>

        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
          {content.body}
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>Last updated: {content.updatedAt}</span>
          <span>Central University of Technology, Free State</span>
        </div>
      </div>
    </div>
  );
};
