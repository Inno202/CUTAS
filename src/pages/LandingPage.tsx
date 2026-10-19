import React from 'react';
import { User, FundingOpportunity, Workshop, TabId } from '../types';
import heroCampusImage from '../assets/images/cutas_hero_banner_1792291983153.jpg';
import { 
  ArrowRight, Calendar, MapPin, DollarSign, Bell, Shield, Sparkles, CheckCircle2
} from 'lucide-react';

interface LandingPageProps {
  currentUser: User | null;
  funding: FundingOpportunity[];
  workshops: Workshop[];
  scholarsCount: number;
  publicationsCount: number;
  resolvedChallengesCount: number;
  onNavigate: (tab: TabId) => void;
  onEditFunding?: () => void;
  onAddFunding?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentUser,
  funding,
  workshops,
  scholarsCount,
  publicationsCount,
  resolvedChallengesCount,
  onNavigate,
}) => {
  const isCutAdmin = currentUser && currentUser.role !== 'SCHOLAR';

  // Read from same source of truth - published items only
  const publishedFunding = funding.filter(f => f.status !== 'DRAFT');
  const featuredFunding = publishedFunding.filter(f => f.featuredOnLanding && f.isActive).slice(0, 3);
  const publishedWorkshops = workshops.filter(w => w.status !== 'DRAFT').slice(0, 3);

  // Auto-generated "Recent updates" feed from published actions (latest 5, newest first)
  const recentUpdates = [
    ...publishedFunding.map(f => ({
      id: `up_f_${f.id}`,
      type: 'funding' as const,
      title: `New funding call: ${f.title}`,
      subtitle: `${f.funder} · Deadline: ${f.deadline}`,
      date: f.publishedAt || f.deadline || 'Recent',
      tab: 'funding' as TabId,
    })),
    ...publishedWorkshops.map(w => ({
      id: `up_w_${w.id}`,
      type: 'workshop' as const,
      title: `Workshop scheduled: ${w.title}`,
      subtitle: `${w.eventDate} at ${w.eventTime} SAST · By ${w.facilitator}`,
      date: w.publishedAt || w.eventDate || 'Upcoming',
      tab: 'workshops' as TabId,
    })),
  ].slice(0, 5);

  return (
    <div className="space-y-10">
      {/* Hero Banner Section (220-320px height, --cut-navy overlay at 75-80% opacity) */}
      <div className="relative rounded-[6px] overflow-hidden border border-slate-200 shadow-xs bg-[#183765] min-h-[240px] sm:min-h-[280px] max-h-[320px] flex items-center">
        {/* Campus Image Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroCampusImage}
            alt="Central University of Technology Campus"
            className="w-full h-full object-cover opacity-25"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#183765]/95 via-[#183765]/85 to-[#255190]/75"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 p-6 sm:p-10 max-w-4xl text-white">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#FDB813] mb-2.5">
            <span>Central University of Technology, Free State</span>
            <span>·</span>
            <span>Postgraduate Academic Portal</span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-white mb-3 leading-tight">
            Central University of Technology Academic Society
          </h1>

          <div className="p-3 bg-white/10 backdrop-blur-xs rounded-[4px] border-l-4 border-[#FDB813] mb-3 max-w-2xl">
            <p className="text-xs sm:text-sm font-serif italic text-amber-100 leading-relaxed">
              "Bringing back intellectualism within the corridors of Higher Education: Creating a new generation of thinkers in UoTs"
            </p>
          </div>

          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-2xl">
            A scholar-led academic society fostering rigorous inquiry, peer thesis review, DHET-accredited publication outputs, competitive national funding, and institutional challenge resolution.
          </p>
        </div>
      </div>

      {/* Auto-generated Recent Updates Feed (Task 1.3) */}
      {recentUpdates.length > 0 && (
        <section className="bg-white rounded-[6px] border border-[#E2E8F0] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-[4px] bg-blue-100 text-[#255190] flex items-center justify-center">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#255190]">
                Recent Institutional Updates
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">Live Feed</span>
          </div>

          <div className="divide-y divide-slate-100">
            {recentUpdates.map((update) => (
              <div
                key={update.id}
                onClick={() => onNavigate(update.tab)}
                className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 px-2 rounded-[4px] transition-colors cursor-pointer group"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-900 group-hover:text-[#255190] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FDB813]"></span>
                    {update.title}
                  </span>
                  <p className="text-[11px] text-slate-500 pl-3">{update.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 pl-3 sm:pl-0">
                  <span>{update.date}</span>
                  <ArrowRight className="w-3 h-3 text-[#255190] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION: Funding Available and Application Processes (Read-Only) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
          <div>
            <div className="text-[10px] font-bold text-[#255190] uppercase tracking-wider mb-0.5">
              Grant Opportunities & Bursaries
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#255190] tracking-tight">
              Funding Available and Application Processes
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Current bursary calls, NRF postgraduate scholarships, and CUT institutional operating grants.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('funding')}
              className="text-xs font-semibold text-[#255190] hover:underline flex items-center gap-1 cursor-pointer"
            >
              View Full Funding Catalogue <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {isCutAdmin && (
              <button
                onClick={() => onNavigate('admin_dashboard')}
                className="text-xs text-[#255190] hover:underline font-semibold flex items-center gap-1 py-1 px-2.5 rounded-[4px] bg-blue-50 border border-blue-200 cursor-pointer"
              >
                <Shield className="w-3 h-3 text-[#255190]" />
                <span>Manage in Admin Console</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featuredFunding.map((fund) => (
            <div
              key={fund.id}
              className="bg-white rounded-[6px] border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-[#255190] uppercase tracking-wider block mb-1">
                  {fund.funder}
                </span>
                <h3 className="text-sm font-semibold text-slate-900 leading-snug mb-2">
                  {fund.title}
                </h3>
                <div className="text-xs text-slate-500 mb-3 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Closing:</span>
                    <span className="font-semibold text-slate-700">{fund.deadline}</span>
                  </div>
                  <div className="font-semibold text-emerald-800">{fund.amountRange}</div>
                </div>
                <div className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {fund.eligibility}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => onNavigate('funding')}
                  className="font-semibold text-[#255190] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Application Steps <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION: Upcoming Workshops & Colloquiums (Read-Only) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
          <div>
            <div className="text-[10px] font-bold text-[#255190] uppercase tracking-wider mb-0.5">
              Academic Capacity Development
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#255190] tracking-tight">
              Upcoming Workshops and Seminars
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Methodology clinics, thesis writing masterclasses, and scientific publishing colloquiums.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('workshops')}
              className="text-xs font-semibold text-[#255190] hover:underline flex items-center gap-1 cursor-pointer"
            >
              All Workshops <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {isCutAdmin && (
              <button
                onClick={() => onNavigate('admin_dashboard')}
                className="text-xs text-[#255190] hover:underline font-semibold flex items-center gap-1 py-1 px-2.5 rounded-[4px] bg-blue-50 border border-blue-200 cursor-pointer"
              >
                <Shield className="w-3 h-3 text-[#255190]" />
                <span>Manage in Admin Console</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {publishedWorkshops.map((ws) => (
            <div key={ws.id} className="bg-white rounded-[6px] border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="font-bold text-[#255190] uppercase tracking-wider">{ws.category}</span>
                  <span className="text-blue-900 bg-blue-50 px-2 py-0.5 rounded font-semibold">{ws.eventDate}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2 leading-snug">{ws.title}</h3>
                <div className="text-xs text-slate-600 space-y-1 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ws.eventTime} SAST</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{ws.venueOrLink}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{ws.description}</p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">By {ws.facilitator.split('&')[0]}</span>
                <button
                  onClick={() => onNavigate('workshops')}
                  className="font-semibold text-[#255190] hover:underline cursor-pointer"
                >
                  Details &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Scholar Categories Guide */}
      <section className="bg-white border border-[#E2E8F0] rounded-[6px] p-6 sm:p-7 shadow-xs">
        <h3 className="text-sm font-semibold text-[#255190] uppercase tracking-wider mb-1">
          CUTAS Scholar Tiers & Categories
        </h3>
        <p className="text-xs text-slate-600 mb-5">
          Scholars across all four CUT faculties are organised into progressive academic categories for tailored mentoring and publishing support.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="bg-slate-50 p-4 rounded-[4px] border border-slate-200">
            <span className="font-bold text-[#255190] uppercase block mb-1">Category A</span>
            <div className="font-semibold text-sm text-slate-900 mb-1">Doctoral Candidates & Senior Fellows</div>
            <p className="text-slate-600 leading-relaxed">
              Scholars pursuing DTech/PhD degrees and postdoctoral fellows leading independent grant applications, international journal papers, and supervising junior scholars.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-[4px] border border-slate-200">
            <span className="font-bold text-[#255190] uppercase block mb-1">Category B</span>
            <div className="font-semibold text-sm text-slate-900 mb-1">Master’s Scholars & Researchers</div>
            <p className="text-slate-600 leading-relaxed">
              MSc, MTech, and MEng candidates preparing empirical thesis chapters, presenting at accredited conferences, and refining experimental methodologies.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-[4px] border border-slate-200">
            <span className="font-bold text-[#255190] uppercase block mb-1">Category C</span>
            <div className="font-semibold text-sm text-slate-900 mb-1">Honours & Early Postgrads</div>
            <p className="text-slate-600 leading-relaxed">
              Postgraduate Diploma and Honours scholars building foundational competence in citation software, research ethics, and thesis proposal structuring.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
