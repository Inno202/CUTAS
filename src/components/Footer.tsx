import React from 'react';
import { TabId } from '../types';
import crestImage from '../assets/images/cutas_society_crest_1792291983112.jpg';

interface FooterProps {
  setActiveTab: (tab: TabId) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-[#255190] text-white text-xs mt-16 shadow-inner">
      {/* Top Panel: Darker CUT Navy (#183765) with Society Name, Tagline, and Action Buttons */}
      <div className="bg-[#183765] border-t-4 border-[#FDB813] border-b border-white/10 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-[4px] bg-white p-1 flex items-center justify-center flex-shrink-0 shadow-xs">
              <img src={crestImage} alt="CUTAS Crest" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#FDB813] font-semibold block">
                Central University of Technology, Free State
              </span>
              <span className="text-base sm:text-lg font-bold text-white block">
                CUT Academic Society (CUTAS)
              </span>
              <p className="text-white/70 text-xs italic mt-0.5">
                "Bringing back intellectualism within the corridors of Higher Education: Creating a new generation of thinkers in UoTs"
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setActiveTab('login')}
              className="h-9 px-4 rounded-[4px] border border-white/40 hover:border-white text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Sign in to Portal
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className="h-9 px-4 rounded-[4px] bg-[#FDB813] hover:bg-[#e5a610] text-slate-900 font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              Register as Scholar
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer: Columns matching the new navigation structure */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1: About */}
          <div>
            <h4 className="text-[#FDB813] font-bold text-xs uppercase tracking-wider mb-3">About CUTAS</h4>
            <ul className="space-y-2 text-white/70">
              <li>
                <button onClick={() => setActiveTab('about')} className="hover:text-[#FDB813] transition-colors cursor-pointer text-left">
                  About Us & Mandate
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('leaders')} className="hover:text-[#FDB813] transition-colors cursor-pointer text-left">
                  Leaders & Administrators
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('scholars')} className="hover:text-[#FDB813] transition-colors cursor-pointer text-left">
                  Scholars Directory (A, B, C)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: My Research */}
          <div>
            <h4 className="text-[#FDB813] font-bold text-xs uppercase tracking-wider mb-3">My Research</h4>
            <ul className="space-y-2 text-white/70">
              <li>
                <button onClick={() => setActiveTab('studies')} className="hover:text-[#FDB813] transition-colors cursor-pointer text-left">
                  Study Details & Supervision
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('publications')} className="hover:text-[#FDB813] transition-colors cursor-pointer text-left">
                  DHET Publications Record
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('challenges')} className="hover:text-[#FDB813] transition-colors cursor-pointer text-left">
                  Challenges & Solutions
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('growth')} className="hover:text-[#FDB813] transition-colors cursor-pointer text-left">
                  Growth Plan & Milestones
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('awards')} className="hover:text-[#FDB813] transition-colors cursor-pointer text-left">
                  Academic Honours & Awards
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Opportunities */}
          <div>
            <h4 className="text-[#FDB813] font-bold text-xs uppercase tracking-wider mb-3">Opportunities</h4>
            <ul className="space-y-2 text-white/70">
              <li>
                <button onClick={() => setActiveTab('funding')} className="hover:text-[#FDB813] transition-colors cursor-pointer text-left">
                  Funding Available & Calls
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('workshops')} className="hover:text-[#FDB813] transition-colors cursor-pointer text-left">
                  Workshops & Seminars
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('profile')} className="hover:text-[#FDB813] transition-colors cursor-pointer text-left">
                  Scholar Profile & Dossier
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Campuses & Contact */}
          <div>
            <h4 className="text-[#FDB813] font-bold text-xs uppercase tracking-wider mb-3">Campuses & Contact</h4>
            <div className="space-y-1.5 text-white/60 text-[11px]">
              <div>Bloemfontein Campus: 20 Pres. Brand St, Bloemfontein, 9301</div>
              <div>Welkom Campus: 1 Mothusi Rd, Welkom, 9460</div>
              <div>Email: academic-society@cut.ac.za</div>
            </div>
          </div>
        </div>

        {/* Bottom copyright and accreditation bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-white/60 text-[11px] gap-3 text-center sm:text-left">
          <p>&copy; {new Date().getFullYear()} Central University of Technology Academic Society (CUTAS). All Rights Reserved.</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-1">
            <span>Free State, South Africa</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
