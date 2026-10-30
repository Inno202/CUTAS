// Shapes of the data the CUTAS API returns (keys are converted from snake_case to camelCase
// by the API client, see src/api/client.ts).

export type UserRole = 'SCHOLAR' | 'ADMIN' | 'SUPERADMIN';
export type ScholarCategory = 'CAT_A' | 'CAT_B' | 'CAT_C';
export type PublishStatus = 'DRAFT' | 'PUBLISHED';

/** Signed-in user (account + profile flattened into one object). */
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  roleDisplay: string;
  isActive: boolean;
  dateJoined: string;
  lastLogin: string | null;
  mfaEnabled: boolean;
  mfaRequired: boolean;
  title: string;
  category: ScholarCategory;
  studentNumber: string;
  faculty: string;
  department: string;
  bio: string;
  cvSummaryText: string;
  phone: string;
  hasPicture: boolean;
  pictureUrl: string | null;
  hasCvFile: boolean;
  cvFileName: string | null;
  notifyFunding: boolean;
  notifyWorkshops: boolean;
  notifyChallenges: boolean;
}

export interface Profile {
  title: string;
  category: ScholarCategory;
  studentNumber: string;
  faculty: string;
  department: string;
  bio: string;
  cvSummaryText: string;
  phoneNumber: string;
  hasPicture: boolean;
  hasCvFile: boolean;
  pictureUrl: string | null;
  cvFileName: string | null;
  notifyFunding: boolean;
  notifyWorkshops: boolean;
  notifyChallenges: boolean;
  updatedAt: string;
}

export interface ApiUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  roleDisplay: string;
  isActive: boolean;
  dateJoined: string;
  lastLogin: string | null;
  mfaEnabled: boolean;
  mfaRequired: boolean;
  profile: Profile | null;
}

export interface DirectoryScholar {
  id: number;
  name: string;
  title: string;
  category: ScholarCategory;
  faculty: string;
  department: string;
  bio: string;
  cvSummaryText: string;
  pictureUrl: string | null;
  // admins only
  studentNumber?: string;
  email?: string;
  username?: string;
}

export interface Leader {
  id: number;
  name: string;
  title: string;
  role: UserRole;
  roleDisplay: string;
  email: string;
  faculty: string;
  department: string;
  bio: string;
  pictureUrl: string | null;
}

export interface StudyDetails {
  programme: string;
  university: string;
  yearOfStarting: number;
  anticipatedYearOfCompletion: number;
  supervisor: string;
  coSupervisor: string;
  funding: string;
  researchTopic: string;
  researchAbstract: string;
  updatedAt?: string;
}

export type PublicationType = 'ARTICLE' | 'BOOK_CHAPTER' | 'CONFERENCE';
export type PublicationStatus = 'PUBLISHED' | 'ACCEPTED' | 'UNDER_REVIEW';

export interface Publication {
  id: number;
  publicationType: PublicationType;
  title: string;
  authors: string;
  outletName: string;
  year: number;
  volumeIssuePages: string;
  doiOrUrl: string;
  status: PublicationStatus;
  createdAt?: string;
}

export type ChallengeCategory =
  | 'FUNDING'
  | 'TURNITIN'
  | 'WRITING'
  | 'SUPERVISION'
  | 'LAB_ACCESS'
  | 'ETHICS'
  | 'DATA_ANALYSIS'
  | 'OTHER';

export type ChallengeStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED';

export interface Challenge {
  id: number;
  category: ChallengeCategory;
  title: string;
  description: string;
  status: ChallengeStatus;
  resolutionNotes: string;
  resolvedByName: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  scholarName: string;
  scholarCategory: ScholarCategory | null;
  // admin queue only
  scholarUsername?: string;
  scholarEmail?: string;
}

export type GrowthCompetency = 'WRITING' | 'GRANTS' | 'ANALYTICS' | 'NETWORKING' | 'PEDAGOGY' | 'CAREER';

export interface GrowthSuggestion {
  id: number;
  area: GrowthCompetency;
  growthObjective: string;
  milestoneActions: string;
  targetQuarter: string;
  mentorNotes: string;
  isCompleted: boolean;
  createdAt?: string;
  // admin list only
  scholarName?: string;
  scholarCategory?: ScholarCategory | null;
}

export interface FundingOpportunity {
  id: number;
  title: string;
  funder: string;
  amountRange: string;
  deadline: string;
  eligibility: string;
  applicationProcess: string;
  portalUrl: string;
  featuredOnLanding: boolean;
  isActive: boolean;
  status: PublishStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Award {
  id: number;
  title: string;
  awardingBody: string;
  year: number;
  description: string;
}

export interface Workshop {
  id: number;
  title: string;
  facilitator: string;
  eventDate: string;
  eventTime: string;
  endTime: string | null;
  venueOrLink: string;
  description: string;
  category: string;
  status: PublishStatus;
}

export type ContentKey = 'about_us' | 'project_leaders' | 'landing_intro';

export interface InstitutionalContent {
  key: ContentKey;
  title: string;
  headline: string;
  body: string;
  status: PublishStatus;
  updatedAt: string;
}

export interface AuditLogItem {
  id: number;
  action: string;
  actorUsername: string;
  actorRole: string;
  targetObject: string;
  details: string;
  ipAddress: string | null;
  timestamp: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  roleDisplay: string;
  isActive: boolean;
  mfaEnabled: boolean;
  lastLogin: string | null;
  dateJoined: string;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DirectoryPage extends Paginated<DirectoryScholar> {
  counts: Record<ScholarCategory | 'ALL', number>;
}

export interface LandingData {
  society: string;
  theme: string;
  intro: InstitutionalContent | null;
  stats: { scholars: number; publications: number; resolvedChallenges: number; activeFundingCalls: number };
  featuredFunding: FundingOpportunity[];
  upcomingWorkshops: Workshop[];
}

export interface AdminOverview {
  challenges: { open: number; inReview: number; resolved: number; total: number };
  scholars: Record<ScholarCategory, number> & { total: number };
  funding: { total: number; published: number; drafts: number };
  workshops: { total: number; upcoming: number; drafts: number };
  growth: { total: number; awaitingFeedback: number };
  users?: { total: number; admins: number; inactive: number };
}

export interface AnnualReport {
  year: number;
  total: number;
  totals: { total: number; open: number; inReview: number; resolved: number; resolutionRate: number; averageDaysToResolve: number | null };
  breakdown: { category: ChallengeCategory; label: string; total: number; open: number; inReview: number; resolved: number; resolutionRate: number }[];
  resolvedItems: { id: number; category: string; title: string; scholar: string; scholarCategory: ScholarCategory | null; resolutionNotes: string; resolvedAt: string; resolvedBy: string | null; daysToResolve: number | null }[];
}

export interface MfaSetup {
  secret: string;
  otpauthUri: string;
  qrSvg: string;
}

export type TabId =
  | 'landing'
  | 'about'
  | 'leaders'
  | 'scholars'
  | 'studies'
  | 'publications'
  | 'challenges'
  | 'growth'
  | 'funding'
  | 'awards'
  | 'workshops'
  | 'admin_dashboard'
  | 'login'
  | 'register'
  | 'forgot_password'
  | 'reset_password'
  | 'profile'
  | 'not_found';
