import React from 'react';
import { ArrowRight, Award as AwardIcon, Calendar, Clock, MapPin, Shield } from 'lucide-react';
import heroCampusImage from '../assets/images/cutas-hero.webp';
import { publicApi } from '../api/endpoints';
import { ErrorBlock } from '../components/ui';
import { CATEGORY_DESCRIPTIONS, SOCIETY_THEME } from '../constants';
import { isAdmin, useAuth } from '../context/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { navigate } from '../router';
import { formatDate, timeRange } from '../utils/format';

const SkeletonCard = () => (
  <div className="bg-white rounded-[6px] border border-[#E2E8F0] p-5 shadow-xs animate-pulse space-y-3" aria-hidden="true">
    <div className="h-2.5 w-1/3 bg-slate-200 rounded" />
    <div className="h-4 w-4/5 bg-slate-200 rounded" />
    <div className="h-3 w-1/2 bg-slate-100 rounded" />
    <div className="h-12 w-full bg-slate-100 rounded" />
  </div>
);

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const { data, error, loading, reload } = useAsync(() => publicApi.landing(), []);
  const admin = isAdmin(user);


  const ManageButton = ({ section }: { section: string }) =>
    admin ? (
      <button
        type="button"
        onClick={() => navigate('admin_dashboard', { hash: section })}
        className="text-xs text-[#255190] hover:underline font-semibold flex items-center gap-1 py-1.5 px-2.5 rounded-[4px] bg-blue-50 border border-blue-200 cursor-pointer"
      >
        <Shield className="w-3 h-3 text-[#255190]" />
        <span>Manage in Admin Console</span>
      </button>
    ) : null;

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Hero */}
      <section className="relative rounded-[6px] overflow-hidden border border-slate-200 shadow-xs bg-[#183765] min-h-[240px] sm:min-h-[280px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img src={heroCampusImage} alt="" className="w-full h-full object-cover opacity-25" fetchPriority="high" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#183765]/95 via-[#183765]/85 to-[#255190]/75" />
        </div>
        <div className="relative z-10 p-5 sm:p-10 max-w-4xl text-white">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-wider text-[#FDB813] mb-2.5">
            <span>Central University of Technology, Free State</span>
            <span aria-hidden="true">·</span>
            <span>Postgraduate Academic Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-white mb-3 leading-tight">
            Central University of Technology Academic Society
          </h1>
          <div className="p-3 bg-white/10 backdrop-blur-xs rounded-[4px] border-l-4 border-[#FDB813] max-w-2xl">
            <p className="text-xs sm:text-sm font-serif italic text-amber-100 leading-relaxed">"{SOCIETY_THEME}"</p>
          </div>
        </div>
      </section>

      {error && <ErrorBlock message={error} onRetry={reload} />}

      {/* Funding */}
      <section className="space-y-4" aria-labelledby="landing-funding">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-3 border-b border-slate-200 gap-3">
          <div>
            <div className="text-[10px] font-bold text-[#255190] uppercase tracking-wider mb-0.5">Grant Opportunities & Bursaries</div>
            <h2 id="landing-funding" className="text-lg sm:text-xl font-semibold text-[#255190] tracking-tight">
              Funding Available and Application Processes
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Current bursary calls, NRF postgraduate scholarships, and CUT institutional operating grants.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('funding')}
              className="text-xs font-semibold text-[#255190] hover:underline flex items-center gap-1 cursor-pointer py-1"
            >
              View Full Funding Catalogue <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <ManageButton section="funding" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {loading && !data && [0, 1, 2].map((i) => <SkeletonCard key={i} />)}
          {data?.featuredFunding.map((fund) => (
            <article key={fund.id} className="bg-white rounded-[6px] border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#255190] uppercase tracking-wider block mb-1">{fund.funder}</span>
                <h3 className="text-sm font-semibold text-[#255190] leading-snug mb-2">{fund.title}</h3>
                <div className="text-xs text-slate-500 mb-3 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Closing:</span>
                    <span className="font-semibold text-slate-700">{formatDate(fund.deadline)}</span>
                  </div>
                  <div className="font-semibold text-emerald-800">{fund.amountRange}</div>
                </div>
                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">{fund.eligibility}</p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => navigate('funding')}
                  className="font-semibold text-[#255190] hover:underline flex items-center gap-1 cursor-pointer py-1"
                >
                  Application Steps <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
          {data && data.featuredFunding.length === 0 && (
            <p className="text-xs text-slate-500 md:col-span-2 xl:col-span-3 bg-white border border-[#E2E8F0] rounded-[6px] p-6 text-center max-w-none">
              No featured funding calls right now. New calls are published here as soon as they open.
            </p>
          )}
        </div>
      </section>

      {/* Workshops */}
      <section className="space-y-4" aria-labelledby="landing-workshops">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-3 border-b border-slate-200 gap-3">
          <div>
            <div className="text-[10px] font-bold text-[#255190] uppercase tracking-wider mb-0.5">Academic Capacity Development</div>
            <h2 id="landing-workshops" className="text-lg sm:text-xl font-semibold text-[#255190] tracking-tight">
              Upcoming Workshops and Seminars
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Methodology clinics, thesis writing masterclasses, and scientific publishing colloquiums.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('workshops')}
              className="text-xs font-semibold text-[#255190] hover:underline flex items-center gap-1 cursor-pointer py-1"
            >
              All Workshops <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <ManageButton section="workshops" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {loading && !data && [0, 1, 2].map((i) => <SkeletonCard key={i} />)}
          {data?.upcomingWorkshops.map((ws) => (
            <article key={ws.id} className="bg-white rounded-[6px] border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] mb-2">
                  <span className="font-bold text-[#255190] uppercase tracking-wider">{ws.category}</span>
                  <span className="text-blue-900 bg-blue-50 px-2 py-0.5 rounded font-semibold">{formatDate(ws.eventDate)}</span>
                </div>
                <h3 className="text-sm font-semibold text-[#255190] mb-2 leading-snug">{ws.title}</h3>
                <div className="text-xs text-slate-600 space-y-1 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{timeRange(ws.eventTime, ws.endTime)} SAST</span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{ws.venueOrLink}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{ws.description}</p>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-500 font-medium truncate">By {ws.facilitator.split('&')[0].trim()}</span>
                <button
                  type="button"
                  onClick={() => navigate('workshops')}
                  className="font-semibold text-[#255190] hover:underline cursor-pointer flex-shrink-0 py-1"
                >
                  Details &rarr;
                </button>
              </div>
            </article>
          ))}
          {data && data.upcomingWorkshops.length === 0 && (
            <p className="text-xs text-slate-500 md:col-span-2 xl:col-span-3 bg-white border border-[#E2E8F0] rounded-[6px] p-6 text-center max-w-none">
              <Calendar className="w-5 h-5 mx-auto mb-2 text-slate-400" />
              No workshops are scheduled at the moment.
            </p>
          )}
        </div>
      </section>

      {/* Scholar categories */}
      <section className="bg-white border border-[#E2E8F0] rounded-[6px] p-5 sm:p-7 shadow-xs">
        <h2 className="text-sm font-semibold text-[#255190] uppercase tracking-wider mb-1 flex items-center gap-2">
          <AwardIcon className="w-4 h-4" aria-hidden="true" /> CUTAS Scholar Tiers & Categories
        </h2>
        <p className="text-xs text-slate-600 mb-5">
          Scholars across all four CUT faculties are organised into progressive academic categories for tailored mentoring and publishing support.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 text-xs">
          {([
            ['CAT_A', 'Category A', 'Scholars pursuing DTech/PhD degrees and postdoctoral fellows leading independent grant applications, international journal papers, and supervising junior scholars.'],
            ['CAT_B', 'Category B', 'MSc, MTech, and MEng candidates preparing empirical thesis chapters, presenting at accredited conferences, and refining experimental methodologies.'],
            ['CAT_C', 'Category C', 'Postgraduate Diploma and Honours scholars building foundational competence in citation software, research ethics, and thesis proposal structuring.'],
          ] as const).map(([key, label, text]) => (
            <div key={key} className="bg-slate-50 p-4 rounded-[4px] border border-slate-200">
              <span className="font-bold text-[#255190] uppercase block mb-1">{label}</span>
              <div className="font-semibold text-sm text-slate-900 mb-1">{CATEGORY_DESCRIPTIONS[key]}</div>
              <p className="text-slate-600 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
