import React from 'react';
import logo from '../assets/images/cutas-logo.svg';
import { SOCIETY_THEME } from '../constants';
import { useAuth } from '../context/AuthContext';
import { navigate, ROUTES } from '../router';
import type { TabId } from '../types';

const COLUMNS: { title: string; links: { tab: TabId; label: string; auth?: boolean }[] }[] = [
  {
    title: 'About CUTAS',
    links: [
      { tab: 'about', label: 'About Us & Mandate' },
      { tab: 'leaders', label: 'Leaders & Administrators' },
      { tab: 'scholars', label: 'Scholars Directory (A, B, C)', auth: true },
    ],
  },
  {
    title: 'My Research',
    links: [
      { tab: 'studies', label: 'Study Details & Supervision', auth: true },
      { tab: 'publications', label: 'Publication Record', auth: true },
      { tab: 'challenges', label: 'Challenges & Solutions', auth: true },
      { tab: 'growth', label: 'Growth Plan & Milestones', auth: true },
      { tab: 'awards', label: 'Academic Honours & Awards', auth: true },
    ],
  },
  {
    title: 'Opportunities',
    links: [
      { tab: 'funding', label: 'Funding Available & Calls' },
      { tab: 'workshops', label: 'Workshops & Seminars' },
      { tab: 'profile', label: 'Scholar Profile & Dossier', auth: true },
    ],
  },
];

export const Footer: React.FC = () => {
  const { user } = useAuth();

  const go = (tab: TabId, auth?: boolean) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (auth && !user) navigate('login', { next: tab });
    else navigate(tab);
  };

  return (
    <footer className="bg-[#255190] text-white text-xs mt-12 sm:mt-16 shadow-inner">
      <div className="bg-[#183765] border-t-4 border-[#FDB813] border-b border-white/10 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="rounded-[6px] bg-white px-3 py-2.5 flex items-center justify-center flex-shrink-0 shadow-xs">
              <img src={logo} alt="CUTAS - Central University of Technology Academic Society" className="w-52 h-auto" width={208} height={46} loading="lazy" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#FDB813] font-semibold block">
                Central University of Technology, Free State
              </span>
              <span className="text-base sm:text-lg font-bold text-white block">CUT Academic Society (CUTAS)</span>
              <p className="text-white/70 text-xs italic mt-0.5 mx-auto sm:mx-0">"{SOCIETY_THEME}"</p>
            </div>
          </div>

          {!user && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate('login')}
                className="h-10 px-4 rounded-[4px] border border-white/40 hover:border-white text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Sign in to Portal
              </button>
              <button
                type="button"
                onClick={() => navigate('register')}
                className="h-10 px-4 rounded-[4px] bg-[#FDB813] hover:bg-[#e5a610] text-slate-900 font-bold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Register as Scholar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-[#FDB813] font-bold text-xs uppercase tracking-wider mb-3">{col.title}</h2>
              <ul className="space-y-2 text-white/70">
                {col.links.map((l) => (
                  <li key={l.tab}>
                    <a href={ROUTES[l.tab as keyof typeof ROUTES]} onClick={go(l.tab, l.auth)} className="hover:text-[#FDB813] transition-colors py-0.5 inline-block">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="text-[#FDB813] font-bold text-xs uppercase tracking-wider mb-3">Campuses & Contact</h2>
            <address className="space-y-1.5 text-white/60 text-[11px] not-italic">
              <div>Bloemfontein Campus: 20 Pres. Brand St, Bloemfontein, 9301</div>
              <div>Welkom Campus: 1 Mothusi Rd, Welkom, 9460</div>
              <div>
                Email: <a className="hover:text-[#FDB813] break-all" href="mailto:academic-society@cut.ac.za">academic-society@cut.ac.za</a>
              </div>
            </address>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-white/60 text-[11px] gap-3 text-center sm:text-left">
          <p className="mx-auto sm:mx-0">&copy; {new Date().getFullYear()} Central University of Technology Academic Society (CUTAS). All Rights Reserved.</p>
          <span>Free State, South Africa</span>
        </div>
      </div>
    </footer>
  );
};
