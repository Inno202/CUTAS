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

/** Folder the site is published under: "" normally, "/CUTAS" on GitHub Pages (set by VITE_BASE_PATH). */
export const BASE_PATH = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** Adds the site folder to an app path: withBase('/about') -> '/CUTAS/about' on GitHub Pages. */
export function withBase(path: string): string {
  return `${BASE_PATH}${path}` || '/';
}

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
  let p = pathname;
  if (BASE_PATH && (p === BASE_PATH || p.startsWith(`${BASE_PATH}/`))) p = p.slice(BASE_PATH.length);
  const clean = p.replace(/\/+$/, '') || '/';
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
  /** Section on the page, e.g. navigate('admin_dashboard', { hash: 'content' }) -> /admin#content */
  hash?: string;
}

export function navigate(tab: TabId, opts: NavigateOptions = {}) {
  const base = tab === 'not_found' ? '/' : ROUTES[tab];
  const path = opts.next && opts.next !== 'not_found' ? `${base}?next=${encodeURIComponent(ROUTES[opts.next])}` : base;
  const url = withBase(path) + (opts.hash ? `#${opts.hash}` : '');
  if (url !== window.location.pathname + window.location.search + window.location.hash) {
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
