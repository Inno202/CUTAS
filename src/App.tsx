import React, { Suspense, lazy } from 'react';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { AccessDenied, SignInRequired } from './components/SignInRequired';
import { Alert, LoadingBlock, btnPrimary } from './components/ui';
import { isAdmin, useAuth } from './context/AuthContext';
import { navigate, useRoute } from './router';
import type { TabId } from './types';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';

// Less-visited pages are split into separate chunks so the first load stays small.
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const LeadersPage = lazy(() => import('./pages/LeadersPage').then((m) => ({ default: m.LeadersPage })));
const ScholarsPage = lazy(() => import('./pages/ScholarsPage').then((m) => ({ default: m.ScholarsPage })));
const StudyDetailsPage = lazy(() => import('./pages/StudyDetailsPage').then((m) => ({ default: m.StudyDetailsPage })));
const PublicationsPage = lazy(() => import('./pages/PublicationsPage').then((m) => ({ default: m.PublicationsPage })));
const ChallengesPage = lazy(() => import('./pages/ChallengesPage').then((m) => ({ default: m.ChallengesPage })));
const GrowthPage = lazy(() => import('./pages/GrowthPage').then((m) => ({ default: m.GrowthPage })));
const FundingPage = lazy(() => import('./pages/FundingPage').then((m) => ({ default: m.FundingPage })));
const AwardsPage = lazy(() => import('./pages/AwardsPage').then((m) => ({ default: m.AwardsPage })));
const WorkshopsPage = lazy(() => import('./pages/WorkshopsPage').then((m) => ({ default: m.WorkshopsPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));

const PRIVATE_PAGES: TabId[] = ['scholars', 'studies', 'publications', 'challenges', 'growth', 'awards', 'profile', 'admin_dashboard'];

const NotFound: React.FC = () => (
  <div className="text-center py-16 space-y-3">
    <p className="text-5xl font-bold text-[#255190]">404</p>
    <h1 className="text-lg font-semibold">This page does not exist</h1>
    <p className="text-xs text-slate-600 mx-auto">The link may be broken or the page may have moved.</p>
    <button type="button" className={btnPrimary} onClick={() => navigate('landing')}>
      Go to the home page
    </button>
  </div>
);

function renderPage(tab: TabId) {
  switch (tab) {
    case 'landing': return <LandingPage />;
    case 'about': return <AboutPage />;
    case 'leaders': return <LeadersPage />;
    case 'scholars': return <ScholarsPage />;
    case 'studies': return <StudyDetailsPage />;
    case 'publications': return <PublicationsPage />;
    case 'challenges': return <ChallengesPage />;
    case 'growth': return <GrowthPage />;
    case 'funding': return <FundingPage />;
    case 'awards': return <AwardsPage />;
    case 'workshops': return <WorkshopsPage />;
    case 'admin_dashboard': return <AdminDashboardPage />;
    case 'login': return <LoginPage />;
    case 'register': return <RegisterPage />;
    case 'forgot_password': return <ForgotPasswordPage />;
    case 'reset_password': return <ResetPasswordPage />;
    case 'profile': return <ProfilePage />;
    default: return <NotFound />;
  }
}

export default function App() {
  const tab = useRoute();
  const { status, user, notice, clearNotice } = useAuth();

  let content: React.ReactNode;
  if (status === 'loading' && tab !== 'landing') {
    content = <LoadingBlock label="Loading your session…" />;
  } else if (PRIVATE_PAGES.includes(tab) && !user) {
    content = <SignInRequired next={tab} />;
  } else if (tab === 'admin_dashboard' && !isAdmin(user)) {
    content = <AccessDenied message="Administrative privileges are required to open the CUTAS Administrator Console." />;
  } else {
    content = renderPage(tab);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans antialiased w-full overflow-x-hidden">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-white focus:text-[#255190] focus:px-3 focus:py-2 focus:rounded focus:shadow"
      >
        Skip to content
      </a>
      <Header activeTab={tab} />

      <main id="main" className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        {notice && tab !== 'login' && (
          <Alert type="warning" onClose={clearNotice} className="mb-4">
            {notice}
          </Alert>
        )}
        <Suspense fallback={<LoadingBlock />}>{content}</Suspense>
      </main>

      <Footer />
    </div>
  );
}
