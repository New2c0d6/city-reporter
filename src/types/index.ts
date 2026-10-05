/**
 * Database models (shared between frontend and backend)
 */

export type Report = {
  id: string;
  reference_number: string;
  category_id: number;
  title: string;
  description: string;
  status: 'NEW' | 'IN_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  location_latitude: number | null;
  location_longitude: number | null;
  location_accuracy: number | null;
  location_timestamp: string | null;
  location_address: string | null;
  created_at: string;
  updated_at: string;
};

export type ReportMedia = {
  id: string;
  report_id: string;
  type: 'photo' | 'video';
  media_url: string;
  created_at: string;
};

export type StatusHistory = {
  id: string;
  report_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  timestamp: string;
};

export type User = {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: number;
  name: string;
  created_at: string;
};

/**
 * API Response types
 */

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

/**
 * Auth types
 */

export type AuthToken = {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};

/**
 * Location types
 */

export type Location = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: string;
  address?: string;
};

/**
 * Form types
 */

export type ReportFormData = {
  category_id: number;
  title: string;
  description: string;
  location?: Location;
  media?: ReportMedia[];
};
