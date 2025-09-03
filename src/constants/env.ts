// Environment configuration
const getEnvVar = (name: string, defaultValue?: string): string => {
  const value = import.meta.env[name] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
};

export const ENV = {
  // API Configuration
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 'https://job-portal-api-nest.onrender.com'),

  // App Configuration
  NODE_ENV: getEnvVar('NODE_ENV', 'development') as 'development' | 'production' | 'test',

  // Feature Flags
  ENABLE_DEBUG: getEnvVar('VITE_ENABLE_DEBUG', 'false') === 'true',

  // OAuth Configuration (if needed in future)
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',

  // App Metadata
  APP_NAME: getEnvVar('VITE_APP_NAME', 'Job Portal'),
  APP_VERSION: getEnvVar('VITE_APP_VERSION', '1.0.0'),
} as const;

// Type-safe environment access
export type EnvKey = keyof typeof ENV;

// Development helpers
export const isDevelopment = ENV.NODE_ENV === 'development';
export const isProduction = ENV.NODE_ENV === 'production';
export const isTest = ENV.NODE_ENV === 'test';

// API URL helper
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = ENV.API_BASE_URL.replace(/\/+$/, ''); // Remove trailing slashes
  const cleanEndpoint = endpoint.replace(/^\/+/, ''); // Remove leading slashes
  return `${baseUrl}/${cleanEndpoint}`;
};
