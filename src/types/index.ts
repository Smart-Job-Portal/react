// User and Authentication Types
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export const UserRole = {
  ADMIN: "ADMIN",
  EMPLOYER: "EMPLOYER",
  SEEKER: "SEEKER",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface AuthUser {
  id: number;
  role: UserRole;
  exp: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

// Job Types
export interface JobLocation {
  city: string;
  street: string;
  alley: string;
}

export const JobStatus = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

export interface Job {
  id: number;
  title: string;
  description: string;
  salary?: number;
  status: JobStatus;
  jobLocation?: JobLocation;
  employerId: number;
  employerName: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    applications: number;
  };
}

export interface CreateJobData {
  title: string;
  description: string;
  salary?: number;
  city?: string;
  street?: string;
  alley?: string;
}

export interface UpdateJobData {
  title?: string;
  description?: string;
  salary?: number;
  status?: JobStatus;
  city?: string;
  street?: string;
  alley?: string;
}

// Application Types
export const ApplicationStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
} as const;

export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

export interface Application {
  id: number;
  description: string;
  status: ApplicationStatus;
  resumePath?: string;
  originalFileName?: string;
  jobId: number;
  applicantId: number;
  applicantName: string;
  applicantEmail: string;
  jobTitle: string;
  createdAt: string;
  updatedAt: string;
  job?: Job;
}

export interface CreateApplicationData {
  description: string;
  resume?: File;
}

export interface UpdateApplicationData {
  status: ApplicationStatus;
}

// API Response Types
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  hasPrev?: boolean;
  hasNext?: boolean;
  totalPages?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  error: string;
  statusCode: number;
}

// Form and UI Types
export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "textarea" | "select" | "file" | "number";
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    min?: number;
    max?: number;
  };
}

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

// Filter and Search Types
export interface JobFilters extends Record<string, unknown> {
  status?: JobStatus;
  search?: string;
  page?: number;
  limit?: number;
  employerId?: number;
}

export interface ApplicationFilters extends Record<string, unknown> {
  status?: ApplicationStatus;
  jobId?: number;
  applicantId?: number;
  page?: number;
  limit?: number;
}

// Navigation and Layout Types
export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  roles?: UserRole[];
}

export interface TabItem {
  id: string;
  label: string;
  content: React.ComponentType;
  roles?: UserRole[];
}

// Modal Types
export interface Modal {
  isOpen: boolean;
  title: string;
  content: React.ReactNode;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl";
}

// Generic Types
export type LoadingState = "idle" | "loading" | "success" | "error";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Environment Types
export interface EnvironmentConfig {
  API_BASE_URL: string;
  NODE_ENV: "development" | "production" | "test";
}
