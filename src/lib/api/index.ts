import { apiRequest } from "./client";
import type {
  AuthResponse,
  CreateCvPayload,
  CreateImprovementRequestPayload,
  CreateImprovedCvVersionPayload,
  CreateReportSnapshotPayload,
  CreateUploadedFilePayload,
  CvDetail,
  CvHistoryResponse,
  CvListItem,
  CvActivityReportSnapshot,
  DashboardSummary,
  GenerateCvFromFormPayload,
  ImprovementRequestSummary,
  LoginPayload,
  MonthlyReportItem,
  RegisterPayload,
  ReportByRoleItem,
  ReportByVersionTypeItem,
  ReportSnapshot,
  UpdateImprovementRequestPayload,
  UpdateManualCvVersionPayload,
  UpdateProfilePayload,
  UpdateSettingsPayload,
  UploadedFileRecord,
  UserSettings,
  ApiUser,
} from "./types";

export const authApi = {
  login: (payload: LoginPayload) =>
    apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: payload,
      skipAuth: true,
    }),
  register: (payload: RegisterPayload) =>
    apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: payload,
      skipAuth: true,
    }),
  me: () => apiRequest<ApiUser>("/auth/me"),
};

export const usersApi = {
  getProfile: () => apiRequest<ApiUser>("/users/me/profile"),
  updateProfile: (payload: UpdateProfilePayload) =>
    apiRequest<ApiUser>("/users/me/profile", {
      method: "PATCH",
      body: payload,
    }),
  getSettings: () => apiRequest<UserSettings>("/users/me/settings"),
  updateSettings: (payload: UpdateSettingsPayload) =>
    apiRequest<UserSettings>("/users/me/settings", {
      method: "PATCH",
      body: payload,
    }),
};

export const cvsApi = {
  list: () => apiRequest<CvListItem[]>("/cvs"),
  create: (payload: CreateCvPayload) =>
    apiRequest<CvDetail>("/cvs", {
      method: "POST",
      body: payload,
    }),
  generateFromForm: (payload: GenerateCvFromFormPayload) =>
    apiRequest<CvDetail>("/cvs/generate-from-form", {
      method: "POST",
      body: payload,
    }),
  getOne: (cvId: string) => apiRequest<CvDetail>(`/cvs/${cvId}`),
  getHistory: (cvId: string) =>
    apiRequest<CvHistoryResponse>(`/cvs/${cvId}/history`),
  updateArchiveState: (cvId: string, isArchived: boolean) =>
    apiRequest<CvListItem>(`/cvs/${cvId}/archive`, {
      method: "PATCH",
      body: { isArchived },
    }),
  createImprovedVersion: (
    cvId: string,
    payload: CreateImprovedCvVersionPayload,
  ) =>
    apiRequest<CvDetail>(`/cvs/${cvId}/versions/improved`, {
      method: "POST",
      body: payload,
    }),
  createManualEditedVersion: (
    cvId: string,
    payload: UpdateManualCvVersionPayload,
  ) =>
    apiRequest<CvDetail>(`/cvs/${cvId}/versions/manual-edit`, {
      method: "POST",
      body: payload,
    }),
};

export const filesApi = {
  list: () => apiRequest<UploadedFileRecord[]>("/files"),
  create: (payload: CreateUploadedFilePayload) =>
    apiRequest<UploadedFileRecord>("/files", {
      method: "POST",
      body: payload,
    }),
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return apiRequest<UploadedFileRecord>("/files/upload", {
      method: "POST",
      body: formData,
    });
  },
};

export const improvementsApi = {
  list: () => apiRequest<ImprovementRequestSummary[]>("/improvement-requests"),
  create: (payload: CreateImprovementRequestPayload) =>
    apiRequest<ImprovementRequestSummary>("/improvement-requests", {
      method: "POST",
      body: payload,
    }),
  process: (requestId: string) =>
    apiRequest<CvDetail>(`/improvement-requests/${requestId}/process`, {
      method: "POST",
    }),
  update: (requestId: string, payload: UpdateImprovementRequestPayload) =>
    apiRequest<ImprovementRequestSummary>(`/improvement-requests/${requestId}`, {
      method: "PATCH",
      body: payload,
    }),
};

export const reportsApi = {
  getDashboardSummary: () =>
    apiRequest<DashboardSummary>("/reports/dashboard-summary"),
  getByRole: () => apiRequest<ReportByRoleItem[]>("/reports/by-role"),
  getByVersionType: () =>
    apiRequest<ReportByVersionTypeItem[]>("/reports/by-version-type"),
  getMonthly: () => apiRequest<MonthlyReportItem[]>("/reports/monthly"),
  listSnapshots: () => apiRequest<ReportSnapshot[]>("/reports/snapshots"),
  createSnapshot: (payload: CreateReportSnapshotPayload) =>
    apiRequest<ReportSnapshot>("/reports/snapshots", {
      method: "POST",
      body: payload,
    }),
  createDatabaseSnapshot: () =>
    apiRequest<CvActivityReportSnapshot>("/reports/snapshots/database", {
      method: "POST",
    }),
};