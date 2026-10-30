import type {
  ChallengeCategory, ChallengeStatus, GrowthCompetency, PublicationStatus, PublicationType, ScholarCategory, UserRole,
} from './types';

// These values must match the backend exactly (cutas_app/models.py and api/serializers.py).
export const FACULTIES: { value: string; label: string }[] = [
  { value: 'Faculty of Engineering, Built Environment & Information Technology', label: 'Engineering, Built Environment & IT' },
  { value: 'Faculty of Health & Environmental Sciences', label: 'Health & Environmental Sciences' },
  { value: 'Faculty of Management Sciences', label: 'Management Sciences' },
  { value: 'Faculty of Humanities', label: 'Humanities' },
];

export const TITLES = ['', 'Dr.', 'Prof.', 'Mr.', 'Ms.', 'Mrs.', 'Mx.'];

export const CATEGORY_LABELS: Record<ScholarCategory, string> = {
  CAT_A: 'Category A',
  CAT_B: 'Category B',
  CAT_C: 'Category C',
};

export const CATEGORY_DESCRIPTIONS: Record<ScholarCategory, string> = {
  CAT_A: 'Doctoral Candidates & Senior Fellows',
  CAT_B: 'Master’s Scholars & Researchers',
  CAT_C: 'Honours & Early Postgrads',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  SCHOLAR: 'Scholar',
  ADMIN: 'Administrator',
  SUPERADMIN: 'Super Administrator',
};

export const CHALLENGE_CATEGORIES: { value: ChallengeCategory; label: string }[] = [
  { value: 'FUNDING', label: 'Funding & Bursary Disbursements' },
  { value: 'TURNITIN', label: 'Turnitin / Plagiarism Similarity' },
  { value: 'WRITING', label: 'Academic Writing & Thesis Structure' },
  { value: 'SUPERVISION', label: 'Supervision & Advisory Support' },
  { value: 'LAB_ACCESS', label: 'Laboratory Access & Equipment' },
  { value: 'ETHICS', label: 'Faculty Ethics Board Clearance' },
  { value: 'DATA_ANALYSIS', label: 'Methodology & Statistical Software' },
  { value: 'OTHER', label: 'Other Academic Roadblock' },
];

export const CHALLENGE_STATUS_LABELS: Record<ChallengeStatus, string> = {
  OPEN: 'Open',
  IN_REVIEW: 'In Review',
  RESOLVED: 'Resolved',
};

export const COMPETENCY_LABELS: Record<GrowthCompetency, string> = {
  WRITING: 'High-Impact Academic Writing',
  GRANTS: 'Competitive Grant & NRF Proposal Drafting',
  ANALYTICS: 'Data Analytics & Quantitative Modeling',
  NETWORKING: 'International Scholarly Dissemination',
  PEDAGOGY: 'Undergraduate Tutoring & Pedagogy',
  CAREER: 'Postdoctoral & Industry Placement',
};

export const PUBLICATION_TYPE_LABELS: Record<PublicationType, string> = {
  ARTICLE: 'Peer-Reviewed Journal Article',
  BOOK_CHAPTER: 'Book Chapter',
  CONFERENCE: 'Conference Proceeding',
};

export const PUBLICATION_STATUS_LABELS: Record<PublicationStatus, string> = {
  PUBLISHED: 'Published',
  ACCEPTED: 'Accepted / In Press',
  UNDER_REVIEW: 'Submitted / Under Review',
};

export const SOCIETY_THEME =
  'Bringing back intellectualism within the corridors of Higher Education: Creating a new generation of thinkers in UoTs';
