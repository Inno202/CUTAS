import { useEffect, useState } from 'react';
import type { TabId } from './types';

/** Real URLs for every page, so links, refresh, the back button and e-mailed links all work. */
export const ROUTES: Record<Exclude<TabId, 'not_found'>, string> = {
  landing: '/',
  about: '/about',
  leaders: '/leaders',
  scholars: '/scholars',
  studies: '/studies',
  publications: '/publications',
  challenges: '/challenges',
  growth: '/growth',
  funding: '/funding',
  awards: '/awards',
  workshops: '/workshops',
  admin_dashboard: '/admin',
  login: '/login',
  register: '/register',
  forgot_password: '/forgot-password',
  reset_password: '/reset-password',
  profile: '/profile',
};

const PATH_TO_TAB = new Map<string, TabId>(Object.entries(ROUTES).map(([tab, path]) => [path, tab as TabId]));

export const TITLES: Partial<Record<TabId, string>> = {
  landing: 'Home',
  about: 'About Us',
  leaders: 'Leaders & Administrators',
  scholars: 'Scholars Directory',
  studies: 'Study Details',
  publications: 'Publications',
  challenges: 'Challenges & Solutions',
  growth: 'Growth Plan',
  funding: 'Funding Available',
  awards: 'Awards & Recognitions',
  workshops: 'Workshops & Seminars',
  admin_dashboard: 'Administrator Console',
  login: 'Sign in',
  register: 'Register',
  forgot_password: 'Forgot password',
  reset_password: 'Reset password',
  profile: 'My Profile',
  not_found: 'Page not found',
};

export function pathToTab(pathname: string): TabId {
  const clean = pathname.replace(/\/+$/, '') || '/';
  return PATH_TO_TAB.get(clean) ?? 'not_found';
}

/** Only internal page paths are accepted as a post-login destination (no open redirects). */
export function safeNext(next: string | null): TabId | null {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return null;
  const tab = pathToTab(next.split('?')[0]);
  return tab === 'not_found' || tab === 'login' || tab === 'register' ? null : tab;
}

export interface NavigateOptions {
  next?: TabId;
  replace?: boolean;
}

export function navigate(tab: TabId, opts: NavigateOptions = {}) {
  const base = tab === 'not_found' ? '/' : ROUTES[tab];
  const url = opts.next && opts.next !== 'not_found' ? `${base}?next=${encodeURIComponent(ROUTES[opts.next])}` : base;
  if (url !== window.location.pathname + window.location.search) {
    window.history[opts.replace ? 'replaceState' : 'pushState']({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
  window.scrollTo({ top: 0, behavior: 'auto' });
}

export function useRoute(): TabId {
  const [tab, setTab] = useState<TabId>(() => pathToTab(window.location.pathname));
  useEffect(() => {
    const onPop = () => setTab(pathToTab(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  useEffect(() => {
    document.title = `${TITLES[tab] ?? 'CUTAS'} · CUT Academic Society`;
  }, [tab]);
  return tab;
}

export function queryParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}
