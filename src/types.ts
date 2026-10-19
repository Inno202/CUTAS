export type UserRole = 'SCHOLAR' | 'ADMINISTRATOR' | 'SUPER_ADMIN';

export type ScholarCategory = 'CAT_A' | 'CAT_B' | 'CAT_C';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  title: string;
  category?: ScholarCategory;
  faculty: string;
  department: string;
  studentNumber: string;
  phone?: string;
  bio: string;
  cvSummaryText: string;
}

export interface StudyDetails {
  userId: string;
  programme: string;
  university: string;
  yearOfStarting: number;
  anticipatedYearOfCompletion: number;
  supervisor: string;
  coSupervisor?: string;
  funding: string;
  researchTopic: string;
  researchAbstract: string;
}

export type PublicationType = 'ARTICLE' | 'BOOK_CHAPTER' | 'CONFERENCE';
export type PublicationStatus = 'PUBLISHED' | 'ACCEPTED' | 'UNDER_REVIEW';

export interface Publication {
  id: string;
  userId: string;
  publicationType: PublicationType;
  title: string;
  authors: string;
  outletName: string;
  year: number;
  volumeIssuePages?: string;
  doiOrUrl?: string;
  status: PublicationStatus;
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
  id: string;
  userId: string;
  scholarName: string;
  scholarCategory: ScholarCategory;
  category: ChallengeCategory;
  title: string;
  description: string;
  status: ChallengeStatus;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export type GrowthCompetency = 
  | 'WRITING' 
  | 'GRANTS' 
  | 'ANALYTICS' 
  | 'NETWORKING' 
  | 'PEDAGOGY' 
  | 'CAREER';

export interface GrowthSuggestion {
  id: string;
  userId: string;
  area: GrowthCompetency;
  growthObjective: string;
  milestoneActions: string;
  targetQuarter: string;
  mentorNotes?: string;
  isCompleted: boolean;
}

export interface FundingOpportunity {
  id: string;
  title: string;
  funder: string;
  amountRange: string;
  deadline: string;
  eligibility: string;
  applicationProcess: string;
  portalUrl: string;
  featuredOnLanding: boolean;
  isActive: boolean;
  status?: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string;
}

export interface Award {
  id: string;
  userId: string;
  title: string;
  awardingBody: string;
  year: number;
  description: string;
}

export interface Workshop {
  id: string;
  title: string;
  facilitator: string;
  eventDate: string;
  eventTime: string;
  venueOrLink: string;
  description: string;
  category: string;
  status?: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string;
}

export interface InstitutionalContent {
  key: 'about_us' | 'project_leaders' | 'landing_intro';
  title: string;
  headline: string;
  body: string;
  updatedAt: string;
  status?: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  actorUsername: string;
  actorRole: string;
  targetObject?: string;
  details: string;
  ipAddress: string;
  timestamp: string;
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
  | 'django_code'
  | 'login'
  | 'register'
  | 'forgot_password'
  | 'reset_password'
  | 'profile';
