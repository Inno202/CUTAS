import React from 'react';
import { TabId } from '../types';
import crestImage from '../assets/images/cutas_society_crest_1792291983112.jpg';

interface FooterProps {
  setActiveTab: (tab: TabId) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-[#003261] text-white text-xs border-t-4 border-[#FBB927] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand & Theme */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded bg-white p-1 flex items-center justify-center">
                <img src={crestImage} alt="CUTAS Crest" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#FBB927] font-bold block">
                  Central University of Technology, Free State
                </span>
                <span className="text-base font-bold text-white block">
                  Central University of Technology Academic Society
                </span>
              </div>
            </div>
            <p className="text-amber-200/90 text-xs italic font-medium leading-relaxed max-w-xl border-l-2 border-[#FBB927] pl-3 py-1">
              "Bringing back intellectualism within the corridors of Higher Education: Creating a new generation of thinkers in UoTs"
            </p>
            <p className="text-slate-300 text-xs leading-relaxed max-w-md">
              A scholarly society dedicated to advancing research rigour, peer mentorship, DHET publications, and institutional challenge advocacy across Free State campuses.
            </p>
          </div>

          {/* Quick Tabs */}
          <div>
            <h4 className="text-[#FBB927] font-bold text-xs uppercase tracking-wider mb-3">Society Modules</h4>
            <ul className="space-y-2 text-slate-300">
              <li><button onClick={() => setActiveTab('about')} className="hover:text-white transition-colors cursor-pointer">About Us</button></li>
              <li><button onClick={() => setActiveTab('leaders')} className="hover:text-white transition-colors cursor-pointer">Project Leaders & Admins</button></li>
              <li><button onClick={() => setActiveTab('scholars')} className="hover:text-white transition-colors cursor-pointer">Scholars Directory (A, B, C)</button></li>
              <li><button onClick={() => setActiveTab('funding')} className="hover:text-white transition-colors cursor-pointer">Funding & Bursary Calls</button></li>
              <li><button onClick={() => setActiveTab('workshops')} className="hover:text-white transition-colors cursor-pointer">Upcoming Workshops</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[11px] gap-3 text-center sm:text-left">
          <p>&copy; {new Date().getFullYear()} Central University of Technology Academic Society (CUTAS). All Rights Reserved.</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-1">
            <span>Bloemfontein Campus: 20 Pres. Brand St</span>
            <span className="hidden sm:inline">·</span>
            <span>Welkom Campus: 1 Mothusi Rd</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
