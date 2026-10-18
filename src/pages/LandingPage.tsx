import React, { useState } from 'react';
import { User, FundingOpportunity, Workshop, TabId } from '../types';
import heroCampusImage from '../assets/images/cutas_hero_banner_1792291983153.jpg';
import { 
  ArrowRight, Calendar, MapPin, 
  Edit3, Plus
} from 'lucide-react';

interface LandingPageProps {
  currentUser: User | null;
  funding: FundingOpportunity[];
  workshops: Workshop[];
  scholarsCount: number;
  publicationsCount: number;
  resolvedChallengesCount: number;
  onNavigate: (tab: TabId) => void;
  onEditFunding?: (item: FundingOpportunity) => void;
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
  onEditFunding,
  onAddFunding,
}) => {
  const featuredFunding = funding.filter(f => f.featuredOnLanding && f.isActive);
  const upcomingWorkshops = workshops.slice(0, 3);

  return (
    <div className="space-y-12">
      {/* Hero Banner Section */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50 bg-[#003261]">
        {/* Background Campus Image with measured contrast scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroCampusImage}
            alt="Central University of Technology Campus"
            className="w-full h-full object-cover opacity-35"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#003261] via-[#003261]/90 to-[#002244]/80"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 p-5 sm:p-10 lg:p-14 max-w-4xl text-white">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#FBB927] mb-3 sm:mb-4">
            <span>Central University of Technology, Free State</span>
            <span>·</span>
            <span>Postgraduate Academic Portal</span>
          </div>

          <h1 className="text-xl sm:text-3xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 sm:mb-6 leading-tight break-words">
            Central University of Technology Academic Society
          </h1>

          {/* Mandatory Prominent Theme Callout */}
          <div className="p-3.5 sm:p-6 bg-white/10 backdrop-blur-md rounded-xl border-l-4 border-[#FBB927] mb-5 sm:mb-8 shadow-inner">
            <p className="text-xs sm:text-lg lg:text-2xl font-serif italic text-amber-100 leading-relaxed">
              "Bringing back intellectualism within the corridors of Higher Education: Creating a new generation of thinkers in UoTs"
            </p>
          </div>

          <p className="text-slate-200 text-xs sm:text-base leading-relaxed max-w-2xl">
            A scholar-led academic society fostering rigorous inquiry, peer thesis review, DHET-accredited publication outputs, competitive national funding, and institutional challenge resolution for postgraduate researchers.
          </p>
        </div>
      </div>

      {/* MANDATORY SECTION: Funding Available and Application Processes (Admin Editable) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
          <div>
            <div className="text-[10px] sm:text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
              Grant Opportunities & Bursaries
            </div>
            <h2 className="text-base sm:text-xl md:text-2xl font-bold text-[#003261] tracking-tight">
              Funding Available and Application Processes
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Current bursary calls, NRF postgraduate scholarships, and CUT institutional research operating grants.
            </p>
          </div>

          <div className="mt-3 sm:mt-0 flex items-center space-x-3">
            <button
              onClick={() => onNavigate('funding')}
              className="text-xs sm:text-sm font-bold text-[#003261] hover:text-blue-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              View Full Funding Catalogue <ArrowRight className="w-4 h-4" />
            </button>
            {currentUser && currentUser.role !== 'SCHOLAR' && onAddFunding && (
              <button
                onClick={onAddFunding}
                className="px-3 py-1.5 bg-[#003261] text-white text-xs font-semibold rounded hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#FBB927]" /> Post Funding
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredFunding.map((fund) => (
            <div
              key={fund.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
                  {fund.funder}
                </span>
                <h3 className="text-base font-bold text-slate-900 leading-snug mb-2">
                  {fund.title}
                </h3>
                <div className="text-xs text-slate-500 mb-4 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Closing:</span>
                    <span className="font-semibold text-slate-700">{fund.deadline}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {fund.eligibility}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => onNavigate('funding')}
                  className="font-bold text-[#003261] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Application Steps <ArrowRight className="w-3.5 h-3.5" />
                </button>
                {currentUser && currentUser.role !== 'SCHOLAR' && onEditFunding && (
                  <button
                    onClick={() => onEditFunding(fund)}
                    className="text-slate-500 hover:text-slate-900 text-xs font-medium cursor-pointer flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Workshops & Colloquiums Spotlight */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
              Academic Development
            </div>
            <h2 className="text-base sm:text-xl md:text-2xl font-bold text-[#003261] tracking-tight">
              Upcoming Workshops and Seminars
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Methodology clinics, thesis writing bootcamps, and scientific publishing colloquiums.
            </p>
          </div>
          <button
            onClick={() => onNavigate('workshops')}
            className="text-xs sm:text-sm font-bold text-[#003261] hover:text-blue-800 transition-colors flex items-center gap-1 cursor-pointer"
          >
            All Workshops <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingWorkshops.map((ws) => (
            <div key={ws.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="font-bold text-blue-900 uppercase tracking-wider">{ws.category}</span>
                  <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-semibold">{ws.eventDate}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">{ws.title}</h3>
                <div className="text-xs text-slate-600 space-y-1 mb-4">
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

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">By {ws.facilitator.split('&')[0]}</span>
                <button
                  onClick={() => onNavigate('workshops')}
                  className="font-bold text-[#003261] hover:underline cursor-pointer"
                >
                  Details &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Scholar Categories Guide */}
      <section className="bg-slate-50 border border-slate-200 rounded-xl p-8">
        <h3 className="text-base font-bold text-[#003261] uppercase tracking-wider mb-2">
          CUTAS Scholar Tiers & Categories
        </h3>
        <p className="text-xs text-slate-600 mb-6">
          Scholars across all four CUT faculties are organised into progressive academic categories for tailored mentoring and publishing support.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <span className="font-bold text-amber-800 uppercase block mb-1">Category A</span>
            <div className="font-bold text-sm text-slate-900 mb-1">Doctoral Candidates & Senior Fellows</div>
            <p className="text-slate-600 leading-relaxed">
              Scholars pursuing DTech/PhD degrees and postdoctoral fellows leading independent grant applications, international journal papers, and supervising junior scholars.
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <span className="font-bold text-blue-900 uppercase block mb-1">Category B</span>
            <div className="font-bold text-sm text-slate-900 mb-1">Master’s Scholars & Researchers</div>
            <p className="text-slate-600 leading-relaxed">
              MSc, MTech, and MEng candidates preparing empirical thesis chapters, presenting at accredited conferences, and refining experimental methodologies.
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <span className="font-bold text-emerald-800 uppercase block mb-1">Category C</span>
            <div className="font-bold text-sm text-slate-900 mb-1">Honours & Early Postgrads</div>
            <p className="text-slate-600 leading-relaxed">
              Postgraduate Diploma and Honours scholars building foundational competence in citation software, research ethics, and thesis proposal structuring.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
