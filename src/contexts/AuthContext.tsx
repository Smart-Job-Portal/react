import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { authApi, handleApiError } from "../services/api";
import { storage, dateUtils } from "../utils";
import { STORAGE_KEYS } from "../constants";
import type { AuthUser, LoginCredentials, RegisterData, ForgotPasswordData, UserRole } from "../types";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  forgotPassword: (data: ForgotPasswordData) => Promise<{ success: boolean; message?: string }>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; message?: string }>;
  checkTokenExpiry: () => boolean;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated
  const isAuthenticated = !!user && !dateUtils.isExpired(user.exp);

  // Initialize auth state from localStorage
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = () => {
    try {
      const token = storage.get<string>(STORAGE_KEYS.TOKEN);

      if (!token) {
        setIsLoading(false);
        return;
      }

      // Parse JWT token to get user info
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const authUser: AuthUser = {
          id: payload.sub,
          role: payload.role as UserRole,
          exp: payload.exp,
        };

        // Check if token is expired
        if (dateUtils.isExpired(authUser.exp)) {
          // Token expired, clear storage
          clearAuthData();
        } else {
          setUser(authUser);
        }
      } catch (error) {
        console.error("Error parsing token:", error);
        clearAuthData();
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthData = () => {
    storage.remove(STORAGE_KEYS.TOKEN);
    storage.remove(STORAGE_KEYS.USER);
    setUser(null);
  };

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);

      const response = await authApi.login(credentials);

      if (response.accessToken) {
        // Store token
        storage.set(STORAGE_KEYS.TOKEN, response.accessToken);

        // Parse token to get user info
        try {
          const payload = JSON.parse(atob(response.accessToken.split(".")[1]));
          const authUser: AuthUser = {
            id: payload.sub,
            role: payload.role as UserRole,
            exp: payload.exp,
          };

          setUser(authUser);

          // Also store user info if provided in response
          if (response.user) {
            storage.set(STORAGE_KEYS.USER, response.user);
          }

          return { success: true, message: "Login successful!" };
        } catch (error) {
          console.error("Error parsing login token:", error);
          return { success: false, message: "Invalid token received" };
        }
      } else {
        return { success: false, message: "No access token received" };
      }
    } catch (error) {
      const message = handleApiError(error);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);

      const response = await authApi.register(data);

      return {
        success: true,
        message: response.message || "Registration successful! Please check your email to verify your account.",
      };
    } catch (error) {
      const message = handleApiError(error);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
    // Optionally redirect to login page or home
  };

  const forgotPassword = async (data: ForgotPasswordData): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);

      const response = await authApi.forgotPassword(data);

      return {
        success: true,
        message: response.message || "Password reset email sent successfully!",
      };
    } catch (error) {
      const message = handleApiError(error);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);

      const response = await authApi.resendVerificationEmail(email);

      return {
        success: true,
        message: response.message || "Verification email sent successfully!",
      };
    } catch (error) {
      const message = handleApiError(error);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const checkTokenExpiry = (): boolean => {
    if (!user) return false;
    return !dateUtils.isExpired(user.exp);
  };

  const refreshAuth = () => {
    initializeAuth();
  };

  // Auto logout when token expires
  useEffect(() => {
    if (user && dateUtils.isExpired(user.exp)) {
      logout();
    }
  }, [user]);

  // Set up token expiry check interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (user && dateUtils.isExpired(user.exp)) {
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resendVerificationEmail,
    checkTokenExpiry,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
