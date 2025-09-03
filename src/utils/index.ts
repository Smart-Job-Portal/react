// Utility functions for common operations
import { JobStatus, ApplicationStatus } from "../types";

// Class name utility for Tailwind CSS (simplified version without clsx/twMerge)
export function cn(...inputs: (string | undefined | null | boolean)[]): string {
  return inputs.filter(Boolean).join(" ").trim();
}

// Local Storage Utilities
export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item from localStorage:`, error);
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item in localStorage:`, error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from localStorage:`, error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error(`Error clearing localStorage:`, error);
    }
  },
};

// Date Utilities (simplified without date-fns)
export const dateUtils = {
  format: (date: string | Date): string => {
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return "Invalid date";

      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  },

  formatRelative: (date: string | Date): string => {
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return "Invalid date";

      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));

      if (diffInMinutes < 1) return "just now";
      if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;

      const diffInDays = Math.floor(diffInMinutes / 1440);
      if (diffInDays < 30) return `${diffInDays} days ago`;
      if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
      return `${Math.floor(diffInDays / 365)} years ago`;
    } catch (error) {
      console.error("Error formatting relative date:", error);
      return "Invalid date";
    }
  },

  isExpired: (expirationTime: number): boolean => {
    return Date.now() >= expirationTime * 1000;
  },
};

// Validation Utilities
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
const NAME_PATTERN = /^[a-zA-Z\s]+$/;

export const validateEmail = (email: string): boolean => {
  return EMAIL_PATTERN.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: `Password must be at least 8 characters long` };
  }
  if (!PASSWORD_PATTERN.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    };
  }
  return { isValid: true };
};

export const validateName = (name: string): { isValid: boolean; message?: string } => {
  if (name.length < 2) {
    return { isValid: false, message: `Name must be at least 2 characters long` };
  }
  if (name.length > 50) {
    return { isValid: false, message: `Name must be no more than 50 characters long` };
  }
  if (!NAME_PATTERN.test(name)) {
    return { isValid: false, message: "Name must contain only letters and spaces" };
  }
  return { isValid: true };
};

export const validateJobTitle = (title: string): { isValid: boolean; message?: string } => {
  if (title.length < 3) {
    return { isValid: false, message: "Job title must be at least 3 characters long" };
  }
  if (title.length > 100) {
    return { isValid: false, message: "Job title must be no more than 100 characters long" };
  }
  return { isValid: true };
};

export const validateJobDescription = (description: string): { isValid: boolean; message?: string } => {
  if (description.length < 10) {
    return { isValid: false, message: "Job description must be at least 10 characters long" };
  }
  if (description.length > 2000) {
    return { isValid: false, message: "Job description must be no more than 2000 characters long" };
  }
  return { isValid: true };
};

export const validateSalary = (salary: number): { isValid: boolean; message?: string } => {
  if (!Number.isInteger(salary)) {
    return { isValid: false, message: "Salary must be a whole number" };
  }
  if (salary < 0) {
    return { isValid: false, message: "Salary must be a positive number" };
  }
  if (salary > 10000000) {
    return { isValid: false, message: "Salary must be less than 10,000,000" };
  }
  return { isValid: true };
};

// File Upload Utilities
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];

export const validateFile = (
  file: File,
  type: "RESUME" | "IMAGE" = "RESUME",
): { isValid: boolean; message?: string } => {
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, message: "File size must be less than 5MB" };
  }

  const allowedTypes = type === "RESUME" ? RESUME_TYPES : IMAGE_TYPES;
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, message: "Invalid file type. Please select a valid file." };
  }

  return { isValid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// String Utilities
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str: string, length: number): string => {
  return str.length <= length ? str : str.substring(0, length) + "...";
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Number Utilities
export const formatCurrency = (amount: number, currency: string = "IRR"): string => {
  return new Intl.NumberFormat("fa-IR", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("en-US").format(num);
};

// Array Utilities
export const groupBy = <T, K extends keyof unknown>(array: T[], getKey: (item: T) => K): Record<K, T[]> => {
  return array.reduce(
    (grouped, item) => {
      const key = getKey(item);
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
      return grouped;
    },
    {} as Record<K, T[]>,
  );
};

export const sortBy = <T>(array: T[], key: keyof T, direction: "asc" | "desc" = "asc"): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
};

export const uniqueBy = <T, K>(array: T[], getKey: (item: T) => K): T[] => {
  const seen = new Set<K>();
  return array.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

// Status Utilities
export const getStatusConfig = (status: JobStatus | ApplicationStatus) => {
  if (Object.values(JobStatus).includes(status as JobStatus)) {
    const jobStatus = status as JobStatus;
    switch (jobStatus) {
      case JobStatus.ACTIVE:
        return { color: "bg-green-100 text-green-800", label: "Active" };
      case JobStatus.PENDING:
        return { color: "bg-yellow-100 text-yellow-800", label: "Pending" };
      case JobStatus.INACTIVE:
        return { color: "bg-gray-100 text-gray-800", label: "Inactive" };
      default:
        return { color: "bg-gray-100 text-gray-800", label: "Unknown" };
    }
  }

  if (Object.values(ApplicationStatus).includes(status as ApplicationStatus)) {
    const appStatus = status as ApplicationStatus;
    switch (appStatus) {
      case ApplicationStatus.PENDING:
        return { color: "bg-yellow-100 text-yellow-800", label: "Pending" };
      case ApplicationStatus.ACCEPTED:
        return { color: "bg-green-100 text-green-800", label: "Accepted" };
      case ApplicationStatus.REJECTED:
        return { color: "bg-red-100 text-red-800", label: "Rejected" };
      default:
        return { color: "bg-gray-100 text-gray-800", label: "Unknown" };
    }
  }

  return { color: "bg-gray-100 text-gray-800", label: "Unknown" };
};

// Error Handling Utilities
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return "An unexpected error occurred. Please try again later.";
};

export const parseApiError = (error: unknown): string => {
  if (error && typeof error === "object" && "response" in error) {
    const errorWithResponse = error as { response?: { data?: { message?: string } } };
    if (errorWithResponse.response?.data?.message) {
      return errorWithResponse.response.data.message;
    }
  }

  if (error && typeof error === "object" && "message" in error) {
    const errorWithMessage = error as { message: string };
    return errorWithMessage.message;
  }

  if (error && typeof error === "object" && "status" in error) {
    const errorWithStatus = error as { status: number };
    switch (errorWithStatus.status) {
      case 401:
        return "You are not authorized to perform this action.";
      case 403:
        return "Access denied. You do not have permission to access this resource.";
      case 404:
        return "The requested resource was not found.";
      case 409:
        return "You have already applied to this job.";
      case 422:
        return "Please check your input and try again.";
      case 500:
        return "An unexpected error occurred. Please try again later.";
      default:
        return "Network error. Please check your connection and try again.";
    }
  }

  return "An unexpected error occurred. Please try again later.";
};

// URL Utilities
export const buildQueryString = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};

export const parseUrlParams = (search: string): Record<string, string> => {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
};

// Debounce Utility
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle Utility
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Generic ID Generator
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Copy to Clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
};

// Download File
export const downloadFile = (data: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
