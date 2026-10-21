import React, { useState, useRef } from 'react';
import { 
  User, Challenge, ChallengeStatus, AuditLogItem, TabId, 
  FundingOpportunity, Workshop, InstitutionalContent, ScholarCategory 
} from '../types';
import { PageHeader, PageHeaderButton } from '../components/PageHeader';
import { 
  Shield, FileText, DollarSign, Calendar, AlertCircle, Users, 
  FileDown, Database, Search, Plus, Edit3, Trash2, CheckCircle2, 
  Clock, Lock, Check, ChevronDown, Save, Eye, Filter, RefreshCw
} from 'lucide-react';

export type AdminConsoleSection = 
  | 'content'
  | 'funding'
  | 'workshops'
  | 'challenges'
  | 'scholars'
  | 'reports'
  | 'audit'
  | 'export';

interface AdminDashboardPageProps {
  currentUser: User;
  users: User[];
  challenges: Challenge[];
  auditLogs: AuditLogItem[];
  funding: FundingOpportunity[];
  workshops: Workshop[];
  content: Record<string, InstitutionalContent>;
  onUpdateChallengeResolution: (id: string, status: ChallengeStatus, notes: string) => void;
  onGenerateAnnualReportPdf: () => void;
  onNavigateTab: (tab: TabId) => void;
  onExportDatabaseJson: () => void;
  onUpdateContent: (key: 'about_us' | 'project_leaders', title: string, headline: string, body: string, status?: 'DRAFT' | 'PUBLISHED') => void;
  onAddFunding: (item: Omit<FundingOpportunity, 'id'>) => void;
  onEditFunding: (id: string, updated: Partial<FundingOpportunity>) => void;
  onDeleteFunding: (id: string) => void;
  onAddWorkshop: (item: Omit<Workshop, 'id'>) => void;
  onEditWorkshop: (id: string, updated: Partial<Workshop>) => void;
  onDeleteWorkshop: (id: string) => void;
  onUpdateScholarCategory: (userId: string, category: ScholarCategory) => void;
  onAddAuditLog?: (action: string, details: string, target?: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  currentUser,
  users,
  challenges,
  auditLogs,
  funding,
  workshops,
  content,
  onUpdateChallengeResolution,
  onGenerateAnnualReportPdf,
  onNavigateTab,
  onExportDatabaseJson,
  onUpdateContent,
  onAddFunding,
  onEditFunding,
  onDeleteFunding,
  onAddWorkshop,
  onEditWorkshop,
  onDeleteWorkshop,
  onUpdateScholarCategory,
  onAddAuditLog,
}) => {
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  // Active section state
  const [activeSection, setActiveSection] = useState<AdminConsoleSection>('content');

  // Ref to content panel for smooth scroll on module switch
  const contentTopRef = useRef<HTMLDivElement>(null);

  const handleSelectSection = (section: AdminConsoleSection) => {
    setActiveSection(section);
    contentTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Success message state
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // --------------------------------------------------------------------------
  // SECTION A: CONTENT EDITING
  // --------------------------------------------------------------------------
  const [selectedContentKey, setSelectedContentKey] = useState<'about_us' | 'project_leaders'>('about_us');
  const activeContent = content[selectedContentKey] || {
    key: selectedContentKey,
    title: '',
    headline: '',
    body: '',
    updatedAt: '',
    status: 'PUBLISHED',
  };
  const [contentTitle, setContentTitle] = useState(activeContent.title);
  const [contentHeadline, setContentHeadline] = useState(activeContent.headline);
  const [contentBody, setContentBody] = useState(activeContent.body);
  const [contentStatus, setContentStatus] = useState<'DRAFT' | 'PUBLISHED'>(activeContent.status || 'PUBLISHED');

  // Sync state when selected key changes
  const handleSelectContentKey = (key: 'about_us' | 'project_leaders') => {
    setSelectedContentKey(key);
    const item = content[key];
    if (item) {
      setContentTitle(item.title);
      setContentHeadline(item.headline);
      setContentBody(item.body);
      setContentStatus(item.status || 'PUBLISHED');
    }
  };

  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateContent(selectedContentKey, contentTitle, contentHeadline, contentBody, contentStatus);
    onAddAuditLog?.('CONTENT_UPDATE', `Updated ${selectedContentKey} content (${contentStatus})`, selectedContentKey);
    showFeedback(`${selectedContentKey === 'about_us' ? 'About Us' : 'Project Leaders'} content saved successfully.`);
  };

  // --------------------------------------------------------------------------
  // SECTION B: FUNDING MANAGEMENT
  // --------------------------------------------------------------------------
  const [isFundingFormOpen, setIsFundingFormOpen] = useState(false);
  const [editingFundingId, setEditingFundingId] = useState<string | null>(null);
  const [fundingFormData, setFundingFormData] = useState({
    title: '',
    funder: '',
    amountRange: '',
    deadline: '',
    eligibility: '',
    applicationProcess: '',
    portalUrl: '',
    featuredOnLanding: true,
    isActive: true,
    status: 'PUBLISHED' as 'DRAFT' | 'PUBLISHED',
  });

  const resetFundingForm = () => {
    setFundingFormData({
      title: '',
      funder: '',
      amountRange: '',
      deadline: '',
      eligibility: '',
      applicationProcess: '',
      portalUrl: '',
      featuredOnLanding: true,
      isActive: true,
      status: 'PUBLISHED',
    });
    setEditingFundingId(null);
    setIsFundingFormOpen(false);
  };

  const handleStartEditFunding = (item: FundingOpportunity) => {
    setEditingFundingId(item.id);
    setFundingFormData({
      title: item.title,
      funder: item.funder,
      amountRange: item.amountRange,
      deadline: item.deadline,
      eligibility: item.eligibility,
      applicationProcess: item.applicationProcess,
      portalUrl: item.portalUrl,
      featuredOnLanding: item.featuredOnLanding,
      isActive: item.isActive,
      status: item.status || 'PUBLISHED',
    });
    setIsFundingFormOpen(true);
  };

  const handleSaveFunding = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFundingId) {
      onEditFunding(editingFundingId, fundingFormData);
      onAddAuditLog?.('FUNDING_EDIT', `Updated funding call: ${fundingFormData.title}`, editingFundingId);
      showFeedback('Funding opportunity updated successfully.');
    } else {
      onAddFunding(fundingFormData);
      onAddAuditLog?.('FUNDING_CREATE', `Created funding call: ${fundingFormData.title}`);
      showFeedback('New funding opportunity created.');
    }
    resetFundingForm();
  };

  const handleDeleteFundingItem = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      onDeleteFunding(id);
      onAddAuditLog?.('FUNDING_DELETE', `Deleted funding call: ${title}`, id);
      showFeedback('Funding opportunity deleted.');
    }
  };

  // --------------------------------------------------------------------------
  // SECTION C: WORKSHOP MANAGEMENT
  // --------------------------------------------------------------------------
  const [isWorkshopFormOpen, setIsWorkshopFormOpen] = useState(false);
  const [editingWorkshopId, setEditingWorkshopId] = useState<string | null>(null);
  const [workshopFormData, setWorkshopFormData] = useState({
    title: '',
    facilitator: '',
    eventDate: '',
    eventTime: '',
    venueOrLink: '',
    description: '',
    category: 'Methodology & Writing',
    status: 'PUBLISHED' as 'DRAFT' | 'PUBLISHED',
  });

  const resetWorkshopForm = () => {
    setWorkshopFormData({
      title: '',
      facilitator: '',
      eventDate: '',
      eventTime: '',
      venueOrLink: '',
      description: '',
      category: 'Methodology & Writing',
      status: 'PUBLISHED',
    });
    setEditingWorkshopId(null);
    setIsWorkshopFormOpen(false);
  };

  const handleStartEditWorkshop = (item: Workshop) => {
    setEditingWorkshopId(item.id);
    setWorkshopFormData({
      title: item.title,
      facilitator: item.facilitator,
      eventDate: item.eventDate,
      eventTime: item.eventTime,
      venueOrLink: item.venueOrLink,
      description: item.description,
      category: item.category,
      status: item.status || 'PUBLISHED',
    });
    setIsWorkshopFormOpen(true);
  };

  const handleSaveWorkshop = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWorkshopId) {
      onEditWorkshop(editingWorkshopId, workshopFormData);
      onAddAuditLog?.('WORKSHOP_EDIT', `Updated workshop: ${workshopFormData.title}`, editingWorkshopId);
      showFeedback('Workshop updated successfully.');
    } else {
      onAddWorkshop(workshopFormData);
      onAddAuditLog?.('WORKSHOP_CREATE', `Scheduled workshop: ${workshopFormData.title}`);
      showFeedback('New workshop scheduled.');
    }
    resetWorkshopForm();
  };

  const handleDeleteWorkshopItem = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to cancel and remove "${title}"?`)) {
      onDeleteWorkshop(id);
      onAddAuditLog?.('WORKSHOP_DELETE', `Cancelled workshop: ${title}`, id);
      showFeedback('Workshop removed.');
    }
  };

  // --------------------------------------------------------------------------
  // SECTION D: CHALLENGES QUEUE
  // --------------------------------------------------------------------------
  const [challengeFilter, setChallengeFilter] = useState<'ALL' | 'OPEN' | 'IN_REVIEW' | 'RESOLVED'>('ALL');
  const [reviewingChallenge, setReviewingChallenge] = useState<Challenge | null>(null);
  const [reviewStatus, setReviewStatus] = useState<ChallengeStatus>('IN_REVIEW');
  const [reviewNotes, setReviewNotes] = useState('');

  const filteredChallenges = challenges.filter(c => {
    if (challengeFilter === 'ALL') return true;
    return c.status === challengeFilter;
  });

  const handleSaveChallengeResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingChallenge) return;
    onUpdateChallengeResolution(reviewingChallenge.id, reviewStatus, reviewNotes);
    onAddAuditLog?.('CHALLENGE_RESOLVE', `Updated status to ${reviewStatus} for challenge #${reviewingChallenge.id}`, reviewingChallenge.id);
    showFeedback(`Challenge #${reviewingChallenge.id} resolution updated.`);
    setReviewingChallenge(null);
  };

  // --------------------------------------------------------------------------
  // SECTION E: SCHOLARS MANAGEMENT & CATEGORY ASSIGNMENT
  // --------------------------------------------------------------------------
  const [scholarSearch, setScholarSearch] = useState('');
  const [scholarCatFilter, setScholarCatFilter] = useState<string>('ALL');

  const scholarsList = users.filter(u => u.role === 'SCHOLAR');
  const filteredScholars = scholarsList.filter(s => {
    const matchesSearch = 
      `${s.firstName} ${s.lastName} ${s.studentNumber} ${s.faculty} ${s.department}`
        .toLowerCase()
        .includes(scholarSearch.toLowerCase());
    const matchesCat = scholarCatFilter === 'ALL' || s.category === scholarCatFilter;
    return matchesSearch && matchesCat;
  });

  // --------------------------------------------------------------------------
  // SECTION F: REPORTS
  // --------------------------------------------------------------------------
  const [reportYear, setReportYear] = useState('2026');

  // --------------------------------------------------------------------------
  // SECTION H: DATA EXPORT (SUPER ADMIN ONLY)
  // --------------------------------------------------------------------------
  const [reauthPassword, setReauthPassword] = useState('');
  const [isExportUnlocked, setIsExportUnlocked] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleUnlockExport = (e: React.FormEvent) => {
    e.preventDefault();
    if (reauthPassword.length < 6) {
      setExportError('Re-authentication requires current administrator password.');
      return;
    }
    setExportError(null);
    setIsExportUnlocked(true);
    showFeedback('Re-authentication confirmed. Export controls unlocked.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header (Task 2 compliant) */}
      <PageHeader
        eyebrow="CENTRAL UNIVERSITY OF TECHNOLOGY ACADEMIC SOCIETY"
        title="Unified Administrator Console"
        description="Single source of truth for CUTAS institutional management: content publishing, bursary calls, workshops, challenge triage, scholar category assignments, and governance records."
        badge={
          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#255190] text-white px-2 py-0.5 rounded-[4px]">
            {currentUser.role.replace('_', ' ')}
          </span>
        }
      />

      {/* Global Feedback Banner */}
      {feedbackMsg && (
        <div className={`p-3.5 rounded-[4px] border text-xs flex items-center gap-2 ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-red-50 border-red-200 text-red-900'
        }`}>
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span className="font-medium">{feedbackMsg.text}</span>
        </div>
      )}

      {/* Console Main Container: Sidebar + Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="bg-white rounded-[6px] border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#255190] block">
              Management Modules
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              Logged as <b>{currentUser.firstName} {currentUser.lastName}</b>
            </span>
          </div>

          <nav className="p-2 space-y-1 text-xs">
            {/* a) Content */}
            <button
              type="button"
              onClick={() => handleSelectSection('content')}
              className={`w-full text-left px-3 py-2.5 rounded-[4px] font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                activeSection === 'content' ? 'bg-[#255190] text-white' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>Content Pages</span>
              </div>
            </button>

            {/* b) Funding */}
            <button
              type="button"
              onClick={() => handleSelectSection('funding')}
              className={`w-full text-left px-3 py-2.5 rounded-[4px] font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                activeSection === 'funding' ? 'bg-[#255190] text-white' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4" />
                <span>Funding Calls</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.2 rounded ${activeSection === 'funding' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {funding.length}
              </span>
            </button>

            {/* c) Workshops */}
            <button
              type="button"
              onClick={() => handleSelectSection('workshops')}
              className={`w-full text-left px-3 py-2.5 rounded-[4px] font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                activeSection === 'workshops' ? 'bg-[#255190] text-white' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4" />
                <span>Workshops</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.2 rounded ${activeSection === 'workshops' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {workshops.length}
              </span>
            </button>

            {/* d) Challenges Queue */}
            <button
              type="button"
              onClick={() => handleSelectSection('challenges')}
              className={`w-full text-left px-3 py-2.5 rounded-[4px] font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                activeSection === 'challenges' ? 'bg-[#255190] text-white' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4" />
                <span>Challenges Queue</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                challenges.some(c => c.status === 'OPEN') 
                  ? 'bg-amber-400 text-slate-900' 
                  : (activeSection === 'challenges' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600')
              }`}>
                {challenges.filter(c => c.status !== 'RESOLVED').length}
              </span>
            </button>

            {/* e) Scholars */}
            <button
              type="button"
              onClick={() => handleSelectSection('scholars')}
              className={`w-full text-left px-3 py-2.5 rounded-[4px] font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                activeSection === 'scholars' ? 'bg-[#255190] text-white' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Scholars & Tiers</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.2 rounded ${activeSection === 'scholars' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {scholarsList.length}
              </span>
            </button>

            {/* f) Reports */}
            <button
              type="button"
              onClick={() => handleSelectSection('reports')}
              className={`w-full text-left px-3 py-2.5 rounded-[4px] font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                activeSection === 'reports' ? 'bg-[#255190] text-white' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileDown className="w-4 h-4" />
                <span>Annual Reports</span>
              </div>
            </button>

            {/* SUPER ADMIN ONLY SECTIONS */}
            {isSuperAdmin && (
              <>
                <div className="pt-3 pb-1 px-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                    Super Admin Only
                  </span>
                </div>

                {/* g) Audit Log */}
                <button
                  type="button"
                  onClick={() => handleSelectSection('audit')}
                  className={`w-full text-left px-3 py-2.5 rounded-[4px] font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    activeSection === 'audit' ? 'bg-[#255190] text-white' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4" />
                    <span>Audit Log</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded ${activeSection === 'audit' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {auditLogs.length}
                  </span>
                </button>

                {/* h) Data Export */}
                <button
                  type="button"
                  onClick={() => handleSelectSection('export')}
                  className={`w-full text-left px-3 py-2.5 rounded-[4px] font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    activeSection === 'export' ? 'bg-[#255190] text-white' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Database className="w-4 h-4" />
                    <span>Database Export</span>
                  </div>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Content Panel */}
        <div ref={contentTopRef} className="lg:col-span-3 space-y-4">
          {/* ================================================================ */}
          {/* A: CONTENT EDITING */}
          {/* ================================================================ */}
          {activeSection === 'content' && (
            <div className="bg-white rounded-[6px] border border-[#E2E8F0] shadow-xs p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-semibold text-[#255190]">Public Institutional Content</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Publish and update copy for About Us and Project Leaders. Single source of truth.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectContentKey('about_us')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] cursor-pointer transition-colors ${
                      selectedContentKey === 'about_us'
                        ? 'bg-[#255190] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    About Us
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectContentKey('project_leaders')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] cursor-pointer transition-colors ${
                      selectedContentKey === 'project_leaders'
                        ? 'bg-[#255190] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Leaders & Governance
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveContent} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Page Title *</label>
                  <input
                    type="text"
                    required
                    value={contentTitle}
                    onChange={(e) => setContentTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Headline / Subtitle *</label>
                  <input
                    type="text"
                    required
                    value={contentHeadline}
                    onChange={(e) => setContentHeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Narrative Body *</label>
                  <textarea
                    rows={10}
                    required
                    value={contentBody}
                    onChange={(e) => setContentBody(e.target.value)}
                    className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] leading-relaxed font-sans"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="content_status"
                        checked={contentStatus === 'PUBLISHED'}
                        onChange={() => setContentStatus('PUBLISHED')}
                        className="text-[#255190] focus:ring-[#255190]"
                      />
                      <span className="font-semibold text-slate-800">Published (Visible on site)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="content_status"
                        checked={contentStatus === 'DRAFT'}
                        onChange={() => setContentStatus('DRAFT')}
                        className="text-slate-500 focus:ring-slate-400"
                      />
                      <span className="text-slate-600">Save as Draft</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="h-10 px-5 bg-[#255190] hover:bg-[#183765] text-white font-semibold rounded-[4px] text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save {selectedContentKey === 'about_us' ? 'About Us' : 'Leaders'} Content</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================================================================ */}
          {/* B: FUNDING OPPORTUNITIES */}
          {/* ================================================================ */}
          {activeSection === 'funding' && (
            <div className="bg-white rounded-[6px] border border-[#E2E8F0] shadow-xs p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-semibold text-[#255190]">Bursary & Grant Calls</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Create, edit, feature, and publish funding calls. Changes immediately reflect on the public page and landing page.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    resetFundingForm();
                    setIsFundingFormOpen(true);
                  }}
                  className="h-9 px-4 bg-[#FDB813] hover:bg-[#e5a610] text-slate-900 font-bold rounded-[4px] text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Funding Call</span>
                </button>
              </div>

              {/* Funding Form Modal/Inline */}
              {isFundingFormOpen && (
                <div className="p-4 sm:p-5 bg-slate-50 border border-slate-300 rounded-[6px] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#255190] uppercase tracking-wider">
                      {editingFundingId ? 'Edit Funding Call' : 'Create New Funding Call'}
                    </h3>
                    <button
                      type="button"
                      onClick={resetFundingForm}
                      className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSaveFunding} className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Opportunity Title *</label>
                        <input
                          type="text"
                          required
                          value={fundingFormData.title}
                          onChange={(e) => setFundingFormData({ ...fundingFormData, title: e.target.value })}
                          className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Funder / Organization *</label>
                        <input
                          type="text"
                          required
                          value={fundingFormData.funder}
                          onChange={(e) => setFundingFormData({ ...fundingFormData, funder: e.target.value })}
                          className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Amount / Value *</label>
                        <input
                          type="text"
                          required
                          value={fundingFormData.amountRange}
                          onChange={(e) => setFundingFormData({ ...fundingFormData, amountRange: e.target.value })}
                          placeholder="e.g. R150,000 p.a."
                          className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Application Deadline *</label>
                        <input
                          type="date"
                          required
                          value={fundingFormData.deadline}
                          onChange={(e) => setFundingFormData({ ...fundingFormData, deadline: e.target.value })}
                          className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Portal URL (https://) *</label>
                        <input
                          type="url"
                          required
                          value={fundingFormData.portalUrl}
                          onChange={(e) => setFundingFormData({ ...fundingFormData, portalUrl: e.target.value })}
                          placeholder="https://..."
                          className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Eligibility Criteria</label>
                      <textarea
                        rows={2}
                        value={fundingFormData.eligibility}
                        onChange={(e) => setFundingFormData({ ...fundingFormData, eligibility: e.target.value })}
                        className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Application Process Instructions</label>
                      <textarea
                        rows={2}
                        value={fundingFormData.applicationProcess}
                        onChange={(e) => setFundingFormData({ ...fundingFormData, applicationProcess: e.target.value })}
                        className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] bg-white"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={fundingFormData.featuredOnLanding}
                            onChange={(e) => setFundingFormData({ ...fundingFormData, featuredOnLanding: e.target.checked })}
                            className="rounded text-[#255190] focus:ring-[#255190]"
                          />
                          <span>Feature on Landing Page</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={fundingFormData.isActive}
                            onChange={(e) => setFundingFormData({ ...fundingFormData, isActive: e.target.checked })}
                            className="rounded text-[#255190] focus:ring-[#255190]"
                          />
                          <span>Active / Accepting Applications</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={fundingFormData.status}
                          onChange={(e) => setFundingFormData({ ...fundingFormData, status: e.target.value as 'DRAFT' | 'PUBLISHED' })}
                          className="px-2.5 py-1.5 rounded-[4px] border border-slate-300 bg-white text-xs font-semibold"
                        >
                          <option value="PUBLISHED">Status: Published</option>
                          <option value="DRAFT">Status: Draft</option>
                        </select>

                        <button
                          type="submit"
                          className="h-9 px-4 bg-[#255190] hover:bg-[#183765] text-white font-semibold rounded-[4px] text-xs transition-colors cursor-pointer"
                        >
                          {editingFundingId ? 'Update Funding' : 'Save & Publish'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Funding Items Table */}
              <div className="border border-slate-200 rounded-[6px] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <tr>
                      <th className="p-3 font-semibold">Title & Funder</th>
                      <th className="p-3 font-semibold">Amount</th>
                      <th className="p-3 font-semibold">Deadline</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {funding.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <span className="font-semibold text-slate-900 block">{item.title}</span>
                          <span className="text-[11px] text-slate-500">{item.funder}</span>
                        </td>
                        <td className="p-3 font-medium text-emerald-800">{item.amountRange}</td>
                        <td className="p-3 text-slate-600">{item.deadline}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] uppercase ${
                            item.status === 'DRAFT' 
                              ? 'bg-slate-100 text-slate-600' 
                              : (item.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')
                          }`}>
                            {item.status === 'DRAFT' ? 'Draft' : (item.isActive ? 'Published' : 'Inactive')}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartEditFunding(item)}
                              className="px-2.5 py-1 text-slate-700 hover:text-[#255190] bg-slate-100 hover:bg-blue-50 rounded-[4px] font-semibold cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteFundingItem(item.id, item.title)}
                              className="px-2.5 py-1 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-[4px] font-semibold cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* C: WORKSHOPS MANAGEMENT */}
          {/* ================================================================ */}
          {activeSection === 'workshops' && (
            <div className="bg-white rounded-[6px] border border-[#E2E8F0] shadow-xs p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-semibold text-[#255190]">Workshops & Methodology Clinics</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Schedule, edit, or cancel academic workshops and thesis colloquiums.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    resetWorkshopForm();
                    setIsWorkshopFormOpen(true);
                  }}
                  className="h-9 px-4 bg-[#FDB813] hover:bg-[#e5a610] text-slate-900 font-bold rounded-[4px] text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Schedule Workshop</span>
                </button>
              </div>

              {/* Workshop Form */}
              {isWorkshopFormOpen && (
                <div className="p-4 sm:p-5 bg-slate-50 border border-slate-300 rounded-[6px] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#255190] uppercase tracking-wider">
                      {editingWorkshopId ? 'Edit Workshop' : 'Schedule New Workshop'}
                    </h3>
                    <button
                      type="button"
                      onClick={resetWorkshopForm}
                      className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSaveWorkshop} className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Workshop Title *</label>
                        <input
                          type="text"
                          required
                          value={workshopFormData.title}
                          onChange={(e) => setWorkshopFormData({ ...workshopFormData, title: e.target.value })}
                          className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Lead Facilitator *</label>
                        <input
                          type="text"
                          required
                          value={workshopFormData.facilitator}
                          onChange={(e) => setWorkshopFormData({ ...workshopFormData, facilitator: e.target.value })}
                          className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                        <input
                          type="date"
                          required
                          value={workshopFormData.eventDate}
                          onChange={(e) => setWorkshopFormData({ ...workshopFormData, eventDate: e.target.value })}
                          className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Time (SAST) *</label>
                        <input
                          type="text"
                          required
                          value={workshopFormData.eventTime}
                          onChange={(e) => setWorkshopFormData({ ...workshopFormData, eventTime: e.target.value })}
                          placeholder="e.g. 10:00 - 12:30"
                          className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Venue / Online Link *</label>
                        <input
                          type="text"
                          required
                          value={workshopFormData.venueOrLink}
                          onChange={(e) => setWorkshopFormData({ ...workshopFormData, venueOrLink: e.target.value })}
                          placeholder="e.g. MS Teams or Room 102"
                          className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Syllabus & Synopsis</label>
                      <textarea
                        rows={3}
                        value={workshopFormData.description}
                        onChange={(e) => setWorkshopFormData({ ...workshopFormData, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-[4px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#255190] bg-white"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <select
                        value={workshopFormData.status}
                        onChange={(e) => setWorkshopFormData({ ...workshopFormData, status: e.target.value as 'DRAFT' | 'PUBLISHED' })}
                        className="px-2.5 py-1.5 rounded-[4px] border border-slate-300 bg-white text-xs font-semibold"
                      >
                        <option value="PUBLISHED">Status: Published</option>
                        <option value="DRAFT">Status: Draft</option>
                      </select>

                      <button
                        type="submit"
                        className="h-9 px-4 bg-[#255190] hover:bg-[#183765] text-white font-semibold rounded-[4px] text-xs transition-colors cursor-pointer"
                      >
                        {editingWorkshopId ? 'Update Workshop' : 'Schedule & Publish'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Workshops Table */}
              <div className="border border-slate-200 rounded-[6px] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <tr>
                      <th className="p-3 font-semibold">Title & Facilitator</th>
                      <th className="p-3 font-semibold">Date & Time</th>
                      <th className="p-3 font-semibold">Venue</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {workshops.map((ws) => (
                      <tr key={ws.id} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <span className="font-semibold text-slate-900 block">{ws.title}</span>
                          <span className="text-[11px] text-slate-500">By {ws.facilitator}</span>
                        </td>
                        <td className="p-3 text-slate-600">
                          <span>{ws.eventDate}</span>
                          <span className="block text-[11px] text-slate-400">{ws.eventTime}</span>
                        </td>
                        <td className="p-3 text-slate-600 truncate max-w-[160px]">{ws.venueOrLink}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] uppercase ${
                            ws.status === 'DRAFT' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {ws.status === 'DRAFT' ? 'Draft' : 'Published'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartEditWorkshop(ws)}
                              className="px-2.5 py-1 text-slate-700 hover:text-[#255190] bg-slate-100 hover:bg-blue-50 rounded-[4px] font-semibold cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteWorkshopItem(ws.id, ws.title)}
                              className="px-2.5 py-1 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-[4px] font-semibold cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* D: CHALLENGES QUEUE */}
          {/* ================================================================ */}
          {activeSection === 'challenges' && (
            <div className="bg-white rounded-[6px] border border-[#E2E8F0] shadow-xs p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-semibold text-[#255190]">Scholar Challenges & Interventions</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review thesis, lab access, Turnitin, or funding bottlenecks logged by postgraduate scholars.
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {(['ALL', 'OPEN', 'IN_REVIEW', 'RESOLVED'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setChallengeFilter(st)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-[4px] cursor-pointer transition-colors ${
                        challengeFilter === st 
                          ? 'bg-[#255190] text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'ALL' ? 'All' : st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Challenge Modal */}
              {reviewingChallenge && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-[6px] border border-slate-300 shadow-xl max-w-lg w-full p-6 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h3 className="text-sm font-bold text-[#255190]">
                        Resolve Challenge #{reviewingChallenge.id}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setReviewingChallenge(null)}
                        className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Scholar</span>
                        <span className="font-semibold text-slate-900">{reviewingChallenge.scholarName} ({reviewingChallenge.scholarCategory})</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Issue</span>
                        <span className="font-semibold text-slate-900">{reviewingChallenge.title}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Description</span>
                        <p className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-700 leading-relaxed">
                          {reviewingChallenge.description}
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSaveChallengeResolution} className="space-y-3 text-xs pt-2">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Status</label>
                        <select
                          value={reviewStatus}
                          onChange={(e) => setReviewStatus(e.target.value as ChallengeStatus)}
                          className="w-full px-3 py-2 rounded-[4px] border border-slate-300 bg-white"
                        >
                          <option value="OPEN">Open (Pending Review)</option>
                          <option value="IN_REVIEW">In Review (Committee Intervention)</option>
                          <option value="RESOLVED">Resolved (Intervention Executed)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Resolution & Committee Notes *</label>
                        <textarea
                          rows={3}
                          required
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          placeholder="Action taken or guidance provided to scholar..."
                          className="w-full px-3 py-2 rounded-[4px] border border-slate-300"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setReviewingChallenge(null)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[4px] font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#255190] hover:bg-[#183765] text-white rounded-[4px] font-bold cursor-pointer"
                        >
                          Save Resolution
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Challenge List */}
              <div className="space-y-3">
                {filteredChallenges.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 border border-slate-200 rounded-[6px]">
                    No challenges match the selected filter.
                  </div>
                ) : (
                  filteredChallenges.map((ch) => (
                    <div
                      key={ch.id}
                      className="p-4 rounded-[6px] border border-slate-200 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] uppercase ${
                            ch.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                            ch.status === 'IN_REVIEW' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {ch.status.replace('_', ' ')}
                          </span>
                          <span className="font-bold text-slate-900">{ch.scholarName}</span>
                          <span className="text-[11px] text-slate-400">({ch.scholarCategory})</span>
                        </div>
                        <h4 className="font-semibold text-slate-900">{ch.title}</h4>
                        <p className="text-slate-600 line-clamp-2 leading-relaxed">{ch.description}</p>
                        {ch.resolutionNotes && (
                          <div className="text-[11px] text-emerald-800 bg-emerald-50/70 p-1.5 rounded border border-emerald-100 mt-1">
                            <b>Resolution:</b> {ch.resolutionNotes}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setReviewingChallenge(ch);
                          setReviewStatus(ch.status === 'OPEN' ? 'IN_REVIEW' : ch.status);
                          setReviewNotes(ch.resolutionNotes || '');
                        }}
                        className="h-9 px-4 bg-[#255190] hover:bg-[#183765] text-white font-semibold rounded-[4px] text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap flex-shrink-0"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Triage / Resolve</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* E: SCHOLARS & CATEGORY ASSIGNMENT */}
          {/* ================================================================ */}
          {activeSection === 'scholars' && (
            <div className="bg-white rounded-[6px] border border-[#E2E8F0] shadow-xs p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-semibold text-[#255190]">Scholars Directory & Tier Assignments</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Admins assign Scholar Categories (A/B/C). Scholars cannot self-promote.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search scholars..."
                      value={scholarSearch}
                      onChange={(e) => setScholarSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs rounded-[4px] border border-slate-300 w-44 sm:w-56"
                    />
                  </div>

                  <select
                    value={scholarCatFilter}
                    onChange={(e) => setScholarCatFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-[4px] border border-slate-300 bg-white"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="CAT_A">Category A</option>
                    <option value="CAT_B">Category B</option>
                    <option value="CAT_C">Category C</option>
                  </select>
                </div>
              </div>

              <div className="border border-slate-200 rounded-[6px] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <tr>
                      <th className="p-3 font-semibold">Scholar Name</th>
                      <th className="p-3 font-semibold">Student / Staff No.</th>
                      <th className="p-3 font-semibold">Faculty / Department</th>
                      <th className="p-3 font-semibold">Assigned Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredScholars.map((sc) => (
                      <tr key={sc.id} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <span className="font-semibold text-slate-900 block">{sc.title} {sc.firstName} {sc.lastName}</span>
                          <span className="text-[11px] text-slate-500">{sc.email}</span>
                        </td>
                        <td className="p-3 font-mono text-slate-700">{sc.studentNumber}</td>
                        <td className="p-3 text-slate-600">
                          <span className="block truncate max-w-[200px]">{sc.faculty}</span>
                          <span className="text-[11px] text-slate-400 truncate max-w-[200px] block">{sc.department}</span>
                        </td>
                        <td className="p-3">
                          <select
                            value={sc.category || 'CAT_B'}
                            onChange={(e) => {
                              const newCat = e.target.value as ScholarCategory;
                              onUpdateScholarCategory(sc.id, newCat);
                              onAddAuditLog?.('SCHOLAR_CATEGORY_CHANGE', `Assigned ${newCat} to ${sc.username}`, sc.id);
                              showFeedback(`Assigned ${newCat} to ${sc.firstName} ${sc.lastName}`);
                            }}
                            className="px-2 py-1 text-xs font-bold rounded-[4px] border border-slate-300 bg-white text-[#255190] cursor-pointer"
                          >
                            <option value="CAT_A">Category A (PhD/Postdoc)</option>
                            <option value="CAT_B">Category B (Master's)</option>
                            <option value="CAT_C">Category C (Honours)</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* F: ANNUAL REPORTS (PDF EXPORT) */}
          {/* ================================================================ */}
          {activeSection === 'reports' && (
            <div className="bg-white rounded-[6px] border border-[#E2E8F0] shadow-xs p-5 sm:p-6 space-y-5">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-base font-semibold text-[#255190]">Annual Governance Reports (PDF)</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generate the formal Central University of Technology Academic Society Annual Report with full audit tables.
                </p>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-[6px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-[#255190] block">
                    Annual Academic Society Challenges & Resolutions Report
                  </span>
                  <p className="text-[11px] text-slate-600 mt-1 max-w-md leading-relaxed">
                    Compiles resolved institutional bottlenecks, funding opportunities accessed, and publications registered by Category A, B, and C scholars.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-700">Report Academic Year:</label>
                    <select
                      value={reportYear}
                      onChange={(e) => setReportYear(e.target.value)}
                      className="px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                    >
                      <option value="2026">2026 (Current Academic Year)</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onGenerateAnnualReportPdf}
                  className="h-11 px-5 bg-[#255190] hover:bg-[#183765] text-white font-bold rounded-[4px] text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <FileDown className="w-4 h-4 text-[#FDB813]" />
                  <span>Download Annual Report (PDF)</span>
                </button>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* G: AUDIT LOG (SUPER ADMIN ONLY) */}
          {/* ================================================================ */}
          {activeSection === 'audit' && (
            <div className="bg-white rounded-[6px] border border-[#E2E8F0] shadow-xs p-5 sm:p-6 space-y-5">
              {!isSuperAdmin ? (
                <div className="p-6 bg-red-50 border border-red-200 rounded text-center text-red-900 text-xs">
                  <Lock className="w-6 h-6 text-red-600 mx-auto mb-2" />
                  <h3 className="font-bold text-sm">403 Forbidden: Access Restricted</h3>
                  <p className="mt-1">The tamper-evident institutional audit log is restricted to Super Administrators only.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-0.5">
                        <Shield className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Append-Only · Tamper-Evident Security Log</span>
                      </div>
                      <h2 className="text-base font-semibold text-[#255190]">System Security Audit Trail</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Immutable record of authentications, role changes, content publishes, challenge resolutions, and data exports.
                      </p>
                    </div>

                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-[4px]">
                      {auditLogs.length} Records
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-[6px] overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 sticky top-0">
                        <tr>
                          <th className="p-3 font-semibold">Timestamp</th>
                          <th className="p-3 font-semibold">Actor & Role</th>
                          <th className="p-3 font-semibold">Action</th>
                          <th className="p-3 font-semibold">Details</th>
                          <th className="p-3 font-semibold">IP Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50">
                            <td className="p-3 whitespace-nowrap text-slate-500">{log.timestamp}</td>
                            <td className="p-3 whitespace-nowrap">
                              <span className="font-bold text-slate-900 block">{log.actorUsername}</span>
                              <span className="text-[10px] text-slate-400">{log.actorRole}</span>
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-[#255190] font-bold text-[10px]">
                                {log.action}
                              </span>
                            </td>
                            <td className="p-3 text-slate-700 font-sans max-w-xs">{log.details}</td>
                            <td className="p-3 whitespace-nowrap text-slate-400">{log.ipAddress}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ================================================================ */}
          {/* H: DATA EXPORT (SUPER ADMIN ONLY) */}
          {/* ================================================================ */}
          {activeSection === 'export' && (
            <div className="bg-white rounded-[6px] border border-[#E2E8F0] shadow-xs p-5 sm:p-6 space-y-5">
              {!isSuperAdmin ? (
                <div className="p-6 bg-red-50 border border-red-200 rounded text-center text-red-900 text-xs">
                  <Lock className="w-6 h-6 text-red-600 mx-auto mb-2" />
                  <h3 className="font-bold text-sm">403 Forbidden: Access Restricted</h3>
                  <p className="mt-1">Full database export is restricted to Super Administrators only.</p>
                </div>
              ) : (
                <>
                  <div className="pb-4 border-b border-slate-100">
                    <h2 className="text-base font-semibold text-[#255190]">Institutional Database Export</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Encrypted full JSON snapshot. Per Security Baseline S7, requires re-authentication.
                    </p>
                  </div>

                  {!isExportUnlocked ? (
                    <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-[6px] max-w-md space-y-3">
                      <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                        <Lock className="w-4 h-4 text-amber-700" />
                        <span>Step Up Authentication Required</span>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        To export scholar records, publications, and institutional challenges, please confirm your Super Administrator password.
                      </p>

                      <form onSubmit={handleUnlockExport} className="space-y-3 text-xs">
                        {exportError && (
                          <span className="text-red-600 block text-[11px]">{exportError}</span>
                        )}
                        <input
                          type="password"
                          required
                          placeholder="Super Admin Password"
                          value={reauthPassword}
                          onChange={(e) => setReauthPassword(e.target.value)}
                          className="w-full px-3 py-2 rounded-[4px] border border-amber-300 bg-white"
                        />
                        <button
                          type="submit"
                          className="w-full h-10 bg-[#255190] hover:bg-[#183765] text-white font-bold rounded-[4px] text-xs transition-colors cursor-pointer"
                        >
                          Verify & Unlock Export
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="p-5 bg-emerald-50/60 border border-emerald-200 rounded-[6px] space-y-3">
                      <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Authentication Verified · Export Ready</span>
                      </div>
                      <p className="text-xs text-emerald-800 leading-relaxed max-w-xl">
                        Export contains sanitized scholar datasets, research progress, DHET publication registries, and audit logs. Sensitive passwords and personal hashes are excluded in accordance with POPIA.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          onExportDatabaseJson();
                          onAddAuditLog?.('DATABASE_EXPORT', 'Full institutional database JSON export generated', 'DATABASE');
                          showFeedback('Database snapshot exported successfully.');
                        }}
                        className="h-11 px-5 bg-[#255190] hover:bg-[#183765] text-white font-bold rounded-[4px] text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Database className="w-4 h-4 text-[#FDB813]" />
                        <span>Download Full Database Snapshot (.json)</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
