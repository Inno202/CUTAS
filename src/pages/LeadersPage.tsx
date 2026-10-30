import React from 'react';
import { Mail } from 'lucide-react';
import { publicApi } from '../api/endpoints';
import { Avatar } from '../components/Avatar';
import { PageHeader } from '../components/PageHeader';
import { ErrorBlock, LoadingBlock } from '../components/ui';
import { isAdmin, useAuth } from '../context/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { nameInitials } from '../utils/format';
import { ManageInConsole } from './AboutPage';

export const LeadersPage: React.FC = () => {
  const { user } = useAuth();
  const content = useAsync(() => publicApi.content('project_leaders').catch(() => null), []);
  const leaders = useAsync(() => publicApi.leaders(), []);

  if ((content.loading && content.data === undefined) || (leaders.loading && !leaders.data)) return <LoadingBlock />;
  if (leaders.error) return <ErrorBlock message={leaders.error} onRetry={leaders.reload} />;

  const page = content.data;
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PageHeader
        eyebrow="SOCIETY GOVERNANCE & STEWARDSHIP"
        title={page?.title ?? 'Project Leaders and Society Administrators'}
        description={page?.headline}
        actions={isAdmin(user) ? <ManageInConsole /> : undefined}
      />

      {page?.body && (
        <div className="bg-white rounded-[6px] border border-[#E2E8F0] p-5 sm:p-8 shadow-xs">
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line break-words">{page.body}</div>
        </div>
      )}

      <section>
        <h2 className="text-base font-semibold text-[#255190] uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
          Active Steering Committee & Society Administrators
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {(leaders.data ?? []).map((admin) => (
            <article key={admin.id} className="bg-white rounded-[6px] border border-[#E2E8F0] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start gap-3.5 sm:gap-4 mb-4">
                  <Avatar name={admin.name} initialsText={nameInitials(admin.name)} pictureUrl={admin.pictureUrl} size="lg" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#255190] block">
                      {admin.role === 'SUPERADMIN' ? 'Super Administrator' : 'Project Leader & Administrator'}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-[#255190] break-words">
                      {admin.title ? `${admin.title} ` : ''}{admin.name}
                    </h3>
                    {admin.faculty && <p className="text-xs text-slate-600 mt-0.5">{admin.faculty}</p>}
                    {admin.department && <p className="text-[11px] text-slate-400">{admin.department}</p>}
                  </div>
                </div>
                {admin.bio && <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed mb-4">{admin.bio}</p>}
              </div>
              {admin.email && (
                <div className="pt-4 border-t border-slate-100 text-xs">
                  <a href={`mailto:${admin.email}`} className="flex items-center gap-1.5 text-[#255190] hover:underline break-all">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" /> {admin.email}
                  </a>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
