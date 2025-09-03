import { Briefcase, FileText, Shield, Users, Home } from "lucide-react";

// Application Constants
export const APP_NAME = "Job Portal";
export const APP_DESCRIPTION = "A modern job portal for connecting employers and job seekers";

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: "job_portal_token",
  USER: "job_portal_user",
  THEME: "job_portal_theme",
  LANGUAGE: "job_portal_language",
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forget-password",
    RESET_PASSWORD: "/auth/reset-password",
    RESEND_VERIFICATION: "/auth/resend-verification-email",
    VERIFY_EMAIL: "/auth/verify-email",
    GOOGLE_SEEKER: "/auth/google/seeker",
    GOOGLE_EMPLOYER: "/auth/google/employer",
  },

  // Jobs
  JOBS: {
    BASE: "/jobs",
    MY_JOBS: "/jobs/my-jobs",
    BY_ID: (id: number) => `/jobs/${id}`,
    ADMIN: "/admin/jobs",
  },

  // Applications
  APPLICATIONS: {
    BASE: "/applications",
    BY_JOB: (jobId: number) => `/applications/jobs/${jobId}`,
    BY_ID: (id: number) => `/applications/${id}`,
    MY_APPLICATIONS: "/applications/my-applications",
    APPLY: (jobId: number) => `/applications/jobs/${jobId}`,
  },
} as const;

// User Roles Configuration
export const USER_ROLES = [
  { value: "SEEKER", label: "Job Seeker" },
  { value: "EMPLOYER", label: "Employer" },
] as const;

// Job Status Configuration
export const JOB_STATUSES = [
  {
    value: "ACTIVE",
    label: "Active",
    color: "bg-green-100 text-green-800",
    description: "Job is currently accepting applications",
  },
  {
    value: "PENDING",
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    description: "Job is awaiting admin approval",
  },
  {
    value: "INACTIVE",
    label: "Inactive",
    color: "bg-gray-100 text-gray-800",
    description: "Job is no longer accepting applications",
  },
] as const;

// Application Status Configuration
export const APPLICATION_STATUSES = [
  {
    value: "PENDING",
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    description: "Application is under review",
  },
  {
    value: "ACCEPTED",
    label: "Accepted",
    color: "bg-green-100 text-green-800",
    description: "Application has been accepted",
  },
  {
    value: "REJECTED",
    label: "Rejected",
    color: "bg-red-100 text-red-800",
    description: "Application has been rejected",
  },
] as const;

// Navigation Items
export const NAVIGATION_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    path: "/",
    roles: ["ADMIN", "EMPLOYER", "SEEKER"],
  },
  {
    id: "jobs",
    label: "Jobs",
    icon: Briefcase,
    path: "/jobs",
    roles: ["ADMIN", "EMPLOYER", "SEEKER"],
  },
  {
    id: "my-jobs",
    label: "My Jobs",
    icon: Briefcase,
    path: "/my-jobs",
    roles: ["EMPLOYER"],
  },
  {
    id: "applications",
    label: "My Applications",
    icon: FileText,
    path: "/applications",
    roles: ["SEEKER"],
  },
  {
    id: "admin",
    label: "Admin Panel",
    icon: Shield,
    path: "/admin",
    roles: ["ADMIN"],
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    path: "/users",
    roles: ["ADMIN"],
  },
] as const;

// Pagination Configuration
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMITS: [5, 10, 20, 50],
} as const;

// File Upload Configuration
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: {
    RESUME: [".pdf", ".doc", ".docx"],
    IMAGE: [".jpg", ".jpeg", ".png", ".gif"],
  },
  MIME_TYPES: {
    RESUME: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    IMAGE: ["image/jpeg", "image/png", "image/gif"],
  },
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    MESSAGE:
      "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: "Please enter a valid email address",
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s]+$/,
    MESSAGE: "Name must contain only letters and spaces",
  },
  JOB_TITLE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
    MESSAGE: "Job title must be between 3 and 100 characters",
  },
  JOB_DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 2000,
    MESSAGE: "Job description must be between 10 and 2000 characters",
  },
  SALARY: {
    MIN: 0,
    MAX: 10000000, // 10 million
    MESSAGE: "Salary must be a positive number",
  },
} as const;

// Toast Configuration
export const TOAST_CONFIG = {
  DEFAULT_DURATION: 5000,
  SUCCESS_DURATION: 3000,
  ERROR_DURATION: 7000,
  WARNING_DURATION: 5000,
  INFO_DURATION: 4000,
} as const;

// Theme Configuration
export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: {
      50: "#eff6ff",
      100: "#dbeafe",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
    },
    SUCCESS: {
      50: "#f0fdf4",
      100: "#dcfce7",
      500: "#22c55e",
      600: "#16a34a",
    },
    ERROR: {
      50: "#fef2f2",
      100: "#fee2e2",
      500: "#ef4444",
      600: "#dc2626",
    },
    WARNING: {
      50: "#fffbeb",
      100: "#fef3c7",
      500: "#f59e0b",
      600: "#d97706",
    },
  },
} as const;

// Date Format Configuration
export const DATE_FORMATS = {
  SHORT: "MM/dd/yyyy",
  MEDIUM: "MMM dd, yyyy",
  LONG: "MMMM dd, yyyy",
  FULL: "EEEE, MMMM dd, yyyy",
  TIME: "HH:mm",
  DATETIME: "MMM dd, yyyy HH:mm",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "Access denied. You do not have permission to access this resource.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Please check your input and try again.",
  SERVER_ERROR: "An unexpected error occurred. Please try again later.",
  TOKEN_EXPIRED: "Your session has expired. Please log in again.",
  EMAIL_NOT_VERIFIED: "Please verify your email address before proceeding.",
  ALREADY_APPLIED: "You have already applied to this job.",
  FILE_TOO_LARGE: `File size must be less than ${FILE_UPLOAD.MAX_SIZE / (1024 * 1024)}MB`,
  INVALID_FILE_TYPE: "Invalid file type. Please select a valid file.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Successfully logged in!",
  REGISTER_SUCCESS: "Registration successful! Please check your email to verify your account.",
  PASSWORD_RESET_SUCCESS: "Password reset successful!",
  EMAIL_SENT: "Email sent successfully!",
  PROFILE_UPDATED: "Profile updated successfully!",
  JOB_CREATED: "Job created successfully!",
  JOB_UPDATED: "Job updated successfully!",
  JOB_DELETED: "Job deleted successfully!",
  APPLICATION_SUBMITTED: "Application submitted successfully!",
  APPLICATION_UPDATED: "Application status updated successfully!",
  VERIFICATION_EMAIL_SENT: "Verification email sent! Please check your inbox.",
} as const;

// Loading Messages
export const LOADING_MESSAGES = {
  AUTHENTICATING: "Authenticating...",
  LOADING_JOBS: "Loading jobs...",
  LOADING_APPLICATIONS: "Loading applications...",
  SUBMITTING: "Submitting...",
  UPLOADING: "Uploading file...",
  SAVING: "Saving...",
  DELETING: "Deleting...",
} as const;
