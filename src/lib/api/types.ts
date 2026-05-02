export type UserStatus = "active" | "inactive" | "deleted";

export type CvSourceType = "created" | "improved" | "mixed";

export type CvVersionType = "created" | "improved" | "manual_edit";

export type CreatedByProcess = "manual" | "ai";

export type GeneratedFileFormat = "pdf" | "docx";

export type CvStylePreset = "ats" | "harvard" | "moderno";

export type CvImprovementRequestStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface ApiUser {
  id: string;
  fullName: string;
  email: string;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: ApiUser;
}

export interface UserSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  autoSaveHistory: boolean;
  defaultLanguage: string;
  createdAt: string;
  updatedAt: string;
}

export interface CvPersonalDetail {
  id: string;
  cvVersionId: string;
  fullName: string;
  email: string;
  phone: string | null;
  location: string | null;
  professionalSummary: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SkillItem {
  id: string;
  name: string;
  normalizedName: string;
  category: string | null;
  createdAt: string;
}

export interface CvVersionSkillItem {
  id: string;
  cvVersionId: string;
  skillId: string;
  displayOrder: number;
  skill: SkillItem | null;
}

export interface CvWorkExperience {
  id: string;
  cvVersionId: string;
  companyName: string;
  jobTitle: string;
  periodLabel: string;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CvEducationEntry {
  id: string;
  cvVersionId: string;
  institutionName: string;
  degreeTitle: string;
  periodLabel: string;
  startDate: string | null;
  endDate: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CvVersionSummary {
  id: string;
  cvId: string;
  versionNumber: number;
  versionType: CvVersionType;
  targetRole: string;
  stylePreset: CvStylePreset;
  isCurrent: boolean;
  createdByProcess: CreatedByProcess;
  generatedFileUrl: string | null;
  generatedFileFormat: GeneratedFileFormat | null;
  createdAt: string;
  updatedAt: string;
}

export interface CvVersionDetail extends CvVersionSummary {
  jobDescription: string | null;
  summaryText: string | null;
  skillsText: string | null;
  personalDetail: CvPersonalDetail | null;
  workExperiences: CvWorkExperience[];
  educationEntries: CvEducationEntry[];
  skills: CvVersionSkillItem[];
}

export interface CvListItem {
  id: string;
  userId: string;
  title: string | null;
  targetRole: string;
  sourceType: CvSourceType;
  currentVersionId: string | null;
  isArchived: boolean;
  versionsCount: number;
  currentVersion: CvVersionSummary | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CvDetail extends Omit<CvListItem, "currentVersion"> {
  currentVersion: CvVersionDetail | null;
  versions: CvVersionDetail[];
}

export interface CvHistoryResponse {
  cvId: string;
  title: string | null;
  targetRole: string;
  versions: CvVersionSummary[];
}

export interface UploadedFileRecord {
  id: string;
  userId: string;
  originalName: string;
  storagePath: string;
  mimeType: string;
  fileExtension: string;
  fileSizeBytes: number;
  checksum: string | null;
  createdAt: string;
}

export interface ImprovementRequestSummary {
  id: string;
  userId: string;
  cvId: string | null;
  uploadedFileId: string;
  targetRole: string;
  jobDescription: string | null;
  status: CvImprovementRequestStatus;
  errorMessage: string | null;
  resultCvVersionId: string | null;
  cv: {
    id: string;
    title: string | null;
    targetRole: string;
    currentVersionId: string | null;
    isArchived: boolean;
  } | null;
  uploadedFile: {
    id: string;
    originalName: string;
    mimeType: string;
    fileExtension: string;
    fileSizeBytes: number;
    storagePath: string;
    createdAt: string;
  } | null;
  resultCvVersion: {
    id: string;
    versionNumber: number;
    versionType: CvVersionType;
    targetRole: string;
    isCurrent: boolean;
    createdAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalCvs: number;
  totalVersions: number;
  totalCreatedVersions: number;
  totalImprovedVersions: number;
  lastActivityAt: string | null;
}

export interface ReportByRoleItem {
  targetRole: string;
  totalVersions: number;
}

export interface ReportByVersionTypeItem {
  versionType: CvVersionType;
  totalVersions: number;
}

export interface MonthlyReportItem {
  reportYear: number;
  reportMonth: number;
  totalVersions: number;
}

export interface CvActivityReportPayload {
  totalCvs: number;
  activeCvs: number;
  archivedCvs: number;
  totalVersions: number;
  createdVersions: number;
  improvedVersions: number;
  manualEditVersions: number;
  aiGeneratedVersions: number;
  manualVersions: number;
  lastActivityAt: string | null;
  topTargetRoles: ReportByRoleItem[];
  versionsByType: ReportByVersionTypeItem[];
  monthlyVersions: MonthlyReportItem[];
}

export interface ReportSnapshot {
  id: string;
  userId: string;
  reportType: string;
  reportPeriod: string | null;
  payload: unknown;
  generatedAt: string;
}

export interface CvActivityReportSnapshot extends ReportSnapshot {
  reportType: "cv_activity_summary";
  payload: CvActivityReportPayload;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  email?: string;
}

export interface UpdateSettingsPayload {
  emailNotifications?: boolean;
  autoSaveHistory?: boolean;
  defaultLanguage?: string;
}

export interface CreateCvPayload {
  title?: string;
  targetRole: string;
  sourceType?: CvSourceType;
  stylePreset?: CvStylePreset;
  jobDescription?: string;
  personalDetails: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    professionalSummary?: string;
  };
  workExperiences?: Array<{
    companyName: string;
    jobTitle: string;
    periodLabel: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
  }>;
  educationEntries?: Array<{
    institutionName: string;
    degreeTitle: string;
    periodLabel: string;
    startDate?: string;
    endDate?: string;
  }>;
  skills?: string[];
  skillsText?: string;
}

export interface GenerateCvFromFormPayload extends CreateCvPayload {
  generationInstructions?: string;
}

export interface UpdateManualCvVersionPayload {
  title?: string;
  targetRole?: string;
  jobDescription?: string;
  summaryText?: string;
  skillsText?: string;
  stylePreset?: CvStylePreset;
  personalDetails?: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    professionalSummary?: string;
  };
  workExperiences?: Array<{
    companyName: string;
    jobTitle: string;
    periodLabel: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
  }>;
  educationEntries?: Array<{
    institutionName: string;
    degreeTitle: string;
    periodLabel: string;
    startDate?: string;
    endDate?: string;
  }>;
  skills?: string[];
}

export interface CreateImprovedCvVersionPayload {
  targetRole: string;
  jobDescription?: string;
  summaryText?: string;
  skillsText?: string;
  stylePreset?: CvStylePreset;
  generatedFileUrl?: string;
  generatedFileFormat?: GeneratedFileFormat;
  createdByProcess?: CreatedByProcess;
  improvementRequestId?: string;
  skills?: string[];
}

export interface CreateUploadedFilePayload {
  originalName: string;
  storagePath: string;
  mimeType: string;
  fileExtension: string;
  fileSizeBytes: number;
  checksum?: string;
}

export interface CreateImprovementRequestPayload {
  cvId?: string;
  uploadedFileId: string;
  targetRole: string;
  jobDescription?: string;
}

export interface UpdateImprovementRequestPayload {
  status?: CvImprovementRequestStatus;
  errorMessage?: string;
  resultCvVersionId?: string;
}

export interface CreateReportSnapshotPayload {
  reportType: string;
  reportPeriod?: string;
}

export interface StoredAuthSession {
  accessToken: string;
  user: ApiUser;
}