/**
 * API configuration
 */

// Use localhost for development, adjust for production
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000, // 30 seconds
};

export const API_ENDPOINTS = {
  CATEGORIES: '/categories',
  REPORTS: '/reports',
  REPORT_DETAIL: (id: string) => `/reports/${id}`,
  REPORT_STATUS: (id: string) => `/reports/${id}/status`,
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  UPLOADS_PRESIGNED: '/uploads/presigned-url',
};
