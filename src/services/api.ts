// API Service Layer with proper error handling and types
import { ENV, getApiUrl } from "../constants/env";
import { storage } from "../utils";
import { STORAGE_KEYS } from "../constants";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  Job,
  CreateJobData,
  UpdateJobData,
  Application,
  CreateApplicationData,
  UpdateApplicationData,
  ApiResponse,
  JobFilters,
  JobStatus,
} from "../types";

// Base API configuration
const API_CONFIG = {
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
};

// Custom API Error class
export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public data?: unknown;

  constructor(status: number, statusText: string, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

// Base HTTP client
class HttpClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = storage.get<string>(STORAGE_KEYS.TOKEN);
    const headers: HeadersInit = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, response.statusText, errorData.message || response.statusText, errorData);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...API_CONFIG.headers,
        ...this.getAuthHeaders(),
        ...(options.headers as Record<string, string>),
      },
    };

    // Handle FormData - don't set Content-Type header
    if (options.body instanceof FormData) {
      const headers = config.headers as Record<string, string>;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { "Content-Type": _contentType, ...headersWithoutContentType } = headers;
      config.headers = headersWithoutContentType;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new ApiError(408, "Request Timeout", "Request timed out");
        }
        throw new ApiError(0, "Network Error", error.message);
      }

      throw new ApiError(0, "Unknown Error", "An unknown error occurred");
    }
  }

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    if (params) {
      // Convert params to string values for URLSearchParams
      const stringParams: Record<string, string> = {};
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          stringParams[key] = String(value);
        }
      });
      const url = `${endpoint}?${new URLSearchParams(stringParams)}`;
      return this.request<T>(url, { method: "GET" });
    }
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown, contentType?: string): Promise<T> {
    const options: RequestInit = {
      method: "POST",
    };

    if (data instanceof FormData) {
      options.body = data;
    } else if (contentType === "application/x-www-form-urlencoded") {
      options.headers = { "Content-Type": contentType };
      options.body = data instanceof URLSearchParams ? data : new URLSearchParams(data as Record<string, string>);
    } else {
      options.body = JSON.stringify(data);
    }

    return this.request<T>(endpoint, options);
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: unknown, contentType?: string): Promise<T> {
    const options: RequestInit = {
      method: "PATCH",
    };

    if (data instanceof FormData) {
      options.body = data;
    } else if (contentType === "application/x-www-form-urlencoded") {
      options.headers = { "Content-Type": contentType };
      options.body = data instanceof URLSearchParams ? data : new URLSearchParams(data as Record<string, string>);
    } else {
      options.body = JSON.stringify(data);
    }

    return this.request<T>(endpoint, options);
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

// Initialize HTTP client
const httpClient = new HttpClient(ENV.API_BASE_URL);

// Authentication API
export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return httpClient.post<AuthResponse>("/auth/login", credentials, "application/x-www-form-urlencoded");
  },

  async register(data: RegisterData): Promise<{ message: string }> {
    return httpClient.post<{ message: string }>("/auth/register", data, "application/x-www-form-urlencoded");
  },

  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    return httpClient.post<{ message: string }>("/auth/forget-password", data, "application/x-www-form-urlencoded");
  },

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    return httpClient.patch<{ message: string }>("/auth/reset-password", data, "application/x-www-form-urlencoded");
  },

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    return httpClient.post<{ message: string }>(
      "/auth/resend-verification-email",
      { email },
      "application/x-www-form-urlencoded",
    );
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    return httpClient.get<{ message: string }>(`/auth/verify-email?token=${token}`);
  },

  // Google OAuth URLs
  getGoogleSeekerUrl(): string {
    return getApiUrl("/auth/google/seeker");
  },

  getGoogleEmployerUrl(): string {
    return getApiUrl("/auth/google/employer");
  },
};

// Job data transformation helper
const transformJob = (rawJob: any): Job => {
  return {
    id: rawJob.id,
    title: rawJob.title,
    description: rawJob.description,
    salary: rawJob.salary,
    status: rawJob.status,
    jobLocation: rawJob.jobLocation || rawJob.location || null,
    employerId: rawJob.userId, // Map userId to employerId
    employerName: rawJob.employerName || "Unknown Employer",
    createdAt: rawJob.createdAt || new Date().toISOString(),
    updatedAt: rawJob.updatedAt || new Date().toISOString(),
    _count: rawJob._count,
  };
};

// Jobs API
export const jobsApi = {
  async getAll(filters?: JobFilters): Promise<ApiResponse<Job[]>> {
    const response = await httpClient.get<any>("/jobs", filters);
    // Transform the response to ensure it matches our expected structure
    return {
      status: response.status || "success",
      message: response.message || "",
      data: (response.data || []).map(transformJob),
      hasPrev: response.hasPrev,
      hasNext: response.hasNext,
      totalPages: response.totalPages,
    };
  },

  async getById(id: number): Promise<ApiResponse<Job>> {
    const response = await httpClient.get<any>(`/jobs/${id}`);
    return {
      status: response.status || "success",
      message: response.message || "",
      data: transformJob(response.data),
      hasPrev: response.hasPrev,
      hasNext: response.hasNext,
      totalPages: response.totalPages,
    };
  },

  async getUserJobs(): Promise<ApiResponse<Job[]>> {
    const response = await httpClient.get<any>("/jobs/my-jobs");
    return {
      status: response.status || "success",
      message: response.message || "",
      data: (response.data || []).map(transformJob),
      hasPrev: response.hasPrev,
      hasNext: response.hasNext,
      totalPages: response.totalPages,
    };
  },

  async create(data: CreateJobData): Promise<ApiResponse<Job>> {
    // Structure data according to backend expected format
    const requestData: any = {
      title: data.title,
      description: data.description,
    };

    if (data.salary !== undefined) {
      requestData.salary = data.salary;
    }

    // Create location object if any location field is provided
    if (data.city || data.street || data.alley) {
      requestData.location = {};
      if (data.city) requestData.location.city = data.city;
      if (data.street) requestData.location.street = data.street;
      if (data.alley) requestData.location.alley = data.alley;
    }

    const response = await httpClient.post<any>("/jobs", requestData);
    return {
      status: response.status || "success",
      message: response.message || "",
      data: transformJob(response.data),
      hasPrev: response.hasPrev,
      hasNext: response.hasNext,
      totalPages: response.totalPages,
    };
  },

  async update(id: number, data: UpdateJobData): Promise<ApiResponse<Job>> {
    // Structure data according to backend expected format
    const requestData: any = {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.salary !== undefined && { salary: data.salary }),
      ...(data.status && { status: data.status }),
    };

    // Create location object if any location field is provided
    if (data.city || data.street || data.alley) {
      requestData.location = {};
      if (data.city) requestData.location.city = data.city;
      if (data.street) requestData.location.street = data.street;
      if (data.alley) requestData.location.alley = data.alley;
    }

    const response = await httpClient.patch<any>(`/jobs/${id}`, requestData);
    return {
      status: response.status || "success",
      message: response.message || "",
      data: transformJob(response.data),
      hasPrev: response.hasPrev,
      hasNext: response.hasNext,
      totalPages: response.totalPages,
    };
  },

  async delete(id: number): Promise<{ message: string }> {
    return httpClient.delete<{ message: string }>(`/jobs/${id}`);
  },

  // Admin endpoints
  async getAllAdmin(filters?: JobFilters): Promise<ApiResponse<Job[]>> {
    const response = await httpClient.get<any>("/admin/jobs", filters);
    return {
      status: response.status || "success",
      message: response.message || "",
      data: (response.data || []).map(transformJob),
      hasPrev: response.hasPrev,
      hasNext: response.hasNext,
      totalPages: response.totalPages,
    };
  },

  async updateAdmin(id: number, data: { status: JobStatus }): Promise<ApiResponse<Job>> {
    const response = await httpClient.patch<any>(`/admin/jobs/${id}`, data, "application/x-www-form-urlencoded");
    return {
      status: response.status || "success",
      message: response.message || "",
      data: transformJob(response.data),
      hasPrev: response.hasPrev,
      hasNext: response.hasNext,
      totalPages: response.totalPages,
    };
  },
};

// Applications API
export const applicationsApi = {
  async getAll(): Promise<Application[]> {
    const response = await httpClient.get<any>("/applications");
    // Handle both direct array response and wrapped response
    if (Array.isArray(response)) {
      return response;
    }
    return response.data || response || [];
  },

  async getForJob(jobId: number): Promise<ApiResponse<Application[]>> {
    const response = await httpClient.get<ApiResponse<Application[]>>(`/applications/jobs/${jobId}`);
    return {
      status: response.status || "success",
      message: response.message || "",
      data: response.data || [],
      hasPrev: response.hasPrev,
      hasNext: response.hasNext,
      totalPages: response.totalPages,
    };
  },

  async getById(id: number): Promise<ApiResponse<Application>> {
    const response = await httpClient.get<ApiResponse<Application>>(`/applications/${id}`);
    return {
      status: response.status || "success",
      message: response.message || "",
      data: response.data,
      hasPrev: response.hasPrev,
      hasNext: response.hasNext,
      totalPages: response.totalPages,
    };
  },

  async getUserApplications(): Promise<ApiResponse<Application[]>> {
    const response = await httpClient.get<ApiResponse<Application[]>>("/applications/my-applications");
    return {
      status: response.status || "success",
      message: response.message || "",
      data: response.data || [],
      hasPrev: response.hasPrev,
      hasNext: response.hasNext,
      totalPages: response.totalPages,
    };
  },

  async create(jobId: number, data: CreateApplicationData): Promise<ApiResponse<Application>> {
    const formData = new FormData();
    formData.append("description", data.description);

    if (data.resume) {
      formData.append("resume", data.resume);
    }

    const response = await httpClient.post<ApiResponse<Application>>(`/applications/jobs/${jobId}`, formData);
    return {
      status: response.status || "success",
      message: response.message || "",
      data: response.data,
      hasPrev: response.hasPrev,
      hasNext: response.hasNext,
      totalPages: response.totalPages,
    };
  },

  async update(id: number, data: UpdateApplicationData): Promise<ApiResponse<Application>> {
    const response = await httpClient.patch<ApiResponse<Application>>(
      `/applications/${id}`,
      data,
      "application/x-www-form-urlencoded",
    );
    return {
      status: response.status || "success",
      message: response.message || "",
      data: response.data,
      hasPrev: response.hasPrev,
      hasNext: response.hasNext,
      totalPages: response.totalPages,
    };
  },

  async getEmployerApplications(filters?: { page?: number; limit?: number }): Promise<ApiResponse<Application[]>> {
    const response = await httpClient.get<any>("/applications/employer", filters);
    return {
      status: response.status || "success",
      message: response.message || "",
      data: response.data || [],
      hasPrev: response.pagination?.hasPrev || false,
      hasNext: response.pagination?.hasNext || false,
      totalPages: response.pagination?.totalPages || 0,
    };
  },
};

// Combined API object
export const api = {
  auth: authApi,
  jobs: jobsApi,
  applications: applicationsApi,
};

// Export error handling utilities
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    // Handle specific status codes
    switch (error.status) {
      case 401:
        // Clear token and redirect to login
        storage.remove(STORAGE_KEYS.TOKEN);
        storage.remove(STORAGE_KEYS.USER);
        return "Your session has expired. Please log in again.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 409:
        return error.message || "A conflict occurred. This item may already exist.";
      case 422:
        return error.message || "Please check your input and try again.";
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
        return "A server error occurred. Please try again later.";
      default:
        return error.message || "An unexpected error occurred.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
};

export default api;
