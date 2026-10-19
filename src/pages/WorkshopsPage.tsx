import React from 'react';
import { User, Workshop, TabId } from '../types';
import { PageHeader } from '../components/PageHeader';
import { Calendar, Clock, MapPin, Users, Video, Shield } from 'lucide-react';

interface WorkshopsPageProps {
  currentUser: User | null;
  workshops: Workshop[];
  onNavigate?: (tab: TabId) => void;
  onAddWorkshop?: (item: Omit<Workshop, 'id'>) => void;
  onEditWorkshop?: (id: string, updated: Partial<Workshop>) => void;
}

export const WorkshopsPage: React.FC<WorkshopsPageProps> = ({
  currentUser,
  workshops,
  onNavigate,
}) => {
  const isCutAdmin = currentUser && currentUser.role !== 'SCHOLAR';

  // Public page only shows published workshops
  const publishedWorkshops = workshops.filter(w => w.status !== 'DRAFT');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        eyebrow="ACADEMIC CAPACITY DEVELOPMENT"
        title="Upcoming Workshops and Seminars"
        description="Specialized colloquiums, thesis writing masterclasses, DHET publishing bootcamps, and research methodology training."
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

      {/* Workshop Cards List */}
      <div className="space-y-6">
        {publishedWorkshops.map((ws) => (
          <div
            key={ws.id}
            className="bg-white rounded-[6px] border border-[#E2E8F0] p-6 sm:p-7 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#255190] uppercase tracking-wider block">
                  {ws.category}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {ws.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Lead Facilitator: <b>{ws.facilitator}</b>
                </p>
              </div>

              <div className="flex sm:flex-col sm:items-end gap-2 flex-shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-[#255190] border border-blue-200 rounded-[4px] text-xs font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  {ws.eventDate}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                  <Clock className="w-3 h-3" /> {ws.eventTime} SAST
                </span>
              </div>
            </div>

            {/* Venue & Synopsis */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-[4px] border border-slate-200">
                {ws.venueOrLink.toLowerCase().includes('http') || ws.venueOrLink.toLowerCase().includes('teams') ? (
                  <Video className="w-4 h-4 text-[#255190] flex-shrink-0" />
                ) : (
                  <MapPin className="w-4 h-4 text-[#255190] flex-shrink-0" />
                )}
                <span className="font-medium">
                  <b>Venue / Link:</b> {ws.venueOrLink}
                </span>
              </div>

              <div className="p-4 bg-white rounded-[4px] border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-line">
                {ws.description}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px] text-slate-400">
                Organised under CUT Academic Society Capacity Building Mandate
              </span>
              <span className="font-semibold text-[#255190]">
                Open to Category A, B, and C Scholars
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
