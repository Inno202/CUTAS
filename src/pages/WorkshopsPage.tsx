import React, { useState } from 'react';
import { Calendar, Clock, ExternalLink, MapPin, Video } from 'lucide-react';
import { publicApi } from '../api/endpoints';
import { PageHeader } from '../components/PageHeader';
import { EmptyState, ErrorBlock, LoadingBlock } from '../components/ui';
import { isAdmin, useAuth } from '../context/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { formatLongDate, safeHref, timeRange } from '../utils/format';
import { ManageInConsole } from './AboutPage';

export const WorkshopsPage: React.FC = () => {
  const { user } = useAuth();
  const [when, setWhen] = useState<'upcoming' | 'past'>('upcoming');
  const { data, error, loading, reload } = useAsync(() => publicApi.workshops(when), [when, user?.id]);
  const items = (data ?? []).filter((w) => w.status === 'PUBLISHED');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        eyebrow="ACADEMIC CAPACITY DEVELOPMENT"
        title="Workshops and Seminars"
        description="Specialised colloquiums, thesis writing masterclasses, DHET publishing bootcamps, and research methodology training."
        actions={isAdmin(user) ? <ManageInConsole section="workshops" /> : undefined}
      />

      <div role="tablist" aria-label="Workshop period" className="inline-flex p-1 bg-slate-100 rounded-[6px] border border-slate-200">
        {(['upcoming', 'past'] as const).map((w) => (
          <button key={w} type="button" role="tab" aria-selected={when === w} onClick={() => setWhen(w)}
            className={`px-4 py-2 text-xs font-semibold rounded-[4px] cursor-pointer ${when === w ? 'bg-white text-[#255190] shadow-xs font-bold' : 'text-slate-600'}`}>
            {w === 'upcoming' ? 'Upcoming' : 'Past events'}
          </button>
        ))}
      </div>

      {loading && !data ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState>{when === 'upcoming' ? 'No workshops are scheduled at the moment.' : 'No past workshops to show.'}</EmptyState>
      ) : (
        <div className="space-y-5 sm:space-y-6">
          {items.map((ws) => {
            const link = safeHref(ws.venueOrLink);
            const online = !!link || /teams|zoom|virtual|online|stream/i.test(ws.venueOrLink);
            return (
              <article key={ws.id} className="bg-white rounded-[6px] border border-[#E2E8F0] p-4 sm:p-7 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1 min-w-0">
                    <span className="text-[11px] font-bold text-[#255190] uppercase tracking-wider block">{ws.category}</span>
                    <h2 className="text-base sm:text-lg font-bold text-[#255190] leading-snug break-words">{ws.title}</h2>
                    <p className="text-xs text-slate-500">Lead Facilitator: <b>{ws.facilitator}</b></p>
                  </div>
                  <div className="flex flex-wrap sm:flex-col sm:items-end gap-2 flex-shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-[#255190] border border-blue-200 rounded-[4px] text-xs font-semibold">
                      <Calendar className="w-3.5 h-3.5" /> {formatLongDate(ws.eventDate)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <Clock className="w-3 h-3" /> {timeRange(ws.eventTime, ws.endTime)} SAST
                    </span>
                  </div>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-[4px] border border-slate-200">
                    {online ? <Video className="w-4 h-4 text-[#255190] flex-shrink-0" /> : <MapPin className="w-4 h-4 text-[#255190] flex-shrink-0" />}
                    <span className="font-medium min-w-0 break-anywhere">
                      <b>Venue / Link:</b>{' '}
                      {link ? (
                        <a href={link} target="_blank" rel="noopener noreferrer nofollow" className="text-blue-700 hover:underline inline-flex items-center gap-1">
                          {ws.venueOrLink} <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : ws.venueOrLink}
                    </span>
                  </div>
                  <div className="p-4 bg-white rounded-[4px] border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-line break-words">{ws.description}</div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <span className="text-[11px] text-slate-400">Organised under the CUT Academic Society capacity building mandate</span>
                  <span className="font-semibold text-[#255190]">Open to Category A, B, and C scholars</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
