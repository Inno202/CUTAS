import { api, downloadFile, resolveApiUrl } from './client';
import type {
  AdminOverview, AdminUser, AnnualReport, ApiUser, AuditLogItem, Award, Challenge, ChallengeStatus, ContentKey,
  DirectoryPage, DirectoryScholar, FundingOpportunity, GrowthSuggestion, InstitutionalContent, LandingData, Leader,
  MfaSetup, Paginated, Profile, Publication, ScholarCategory, StudyDetails, User, Workshop,
} from '../types';

/** Flattens the API's user + profile into the shape the pages use. */
export function toUser(u: ApiUser): User {
  const p = u.profile;
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    roleDisplay: u.roleDisplay,
    isActive: u.isActive,
    dateJoined: u.dateJoined,
    lastLogin: u.lastLogin,
    mfaEnabled: u.mfaEnabled,
    mfaRequired: u.mfaRequired,
    title: p?.title ?? '',
    category: p?.category ?? 'CAT_B',
    studentNumber: p?.studentNumber ?? '',
    faculty: p?.faculty ?? '',
    department: p?.department ?? '',
    bio: p?.bio ?? '',
    cvSummaryText: p?.cvSummaryText ?? '',
    phone: p?.phoneNumber ?? '',
    hasPicture: !!p?.hasPicture,
    pictureUrl: resolveApiUrl(p?.pictureUrl),
    hasCvFile: !!p?.hasCvFile,
    cvFileName: p?.cvFileName ?? null,
    notifyFunding: p?.notifyFunding ?? true,
    notifyWorkshops: p?.notifyWorkshops ?? true,
    notifyChallenges: p?.notifyChallenges ?? true,
  };
}

const withPicture = <T extends { pictureUrl: string | null }>(x: T): T => ({ ...x, pictureUrl: resolveApiUrl(x.pictureUrl) });

export type LoginResponse =
  | { mfaRequired?: false; access: string; user: ApiUser }
  | { mfaRequired: true; mfaSetup: boolean; mfaToken: string; secret?: string; otpauthUri?: string; qrSvg?: string };

export const authApi = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>('/auth/login/', { username, password }, { auth: false }),
  loginMfa: (mfaToken: string, code: string) =>
    api.post<{ access: string; user: ApiUser }>('/auth/login/mfa/', { mfaToken, code }, { auth: false }),
  logout: () => api.post<void>('/auth/logout/', {}, { auth: false }),
  register: (data: {
    username: string; email: string; firstName: string; lastName: string; password: string; password2: string;
    studentNumber: string; faculty: string; agreeTerms: boolean;
  }) => api.post<ApiUser>('/auth/register/', data, { auth: false }),
  me: () => api.get<ApiUser>('/auth/me/'),
  updateMe: (data: { firstName?: string; lastName?: string; email?: string; currentPassword?: string }) =>
    api.patch<ApiUser>('/auth/me/', data),
  deleteMe: (password: string, confirmation: string) => api.delete<void>('/auth/me/', { password, confirmation }),
  changePassword: (oldPassword: string, newPassword: string) =>
    api.post<{ detail: string }>('/auth/password/change/', { oldPassword, newPassword }),
  requestReset: (email: string) => api.post<{ detail: string }>('/auth/password/reset/', { email }, { auth: false }),
  confirmReset: (uid: string, token: string, newPassword: string) =>
    api.post<{ detail: string }>('/auth/password/reset/confirm/', { uid, token, newPassword }, { auth: false }),
  mfaStatus: () => api.get<{ enabled: boolean; required: boolean; enabledAt: string | null }>('/auth/mfa/'),
  mfaSetup: (password: string) => api.post<MfaSetup>('/auth/mfa/setup/', { password }),
  mfaConfirm: (code: string) => api.post<{ enabled: boolean }>('/auth/mfa/confirm/', { code }),
  mfaDisable: (password: string, code: string) => api.post<{ enabled: boolean }>('/auth/mfa/disable/', { password, code }),
};

export const publicApi = {
  landing: () => api.get<LandingData>('/landing/').then((d) => d),
  leaders: () => api.get<Leader[]>('/leaders/').then((rows) => rows.map(withPicture)),
  content: (key: ContentKey) => api.get<InstitutionalContent>(`/content/${key}/`),
  funding: () => api.get<FundingOpportunity[]>('/funding/'),
  workshops: (when: 'upcoming' | 'past' | 'all' = 'upcoming') =>
    api.get<Workshop[]>('/workshops/', when === 'all' ? undefined : { when }),
};

export const profileApi = {
  get: () => api.get<Profile>('/profile/me/'),
  update: (data: Partial<Omit<Profile, 'pictureUrl' | 'hasPicture' | 'hasCvFile' | 'updatedAt' | 'category'>> & {
    removePicture?: boolean; removeCv?: boolean;
  }) => api.patch<Profile>('/profile/me/', data),
  upload: (field: 'profile_picture' | 'cv_file', file: File) => {
    const fd = new FormData();
    fd.append(field, file);
    return api.patch<Profile>('/profile/me/', fd);
  },
  downloadCv: (name: string) => downloadFile('GET', '/profile/me/cv-file/', name),
};

export const directoryApi = {
  list: (params: { category?: ScholarCategory | ''; search?: string; page?: number; pageSize?: number }) =>
    api.get<DirectoryPage>('/scholars/', params).then((d) => ({ ...d, results: d.results.map(withPicture) })),
  get: (id: number) => api.get<DirectoryScholar>(`/scholars/${id}/`).then(withPicture),
};

export const studyApi = {
  get: () => api.get<StudyDetails>('/study/me/'),
  update: (data: Partial<StudyDetails>) => api.patch<StudyDetails>('/study/me/', data),
  pdf: () => downloadFile('GET', '/study/me/pdf/', 'CUTAS_Study_Details.pdf'),
};

function ownedResource<T extends { id: number }>(path: string, pdfName: string) {
  return {
    list: () => api.get<T[]>(`/${path}/`),
    create: (data: Partial<T>) => api.post<T>(`/${path}/`, data),
    update: (id: number, data: Partial<T>) => api.patch<T>(`/${path}/${id}/`, data),
    remove: (id: number) => api.delete<void>(`/${path}/${id}/`),
    pdf: () => downloadFile('GET', `/${path}/pdf/`, pdfName),
  };
}

export const publicationsApi = ownedResource<Publication>('publications', 'CUTAS_Publications.pdf');
export const growthApi = ownedResource<GrowthSuggestion>('growth', 'CUTAS_Growth_Plan.pdf');
export const awardsApi = ownedResource<Award>('awards', 'CUTAS_Awards.pdf');

export const challengesApi = {
  list: () => api.get<Challenge[]>('/challenges/'),
  create: (data: Pick<Challenge, 'category' | 'title' | 'description'>) => api.post<Challenge>('/challenges/', data),
  pdf: () => downloadFile('GET', '/challenges/pdf/', 'CUTAS_Challenges.pdf'),
};

function adminResource<T extends { id: number }>(path: string) {
  return {
    list: () => api.get<T[]>(`/${path}/`),
    create: (data: Partial<T>) => api.post<T>(`/${path}/`, data),
    update: (id: number, data: Partial<T>) => api.patch<T>(`/${path}/${id}/`, data),
    remove: (id: number) => api.delete<void>(`/${path}/${id}/`),
  };
}

export const adminApi = {
  overview: () => api.get<AdminOverview>('/admin/overview/'),
  funding: adminResource<FundingOpportunity>('funding'),
  workshops: adminResource<Workshop>('workshops'),
  saveContent: (key: ContentKey, data: Pick<InstitutionalContent, 'title' | 'headline' | 'body' | 'status'>) =>
    api.put<InstitutionalContent>(`/content/${key}/`, data),
  challenges: (params: { status?: ChallengeStatus | ''; category?: string; search?: string; page?: number }) =>
    api.get<Paginated<Challenge>>('/admin/challenges/', params),
  reviewChallenge: (id: number, data: { status: ChallengeStatus; resolutionNotes: string }) =>
    api.patch<Challenge>(`/admin/challenges/${id}/review/`, data),
  setCategory: (userId: number, category: ScholarCategory) =>
    api.patch<{ id: number; category: ScholarCategory }>(`/admin/scholars/${userId}/category/`, { category }),
  growth: (params: { state?: 'awaiting' | 'completed' | ''; search?: string; page?: number }) =>
    api.get<Paginated<GrowthSuggestion>>('/admin/growth/', params),
  mentorNote: (id: number, mentorNotes: string) =>
    api.patch<{ mentorNotes: string }>(`/admin/growth/${id}/mentor-note/`, { mentorNotes }),
  annualReport: (year: number) => api.get<AnnualReport>('/admin/reports/annual/', { year }),
  annualReportPdf: (year: number) =>
    downloadFile('GET', '/admin/reports/annual/pdf/', `CUTAS_Annual_Report_${year}.pdf`, { query: { year } }),
  annualReportCsv: (year: number) =>
    downloadFile('GET', '/admin/reports/annual/csv/', `CUTAS_Challenges_${year}.csv`, { query: { year } }),
  auditLogs: (params: { action?: string; actor?: string; search?: string; since?: string; until?: string; page?: number }) =>
    api.get<Paginated<AuditLogItem>>('/admin/audit-logs/', params),
  exportData: (password: string, code: string) =>
    downloadFile('POST', '/admin/export/', 'CUTAS_Export.json', { body: { password, code } }),
  users: (params: { search?: string; role?: string; active?: string; page?: number }) =>
    api.get<Paginated<AdminUser>>('/admin/users/', params),
  createUser: (data: Partial<AdminUser> & { password: string }) => api.post<AdminUser>('/admin/users/', data),
  updateUser: (id: number, data: Partial<AdminUser> & { password?: string }) => api.patch<AdminUser>(`/admin/users/${id}/`, data),
  resetUserMfa: (id: number) => api.post<AdminUser>(`/admin/users/${id}/reset-mfa/`),
};
