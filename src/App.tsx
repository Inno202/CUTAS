import React, { useState } from 'react';
import { 
  User, TabId, StudyDetails, Publication, Challenge, 
  GrowthSuggestion, FundingOpportunity, Award, Workshop, 
  InstitutionalContent, AuditLogItem, ChallengeStatus 
} from './types';
import { 
  INITIAL_USERS, INITIAL_STUDIES, INITIAL_PUBLICATIONS, 
  INITIAL_CHALLENGES, INITIAL_GROWTH, INITIAL_FUNDING, 
  INITIAL_AWARDS, INITIAL_WORKSHOPS, INITIAL_CONTENT, 
  INITIAL_AUDIT_LOGS 
} from './data/seedData';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PdfModal, PdfDocumentData } from './components/PdfModal';
import { DjangoCodeViewer } from './components/DjangoCodeViewer';

import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { LeadersPage } from './pages/LeadersPage';
import { ScholarsPage } from './pages/ScholarsPage';
import { StudyDetailsPage } from './pages/StudyDetailsPage';
import { PublicationsPage } from './pages/PublicationsPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { GrowthPage } from './pages/GrowthPage';
import { FundingPage } from './pages/FundingPage';
import { AwardsPage } from './pages/AwardsPage';
import { WorkshopsPage } from './pages/WorkshopsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AuthModals } from './pages/AuthModals';

export default function App() {
  // State management
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUserId, setCurrentUserId] = useState<string | null>('user_cat_a');
  const [activeTab, setActiveTab] = useState<TabId>('landing');

  const [studies, setStudies] = useState<Record<string, StudyDetails>>(INITIAL_STUDIES);
  const [publications, setPublications] = useState<Publication[]>(INITIAL_PUBLICATIONS);
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  const [growth, setGrowth] = useState<GrowthSuggestion[]>(INITIAL_GROWTH);
  const [funding, setFunding] = useState<FundingOpportunity[]>(INITIAL_FUNDING);
  const [awards, setAwards] = useState<Award[]>(INITIAL_AWARDS);
  const [workshops, setWorkshops] = useState<Workshop[]>(INITIAL_WORKSHOPS);
  const [content, setContent] = useState<Record<string, InstitutionalContent>>(INITIAL_CONTENT);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  // Modals state
  const [pdfDocument, setPdfDocument] = useState<PdfDocumentData | null>(null);
  const [isDjangoViewerOpen, setIsDjangoViewerOpen] = useState(false);
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    type: 'LOGIN' | 'REGISTER' | 'CHANGE_PASSWORD' | 'DELETE_ACCOUNT';
  }>({ isOpen: false, type: 'LOGIN' });

  // Current active user
  const currentUser = users.find(u => u.id === currentUserId) || null;

  // Audit log helper
  const addAuditLog = (action: string, details: string, target?: string) => {
    const newLog: AuditLogItem = {
      id: `log_${Date.now()}`,
      action,
      actorUsername: currentUser ? currentUser.username : 'visitor',
      actorRole: currentUser ? currentUser.role : 'Guest',
      targetObject: target,
      details,
      ipAddress: '196.21.18.42',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Study details
  const currentStudyDetails: StudyDetails = (currentUser && studies[currentUser.id]) || {
    userId: currentUser?.id || 'guest',
    programme: 'Postgraduate Degree in Science & Technology',
    university: 'Central University of Technology, Free State',
    yearOfStarting: 2023,
    anticipatedYearOfCompletion: 2026,
    supervisor: 'Faculty Academic Supervisor',
    funding: 'CUT Postgraduate Merit Grant',
    researchTopic: 'Intellectual Inquiry & Technical Innovation in Universities of Technology',
    researchAbstract: 'Postgraduate research prospectus outline.'
  };

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleSwitchUser = (userId: string | null) => {
    setCurrentUserId(userId);
    if (userId) {
      const u = users.find(usr => usr.id === userId);
      if (u) {
        addAuditLog('LOGIN', `Switched active session to ${u.username} (${u.role})`);
      }
    } else {
      addAuditLog('LOGOUT', 'User signed out to visitor mode');
    }
  };

  // Study details update
  const handleUpdateStudyDetails = (updated: StudyDetails) => {
    if (!currentUser) return;
    setStudies(prev => ({ ...prev, [currentUser.id]: updated }));
    addAuditLog('STUDY_UPDATE', `Updated study details for programme: ${updated.programme}`);
  };

  // Publications CRUD
  const handleAddPublication = (pubData: Omit<Publication, 'id' | 'userId'>) => {
    if (!currentUser) return;
    const newPub: Publication = {
      ...pubData,
      id: `pub_${Date.now()}`,
      userId: currentUser.id,
    };
    setPublications(prev => [newPub, ...prev]);
    addAuditLog('PUB_ADD', `Added publication: ${newPub.title}`);
  };

  const handleEditPublication = (id: string, updated: Partial<Publication>) => {
    setPublications(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    addAuditLog('PUB_EDIT', `Updated publication #${id}`);
  };

  const handleDeletePublication = (id: string) => {
    setPublications(prev => prev.filter(p => p.id !== id));
    addAuditLog('PUB_DELETE', `Deleted publication #${id}`);
  };

  // Challenges CRUD
  const handleSubmitChallenge = (chData: Omit<Challenge, 'id' | 'userId' | 'scholarName' | 'scholarCategory' | 'status' | 'createdAt'>) => {
    if (!currentUser) return;
    const newCh: Challenge = {
      ...chData,
      id: `ch_${Date.now()}`,
      userId: currentUser.id,
      scholarName: `${currentUser.title} ${currentUser.firstName} ${currentUser.lastName}`,
      scholarCategory: currentUser.category || 'CAT_B',
      status: 'OPEN',
      createdAt: new Date().toISOString().substring(0, 10),
    };
    setChallenges(prev => [newCh, ...prev]);
    addAuditLog('CHALLENGE_SUBMIT', `Submitted research problem: ${newCh.title}`, `Challenge #${newCh.id}`);
  };

  const handleUpdateChallengeResolution = (id: string, status: ChallengeStatus, notes: string) => {
    setChallenges(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status,
          resolutionNotes: notes,
          resolvedBy: currentUser ? `${currentUser.title} ${currentUser.lastName}` : 'Administrator',
          resolvedAt: status === 'RESOLVED' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : c.resolvedAt,
        };
      }
      return c;
    }));
    addAuditLog('CHALLENGE_REVIEW', `Status changed to ${status}. Notes updated.`, `Challenge #${id}`);
  };

  // Growth Targets
  const handleAddGrowth = (item: Omit<GrowthSuggestion, 'id' | 'userId'>) => {
    if (!currentUser) return;
    const newG: GrowthSuggestion = {
      ...item,
      id: `gr_${Date.now()}`,
      userId: currentUser.id,
    };
    setGrowth(prev => [newG, ...prev]);
    addAuditLog('GROWTH_ADD', `Recorded growth goal: ${newG.growthObjective}`);
  };

  const handleToggleGrowthComplete = (id: string) => {
    setGrowth(prev => prev.map(g => g.id === id ? { ...g, isCompleted: !g.isCompleted } : g));
  };

  // Awards CRUD
  const handleAddAward = (awardData: Omit<Award, 'id' | 'userId'>) => {
    if (!currentUser) return;
    const newA: Award = {
      ...awardData,
      id: `aw_${Date.now()}`,
      userId: currentUser.id,
    };
    setAwards(prev => [newA, ...prev]);
    addAuditLog('AWARD_ADD', `Recorded award: ${newA.title}`);
  };

  const handleDeleteAward = (id: string) => {
    setAwards(prev => prev.filter(a => a.id !== id));
    addAuditLog('AWARD_DELETE', `Removed award #${id}`);
  };

  // Funding CRUD (Admin)
  const handleAddFunding = (oppData: Omit<FundingOpportunity, 'id'>) => {
    const newF: FundingOpportunity = {
      ...oppData,
      id: `fund_${Date.now()}`,
    };
    setFunding(prev => [newF, ...prev]);
    addAuditLog('FUNDING_CREATE', `Published funding call: ${newF.title}`);
  };

  const handleEditFunding = (id: string, updated: Partial<FundingOpportunity>) => {
    setFunding(prev => prev.map(f => f.id === id ? { ...f, ...updated } : f));
    addAuditLog('FUNDING_EDIT', `Updated funding call #${id}`);
  };

  // Workshops CRUD (Admin)
  const handleAddWorkshop = (wsData: Omit<Workshop, 'id'>) => {
    const newWs: Workshop = {
      ...wsData,
      id: `ws_${Date.now()}`,
    };
    setWorkshops(prev => [newWs, ...prev]);
    addAuditLog('WORKSHOP_CREATE', `Scheduled workshop: ${newWs.title}`);
  };

  const handleEditWorkshop = (id: string, updated: Partial<Workshop>) => {
    setWorkshops(prev => prev.map(w => w.id === id ? { ...w, ...updated } : w));
    addAuditLog('WORKSHOP_EDIT', `Updated workshop #${id}`);
  };

  // Institutional Content (Tabs 1 & 2)
  const handleUpdateContent = (key: 'about_us' | 'project_leaders', title: string, headline: string, body: string) => {
    setContent(prev => ({
      ...prev,
      [key]: {
        key,
        title,
        headline,
        body,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      }
    }));
    addAuditLog('CONTENT_EDIT', `Updated page content for ${key}`);
  };

  // Account Management
  const handleRegisterSuccess = (newUserData: Omit<User, 'id'>) => {
    const id = `user_${Date.now()}`;
    const newUser: User = { ...newUserData, id };
    setUsers(prev => [...prev, newUser]);
    setCurrentUserId(id);
    addAuditLog('REGISTER', `New scholar registered: ${newUser.username} (${newUser.category})`);
    setActiveTab('studies');
  };

  const handleDeleteCurrentAccount = () => {
    if (!currentUser) return;
    const deletedUsername = currentUser.username;
    // Purge records
    setPublications(prev => prev.filter(p => p.userId !== currentUser.id));
    setChallenges(prev => prev.filter(c => c.userId !== currentUser.id));
    setGrowth(prev => prev.filter(g => g.userId !== currentUser.id));
    setAwards(prev => prev.filter(a => a.userId !== currentUser.id));
    setUsers(prev => prev.filter(u => u.id !== currentUser.id));
    setCurrentUserId(null);
    addAuditLog('ACCOUNT_DELETED', `Scholar purged account and data: ${deletedUsername}`);
    setActiveTab('landing');
  };

  // Super Administrator Data Retrieval
  const handleExportDatabaseJson = () => {
    const payload = {
      metadata: {
        system: 'Central University of Technology Academic Society (CUTAS)',
        timestamp: new Date().toISOString(),
        format: 'relational-json-export',
      },
      users,
      studies,
      publications,
      challenges,
      growth,
      funding,
      awards,
      workshops,
      auditLogs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CUTAS_Full_Database_Export_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addAuditLog('DATA_EXPORT', 'Super Administrator downloaded complete database JSON dump');
  };

  // -------------------------------------------------------------------------
  // PDF Document Builders
  // -------------------------------------------------------------------------

  const triggerStudyDetailsPdf = () => {
    if (!currentUser) return;
    setPdfDocument({
      title: 'Postgraduate Study Enrolment Dossier',
      subtitle: `Official Verification Record · ${currentStudyDetails.university}`,
      scholarName: `${currentUser.title} ${currentUser.firstName} ${currentUser.lastName} (Student ID: ${currentUser.studentNumber})`,
      dateGenerated: new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' }),
      sections: [
        {
          heading: 'Academic Programme & Supervisory Governance',
          fields: [
            { label: 'Programme Title', value: currentStudyDetails.programme },
            { label: 'Host University', value: currentStudyDetails.university },
            { label: 'Commencement Year', value: currentStudyDetails.yearOfStarting.toString() },
            { label: 'Anticipated Completion', value: currentStudyDetails.anticipatedYearOfCompletion.toString() },
            { label: 'Primary Supervisor', value: currentStudyDetails.supervisor },
            { label: 'Co-Supervisor', value: currentStudyDetails.coSupervisor || 'N/A' },
            { label: 'Funding Mechanism', value: currentStudyDetails.funding },
            { label: 'Scholar Category', value: currentUser.category ? currentUser.category.replace('_', ' ') : 'Scholar' },
          ]
        },
        {
          heading: 'Approved Research Topic',
          content: currentStudyDetails.researchTopic,
        },
        {
          heading: 'Research Abstract & Methodological Outline',
          content: currentStudyDetails.researchAbstract,
        }
      ]
    });
  };

  const triggerPublicationsPdf = () => {
    if (!currentUser) return;
    const userPubs = publications.filter(p => p.userId === currentUser.id);
    setPdfDocument({
      title: 'Official Postgraduate Publication Record',
      subtitle: 'Accredited Journal Articles, Book Chapters & Conference Proceedings',
      scholarName: `${currentUser.title} ${currentUser.firstName} ${currentUser.lastName}`,
      dateGenerated: new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' }),
      sections: [
        {
          heading: 'Cumulative Scholarly Output',
          table: {
            headers: ['#', 'Type', 'Title of Work', 'Outlet', 'Year', 'Status'],
            rows: userPubs.map((p, i) => [
              (i + 1).toString(),
              p.publicationType.replace('_', ' '),
              p.title,
              p.outletName,
              p.year.toString(),
              p.status.replace('_', ' '),
            ])
          }
        }
      ]
    });
  };

  const triggerChallengesPdf = () => {
    if (!currentUser) return;
    const userCh = challenges.filter(c => c.userId === currentUser.id);
    setPdfDocument({
      title: 'Postgraduate Research Challenges & Resolution Log',
      subtitle: 'Institutional Intervention Log · CUT Academic Society',
      scholarName: `${currentUser.title} ${currentUser.firstName} ${currentUser.lastName}`,
      dateGenerated: new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' }),
      sections: [
        {
          heading: 'Logged Research Bottlenecks & Executive Resolutions',
          table: {
            headers: ['Ref', 'Category', 'Challenge Synopsis', 'Status', 'Resolution / Intervention'],
            rows: userCh.map((c) => [
              `#${c.id}`,
              c.category.replace('_', ' '),
              c.title,
              c.status.replace('_', ' '),
              c.resolutionNotes || 'Pending committee assessment',
            ])
          }
        }
      ]
    });
  };

  const triggerGrowthPdf = () => {
    if (!currentUser) return;
    const userG = growth.filter(g => g.userId === currentUser.id);
    setPdfDocument({
      title: 'Personal Scholarly Growth & Competency Plan',
      subtitle: 'Postgraduate Milestone Development Record',
      scholarName: `${currentUser.title} ${currentUser.firstName} ${currentUser.lastName}`,
      dateGenerated: new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' }),
      sections: [
        {
          heading: 'Individual Growth Objectives',
          table: {
            headers: ['Competency Area', 'Target Objective', 'Target Quarter', 'Milestones', 'Status'],
            rows: userG.map((g) => [
              g.area,
              g.growthObjective,
              g.targetQuarter,
              g.milestoneActions.replace(/\n/g, '; '),
              g.isCompleted ? 'Achieved' : 'In Progress',
            ])
          }
        }
      ]
    });
  };

  const triggerAwardsPdf = () => {
    if (!currentUser) return;
    const userA = awards.filter(a => a.userId === currentUser.id);
    setPdfDocument({
      title: 'Scholarly Distinctions & Awards Dossier',
      subtitle: 'Academic Honours Conferred during Postgraduate Tenure',
      scholarName: `${currentUser.title} ${currentUser.firstName} ${currentUser.lastName}`,
      dateGenerated: new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' }),
      sections: [
        {
          heading: 'Recognitions & Prizes Conferred',
          table: {
            headers: ['Year', 'Award Distinction', 'Conferring Body / Institution', 'Description'],
            rows: userA.map((a) => [
              a.year.toString(),
              a.title,
              a.awardingBody,
              a.description || 'Institutional distinction',
            ])
          }
        }
      ]
    });
  };

  const triggerAnnualReportPdf = () => {
    const categoryStats = challenges.reduce((acc, c) => {
      if (!acc[c.category]) acc[c.category] = { total: 0, open: 0, inReview: 0, resolved: 0 };
      acc[c.category].total += 1;
      if (c.status === 'OPEN') acc[c.category].open += 1;
      if (c.status === 'IN_REVIEW') acc[c.category].inReview += 1;
      if (c.status === 'RESOLVED') acc[c.category].resolved += 1;
      return acc;
    }, {} as Record<string, { total: number; open: number; inReview: number; resolved: number }>);

    setPdfDocument({
      title: `Annual Postgraduate Challenges & Resolutions Report (${new Date().getFullYear()})`,
      subtitle: 'Prepared for CUT Senate & Directorate of Research Development and Postgraduate Studies',
      scholarName: 'Institutional Report · Central University of Technology Academic Society (CUTAS)',
      dateGenerated: new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' }),
      sections: [
        {
          heading: 'Executive Category Breakdown & Resolution Analytics',
          table: {
            headers: ['Challenge Category', 'Total Submissions', 'Open', 'In Review', 'Resolved', 'Resolution Rate'],
            rows: Object.entries(categoryStats).map(([cat, s]) => {
              const rate = s.total > 0 ? Math.round((s.resolved / s.total) * 100) : 0;
              return [
                cat.replace('_', ' '),
                s.total.toString(),
                s.open.toString(),
                s.inReview.toString(),
                s.resolved.toString(),
                `${rate}%`,
              ];
            })
          }
        },
        {
          heading: 'Actionable Institutional Interventions Executed',
          table: {
            headers: ['ID', 'Scholar & Category', 'Category', 'Action Taken & Inter-Institutional Resolutions'],
            rows: challenges.filter(c => c.status === 'RESOLVED').map(c => [
              `#${c.id}`,
              `${c.scholarName} (${c.scholarCategory})`,
              c.category.replace('_', ' '),
              c.resolutionNotes || 'Intervention executed by CUTAS Executive Committee',
            ])
          }
        }
      ]
    });
  };

  // -------------------------------------------------------------------------
  // Render Tab Content
  // -------------------------------------------------------------------------

  const renderContent = () => {
    switch (activeTab) {
      case 'landing':
        return (
          <LandingPage
            currentUser={currentUser}
            funding={funding}
            workshops={workshops}
            scholarsCount={users.filter(u => u.role === 'SCHOLAR').length}
            publicationsCount={publications.length}
            resolvedChallengesCount={challenges.filter(c => c.status === 'RESOLVED').length}
            onNavigate={(tab) => setActiveTab(tab)}
            onEditFunding={currentUser && currentUser.role !== 'SCHOLAR' ? () => setActiveTab('funding') : undefined}
            onAddFunding={currentUser && currentUser.role !== 'SCHOLAR' ? () => setActiveTab('funding') : undefined}
          />
        );

      case 'about':
        return (
          <AboutPage
            currentUser={currentUser}
            content={content.about_us}
            onUpdateContent={handleUpdateContent}
          />
        );

      case 'leaders':
        return (
          <LeadersPage
            currentUser={currentUser}
            content={content.project_leaders}
            administrators={users.filter(u => u.role !== 'SCHOLAR')}
            onUpdateContent={handleUpdateContent}
          />
        );

      case 'scholars':
        return (
          <ScholarsPage
            scholars={users.filter(u => u.role === 'SCHOLAR')}
            currentUser={currentUser}
          />
        );

      case 'studies':
        if (!currentUser) return <div className="p-8 text-center text-xs">Please sign in to view study records.</div>;
        return (
          <StudyDetailsPage
            currentUser={currentUser}
            studyDetails={currentStudyDetails}
            onUpdateStudyDetails={handleUpdateStudyDetails}
            onDownloadPdf={triggerStudyDetailsPdf}
          />
        );

      case 'publications':
        if (!currentUser) return <div className="p-8 text-center text-xs">Please sign in to view publications.</div>;
        return (
          <PublicationsPage
            currentUser={currentUser}
            publications={publications.filter(p => p.userId === currentUser.id)}
            onAddPublication={handleAddPublication}
            onEditPublication={handleEditPublication}
            onDeletePublication={handleDeletePublication}
            onDownloadPdf={triggerPublicationsPdf}
          />
        );

      case 'challenges':
        if (!currentUser) return <div className="p-8 text-center text-xs">Please sign in to access challenges.</div>;
        return (
          <ChallengesPage
            currentUser={currentUser}
            challenges={challenges}
            onSubmitChallenge={handleSubmitChallenge}
            onUpdateResolution={handleUpdateChallengeResolution}
            onDownloadPdf={triggerChallengesPdf}
          />
        );

      case 'growth':
        if (!currentUser) return <div className="p-8 text-center text-xs">Please sign in to view growth targets.</div>;
        return (
          <GrowthPage
            currentUser={currentUser}
            growthSuggestions={growth}
            onAddGrowth={handleAddGrowth}
            onToggleComplete={handleToggleGrowthComplete}
            onDownloadPdf={triggerGrowthPdf}
          />
        );

      case 'funding':
        return (
          <FundingPage
            currentUser={currentUser}
            funding={funding}
            onAddFunding={handleAddFunding}
            onEditFunding={handleEditFunding}
          />
        );

      case 'awards':
        if (!currentUser) return <div className="p-8 text-center text-xs">Please sign in to record awards.</div>;
        return (
          <AwardsPage
            currentUser={currentUser}
            awards={awards}
            onAddAward={handleAddAward}
            onDeleteAward={handleDeleteAward}
            onDownloadPdf={triggerAwardsPdf}
          />
        );

      case 'workshops':
        return (
          <WorkshopsPage
            currentUser={currentUser}
            workshops={workshops}
            onAddWorkshop={handleAddWorkshop}
            onEditWorkshop={handleEditWorkshop}
          />
        );

      case 'admin_dashboard':
        if (!currentUser || currentUser.role === 'SCHOLAR') {
          return (
            <div className="bg-red-50 border border-red-200 text-red-900 p-8 rounded-xl text-center text-xs">
              <h2 className="text-base font-bold mb-2">Access Restricted</h2>
              <p>Administrative privileges are required to view the CUTAS Governance Dashboard.</p>
              <p className="mt-2 text-slate-600">Switch to Administrator or Super Administrator using the role dropdown in the header.</p>
            </div>
          );
        }
        return (
          <AdminDashboardPage
            currentUser={currentUser}
            challenges={challenges}
            auditLogs={auditLogs}
            scholarsCount={users.filter(u => u.role === 'SCHOLAR').length}
            fundingCount={funding.length}
            workshopsCount={workshops.length}
            onUpdateChallengeResolution={handleUpdateChallengeResolution}
            onGenerateAnnualReportPdf={triggerAnnualReportPdf}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onExportDatabaseJson={handleExportDatabaseJson}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans antialiased w-full overflow-x-hidden">
      {/* CUT Institutional Header */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        users={users}
        onSwitchUser={handleSwitchUser}
        onOpenLogin={() => setAuthModal({ isOpen: true, type: 'LOGIN' })}
        onOpenRegister={() => setAuthModal({ isOpen: true, type: 'REGISTER' })}
        onOpenChangePassword={() => setAuthModal({ isOpen: true, type: 'CHANGE_PASSWORD' })}
        onOpenDeleteAccount={() => setAuthModal({ isOpen: true, type: 'DELETE_ACCOUNT' })}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* Dynamic Tab Views */}
        {renderContent()}
      </main>

      {/* CUT Institutional Footer */}
      <Footer
        setActiveTab={setActiveTab}
      />

      {/* Printable PDF Academic Letterhead Modal */}
      <PdfModal
        document={pdfDocument}
        onClose={() => setPdfDocument(null)}
      />

      {/* Django Codebase & Architecture Inspector */}
      <DjangoCodeViewer
        isOpen={isDjangoViewerOpen}
        onClose={() => setIsDjangoViewerOpen(false)}
      />

      {/* Authentication & Account Management Modals */}
      <AuthModals
        isOpen={authModal.isOpen}
        type={authModal.type}
        currentUser={currentUser}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        onSwitchType={(type) => setAuthModal({ isOpen: true, type })}
        onLoginSuccess={(username) => {
          const user = users.find(u => u.username === username);
          if (user) handleSwitchUser(user.id);
        }}
        onRegisterSuccess={handleRegisterSuccess}
        onPasswordChangeSuccess={() => {
          addAuditLog('PASSWORD_CHANGE', 'Password updated successfully');
        }}
        onDeleteAccountSuccess={handleDeleteCurrentAccount}
      />
    </div>
  );
}
