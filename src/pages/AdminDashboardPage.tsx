import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, BarChart3, Calendar, Database, FileText, Shield, Target, UserCog, Users, Wallet } from 'lucide-react';
import { adminApi } from '../api/endpoints';
import { PageHeader } from '../components/PageHeader';
import { isSuperAdmin, useAuth } from '../context/AuthContext';
import type { AdminOverview } from '../types';
import { ROLE_LABELS } from '../constants';
import { ContentSection } from './admin/ContentSection';
import { FundingSection } from './admin/FundingSection';
import { WorkshopsSection } from './admin/WorkshopsSection';
import { ChallengesSection } from './admin/ChallengesSection';
import { ScholarsSection } from './admin/ScholarsSection';
import { GrowthSection } from './admin/GrowthSection';
import { ReportsSection } from './admin/ReportsSection';
import { AuditSection } from './admin/AuditSection';
import { ExportSection } from './admin/ExportSection';
import { UsersSection } from './admin/UsersSection';

export type AdminConsoleSection =
  | 'challenges' | 'content' | 'funding' | 'workshops' | 'scholars' | 'growth' | 'reports' | 'audit' | 'export' | 'users';

interface NavItem {
  id: AdminConsoleSection;
  label: string;
  icon: React.ElementType;
  badge?: (o: AdminOverview) => number | undefined;
  alert?: (o: AdminOverview) => boolean;
  superOnly?: boolean;
}

const NAV: NavItem[] = [
  { id: 'challenges', label: 'Challenges Queue', icon: AlertCircle, badge: (o) => o.challenges.open + o.challenges.inReview, alert: (o) => o.challenges.open > 0 },
  { id: 'content', label: 'Content Pages', icon: FileText },
  { id: 'funding', label: 'Funding Calls', icon: Wallet, badge: (o) => o.funding.total },
  { id: 'workshops', label: 'Workshops', icon: Calendar, badge: (o) => o.workshops.total },
  { id: 'scholars', label: 'Scholars & Tiers', icon: Users, badge: (o) => o.scholars.total },
  { id: 'growth', label: 'Growth Mentoring', icon: Target, badge: (o) => o.growth.awaitingFeedback, alert: (o) => o.growth.awaitingFeedback > 0 },
  { id: 'reports', label: 'Annual Reports', icon: BarChart3 },
  { id: 'users', label: 'User Accounts', icon: UserCog, superOnly: true, badge: (o) => o.users?.total },
  { id: 'audit', label: 'Audit Log', icon: Shield, superOnly: true },
  { id: 'export', label: 'Database Export', icon: Database, superOnly: true },
];

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const superAdmin = isSuperAdmin(user);
  const sectionFromHash = useCallback((): AdminConsoleSection | null => {
    const fromHash = window.location.hash.replace('#', '') as AdminConsoleSection;
    return NAV.some((n) => n.id === fromHash && (!n.superOnly || superAdmin)) ? fromHash : null;
  }, [superAdmin]);
  const [active, setActive] = useState<AdminConsoleSection>(() => sectionFromHash() ?? 'challenges');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Deep links (/admin#reports) also work when the console is already open.
  useEffect(() => {
    const onHash = () => {
      const next = sectionFromHash();
      if (next) setActive(next);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [sectionFromHash]);

  const refreshOverview = useCallback(() => {
    adminApi.overview().then(setOverview).catch(() => undefined);
  }, []);

  useEffect(() => {
    refreshOverview();
  }, [refreshOverview]);

  const select = (id: AdminConsoleSection) => {
    setActive(id);
    window.history.replaceState({}, '', `/admin#${id}`);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!user) return null;
  const items = NAV.filter((n) => !n.superOnly || superAdmin);

  const badgeOf = (n: NavItem, isActive: boolean) => {
    if (!overview || !n.badge) return null;
    const value = n.badge(overview);
    if (value === undefined) return null;
    const hot = n.alert?.(overview);
    return (
      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
        hot ? 'bg-amber-400 text-slate-900' : isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
      }`}>
        {value}
      </span>
    );
  };

  const section = (() => {
    const props = { onChanged: refreshOverview };
    switch (active) {
      case 'content': return <ContentSection {...props} />;
      case 'funding': return <FundingSection {...props} />;
      case 'workshops': return <WorkshopsSection {...props} />;
      case 'challenges': return <ChallengesSection {...props} />;
      case 'scholars': return <ScholarsSection {...props} />;
      case 'growth': return <GrowthSection {...props} />;
      case 'reports': return <ReportsSection />;
      case 'users': return superAdmin ? <UsersSection {...props} /> : null;
      case 'audit': return superAdmin ? <AuditSection /> : null;
      case 'export': return superAdmin ? <ExportSection /> : null;
      default: return null;
    }
  })();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CENTRAL UNIVERSITY OF TECHNOLOGY ACADEMIC SOCIETY"
        title="Unified Administrator Console"
        description="One place for CUTAS management: challenge triage, content publishing, bursary calls, workshops, scholar categories, mentoring and governance records."
        badge={
          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#255190] text-white px-2 py-0.5 rounded-[4px]">
            {ROLE_LABELS[user.role]}
          </span>
        }
      />

      {/* Mobile / tablet: horizontally scrollable module tabs */}
      <nav aria-label="Console modules" className="lg:hidden -mx-3 sm:mx-0 px-3 sm:px-0 overflow-x-auto scrollbar-none">
        <div className="flex gap-2 w-max pb-1">
          {items.map((n) => {
            const isActive = active === n.id;
            const Icon = n.icon;
            return (
              <button key={n.id} type="button" onClick={() => select(n.id)} aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap border cursor-pointer ${
                  isActive ? 'bg-[#255190] text-white border-[#255190]' : 'bg-white text-slate-700 border-slate-200'
                }`}>
                <Icon className="w-3.5 h-3.5" /> {n.label} {badgeOf(n, isActive)}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <aside className="hidden lg:block bg-white rounded-[6px] border border-[#E2E8F0] shadow-xs overflow-hidden lg:sticky lg:top-28">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#255190] block">Management Modules</span>
            <span className="text-xs text-slate-500 block mt-0.5">Signed in as <b>{user.firstName || user.username} {user.lastName}</b></span>
          </div>
          <nav aria-label="Console modules" className="p-2 space-y-1 text-xs">
            {items.map((n, i) => {
              const isActive = active === n.id;
              const Icon = n.icon;
              const firstSuper = n.superOnly && !items[i - 1]?.superOnly;
              return (
                <React.Fragment key={n.id}>
                  {firstSuper && (
                    <div className="pt-3 pb-1 px-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Super Admin Only</span>
                    </div>
                  )}
                  <button type="button" onClick={() => select(n.id)} aria-current={isActive ? 'page' : undefined}
                    className={`w-full text-left px-3 py-2.5 rounded-[4px] font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      isActive ? 'bg-[#255190] text-white' : 'text-slate-700 hover:bg-slate-50'
                    }`}>
                    <span className="flex items-center gap-2.5"><Icon className="w-4 h-4" /> {n.label}</span>
                    {badgeOf(n, isActive)}
                  </button>
                </React.Fragment>
              );
            })}
          </nav>
        </aside>

        <div ref={topRef} className="lg:col-span-3 space-y-4 scroll-mt-28 min-w-0">{section}</div>
      </div>
    </div>
  );
};
