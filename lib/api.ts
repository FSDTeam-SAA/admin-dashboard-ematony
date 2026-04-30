import axiosInstance from "./axios";
import type {
  ApiResponse,
  ChangePasswordPayload,
  DashboardStats,
  ForgotPasswordPayload,
  GroupDetailsResponse,
  PaginatedResponse,
  Payment,
  ResetPasswordPayload,
  SavingsGroup,
  SupportTicket,
  User,
} from "@/types";

const withPagination = (page = 1, limit = 10) => ({ page, limit });

// Auth
export const forgotPasswordApi = (data: ForgotPasswordPayload) =>
  axiosInstance.post("/auth/forgot-password", data);

export const resetPasswordApi = (data: ResetPasswordPayload) =>
  axiosInstance.post("/auth/reset-password", data);

export const changePasswordApi = (data: ChangePasswordPayload) =>
  axiosInstance.post("/auth/change-password", data);

// Dashboard
export const getDashboardStatsApi = () =>
  axiosInstance.get<ApiResponse<DashboardStats>>("/admin/dashboard/stats");

// Users
export const getUsersApi = (
  page = 1,
  limit = 10,
  search = "",
  filters?: { role?: string; status?: string }
) =>
  axiosInstance.get<PaginatedResponse<User>>("/admin/users", {
    params: {
      ...withPagination(page, limit),
      ...(search ? { search } : {}),
      ...(filters?.role ? { role: filters.role } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
    },
  });

export const blockUserApi = (id: string) =>
  axiosInstance.patch<ApiResponse<User>>(`/admin/users/${id}/block`);

// Transactions
export const getPaymentsApi = (
  page = 1,
  limit = 10,
  filters?: { status?: string; type?: string; userId?: string; groupId?: string }
) =>
  axiosInstance.get<PaginatedResponse<Payment>>("/admin/transactions", {
    params: {
      ...withPagination(page, limit),
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.type ? { type: filters.type } : {}),
      ...(filters?.userId ? { userId: filters.userId } : {}),
      ...(filters?.groupId ? { groupId: filters.groupId } : {}),
    },
  });

// Groups
export const getGroupsApi = (page = 1, limit = 10, search = "", status = "") =>
  axiosInstance.get<PaginatedResponse<SavingsGroup>>("/admin/groups", {
    params: {
      ...withPagination(page, limit),
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
    },
  });

export const getGroupByIdApi = (id: string) =>
  axiosInstance.get<ApiResponse<GroupDetailsResponse>>(`/admin/groups/${id}`);

export const updateGroupStatusApi = (id: string, status: string) =>
  axiosInstance.patch<ApiResponse<SavingsGroup>>(`/admin/groups/${id}/status`, {
    status,
  });

// Issues
export const getIssuesApi = (
  page = 1,
  limit = 10,
  filters?: {
    status?: string;
    category?: string;
    priority?: string;
    search?: string;
  }
) =>
  axiosInstance.get<PaginatedResponse<SupportTicket>>("/admin/issues", {
    params: {
      ...withPagination(page, limit),
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.category ? { category: filters.category } : {}),
      ...(filters?.priority ? { priority: filters.priority } : {}),
      ...(filters?.search ? { search: filters.search } : {}),
    },
  });

export const updateIssueStatusApi = (
  id: string,
  payload: { status: string; priority?: string }
) =>
  axiosInstance.patch<ApiResponse<SupportTicket>>(
    `/admin/issues/${id}/status`,
    payload
  );
