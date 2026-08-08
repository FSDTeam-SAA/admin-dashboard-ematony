import axiosInstance from "./axios";
import type {
  ApiResponse,
  ChangePasswordPayload,
  DashboardStats,
  Faq,
  FaqPayload,
  ForgotPasswordPayload,
  GroupDetailsResponse,
  PaginatedResponse,
  Payment,
  ResetPasswordPayload,
  SavingsGroup,
  SupportTicket,
  SitePage,
  SitePagePayload,
  TeamMember,
  TeamMemberPayload,
  Testimonial,
  TestimonialPayload,
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

// User profile
export const getProfileApi = () =>
  axiosInstance.get<ApiResponse<User>>("/user/profile");

export const updateProfileApi = (formData: FormData) =>
  axiosInstance.put<ApiResponse<User>>("/user/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

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

// FAQs
export const getFaqsApi = (page = 1, limit = 10, search = "") =>
  axiosInstance.get<PaginatedResponse<Faq>>("/admin/faqs", {
    params: {
      ...withPagination(page, limit),
      ...(search ? { search } : {}),
    },
  });

export const createFaqApi = (payload: FaqPayload) =>
  axiosInstance.post<ApiResponse<Faq>>("/admin/faqs", payload);

export const updateFaqApi = (id: string, payload: FaqPayload) =>
  axiosInstance.put<ApiResponse<Faq>>(`/admin/faqs/${id}`, payload);

export const deleteFaqApi = (id: string) =>
  axiosInstance.delete<ApiResponse<Faq>>(`/admin/faqs/${id}`);

// Website content
export const getSitePageApi = (slug: SitePage["slug"]) =>
  axiosInstance.get<ApiResponse<SitePage>>(`/admin/content/${slug}`);

export const updateSitePageApi = (slug: SitePage["slug"], payload: SitePagePayload) =>
  axiosInstance.put<ApiResponse<SitePage>>(`/admin/content/${slug}`, payload);

export const getTeamApi = () =>
  axiosInstance.get<ApiResponse<TeamMember[]>>("/admin/team");

export const createTeamMemberApi = (payload: TeamMemberPayload) =>
  axiosInstance.post<ApiResponse<TeamMember>>("/admin/team", payload);

export const updateTeamMemberApi = (id: string, payload: TeamMemberPayload) =>
  axiosInstance.put<ApiResponse<TeamMember>>(`/admin/team/${id}`, payload);

export const deleteTeamMemberApi = (id: string) =>
  axiosInstance.delete<ApiResponse<TeamMember>>(`/admin/team/${id}`);

export const getTestimonialsApi = () =>
  axiosInstance.get<ApiResponse<Testimonial[]>>("/admin/testimonials");

export const createTestimonialApi = (payload: TestimonialPayload) =>
  axiosInstance.post<ApiResponse<Testimonial>>("/admin/testimonials", payload);

export const updateTestimonialApi = (id: string, payload: TestimonialPayload) =>
  axiosInstance.put<ApiResponse<Testimonial>>(`/admin/testimonials/${id}`, payload);

export const deleteTestimonialApi = (id: string) =>
  axiosInstance.delete<ApiResponse<Testimonial>>(`/admin/testimonials/${id}`);
