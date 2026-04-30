export type UserRole = "user" | "admin" | "storeman";

export interface User {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: { public_id?: string; url?: string };
  isVerified?: boolean;
  isBlocked?: boolean;
  country?: string;
  language?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalPayments: number;
  totalRevenue: number;
  activeGroups: number;
}

export type PaymentStatus =
  | "complete"
  | "pending"
  | "failed"
  | "initiated"
  | "succeeded"
  | "refunded";

export type PaymentType =
  | "donation"
  | "order"
  | "wallet_topup"
  | "group_contribution"
  | "payout"
  | "refund"
  | "adjustment";

export interface Payment {
  _id: string;
  userId: string | User;
  groupId?: string | SavingsGroup | null;
  price: number;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  paymentMethod?: string;
  referenceCode?: string;
  type: PaymentType;
  createdAt: string;
  updatedAt: string;
}

export type GroupStatus = "draft" | "open" | "active" | "completed" | "closed";

export interface SavingsGroup {
  _id: string;
  ownerUserId: string | User;
  name: string;
  description?: string;
  inviteCode: string;
  status: GroupStatus;
  contributionAmount: number;
  currencyCode: string;
  contributionFrequency: "weekly" | "biweekly" | "monthly";
  maxMembers: number;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GroupDetailsResponse {
  group: SavingsGroup;
  membership?: unknown;
  summary: {
    membersCount: number;
    pendingRequestsCount: number;
    recentTransactions: Payment[];
    wheel: {
      totalMembers: number;
      rotations: Array<{
        membershipId: string;
        user: User;
        positionNumber: number;
        membershipRole: "owner" | "member";
        joinedAt: string;
      }>;
    };
  };
}

export type SupportTicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type SupportTicketPriority = "low" | "medium" | "high" | "urgent";
export type SupportTicketCategory =
  | "payment_transaction"
  | "membership_access"
  | "technical_issue"
  | "feedback_suggestion"
  | "other";

export interface SupportTicket {
  _id: string;
  userId: string | User;
  groupId?: string | SavingsGroup | null;
  category: SupportTicketCategory;
  subject?: string;
  message: string;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  assignedAdminId?: string | User | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  password: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      _id: string;
      name: string;
      email: string;
      role: string;
    };
  }

  interface User {
    _id: string;
    accessToken: string;
    role: string;
  }
}
