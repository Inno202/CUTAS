import React from 'react';
import { Shield } from 'lucide-react';
import { ApiError } from '../api/client';
import { publicApi } from '../api/endpoints';
import { PageHeader } from '../components/PageHeader';
import { EmptyState, ErrorBlock, LoadingBlock } from '../components/ui';
import { SOCIETY_THEME } from '../constants';
import { isAdmin, useAuth } from '../context/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { navigate } from '../router';
import { formatDateTime } from '../utils/format';

export const ManageInConsole: React.FC = () => (
  <button
    type="button"
    onClick={() => navigate('admin_dashboard')}
    className="text-xs text-[#255190] hover:underline font-semibold flex items-center gap-1.5 py-1.5 px-2.5 rounded-[4px] bg-blue-50 border border-blue-200 cursor-pointer"
  >
    <Shield className="w-3.5 h-3.5 text-[#255190]" />
    <span>Manage in Admin Console</span>
  </button>
);

export const AboutPage: React.FC = () => {
  const { user } = useAuth();
  const { data: content, error, loading, reload } = useAsync(
    () =>
      publicApi.content('about_us').catch((e: unknown) => {
        if (e instanceof ApiError && e.status === 404) return null; // not written / published yet
        throw e;
      }),
    [],
  );

  if (loading && !content) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} onRetry={reload} />;
  if (!content) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          eyebrow="INSTITUTIONAL IDENTITY & MANDATE"
          title="About CUT Academic Society"
          actions={isAdmin(user) ? <ManageInConsole /> : undefined}
        />
        <EmptyState>The About page has not been published yet. Please check back soon.</EmptyState>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        eyebrow="INSTITUTIONAL IDENTITY & MANDATE"
        title={content.title}
        description={content.headline}
        actions={isAdmin(user) ? <ManageInConsole /> : undefined}
      />
      <article className="bg-white rounded-[6px] border border-[#E2E8F0] p-5 sm:p-8 shadow-xs space-y-6">
        <div className="p-4 bg-amber-50/70 rounded-[4px] border-l-4 border-[#FDB813] text-xs text-amber-950 font-medium italic">
          "{SOCIETY_THEME}"
        </div>
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line break-words">{content.body}</div>
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>Last updated: {formatDateTime(content.updatedAt)}</span>
          <span>Central University of Technology, Free State</span>
        </div>
      </article>
    </div>
  );
};
