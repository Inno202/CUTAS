import React from 'react';
import { User, InstitutionalContent, TabId } from '../types';
import { PageHeader } from '../components/PageHeader';
import { Mail, Shield } from 'lucide-react';

interface LeadersPageProps {
  currentUser: User | null;
  content: InstitutionalContent;
  administrators: User[];
  onNavigate?: (tab: TabId) => void;
  onUpdateContent?: (key: 'about_us' | 'project_leaders', title: string, headline: string, body: string) => void;
}

export const LeadersPage: React.FC<LeadersPageProps> = ({
  currentUser,
  content,
  administrators,
  onNavigate,
}) => {
  const isCutAdmin = currentUser && currentUser.role !== 'SCHOLAR';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PageHeader
        eyebrow="SOCIETY GOVERNANCE & STEWARDSHIP"
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

      {/* Governance Narrative Card */}
      <div className="bg-white rounded-[6px] border border-[#E2E8F0] p-6 sm:p-8 shadow-xs">
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
          {content.body}
        </div>
      </div>

      {/* Leadership Profile Cards */}
      <div>
        <h2 className="text-base font-semibold text-[#255190] uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
          Active Steering Committee & Society Administrators
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {administrators.map((admin) => (
            <div
              key={admin.id}
              className="bg-white rounded-[6px] border border-[#E2E8F0] p-5 sm:p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start space-x-3.5 sm:space-x-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-[#255190] text-white flex items-center justify-center font-bold text-base flex-shrink-0 shadow-xs">
                    {admin.firstName[0]}{admin.lastName[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#255190] block">
                      {admin.role === 'SUPER_ADMIN' ? 'Super Administrator' : 'Project Leader & Administrator'}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {admin.title} {admin.firstName} {admin.lastName}
                    </h3>
                    <p className="text-xs text-slate-600 truncate mt-0.5">{admin.faculty}</p>
                    <p className="text-[11px] text-slate-400 truncate">{admin.department}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {admin.bio}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 text-[#255190] break-all">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" /> {admin.email}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
