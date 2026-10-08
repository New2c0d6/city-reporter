import { API_CONFIG, API_ENDPOINTS } from '../constants/api';
import { Category, Report, ReportFormData } from '../types/index';

/**
 * API client for communicating with the backend
 */
class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  /**
   * Make a request to the API
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    endpoint: string,
    body?: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        signal: controller.signal,
      };

      if (body && (method === 'POST' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: `HTTP ${response.status}`,
        }));
        throw new Error(error.error || `Request failed with status ${response.status}`);
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('GET', API_ENDPOINTS.CATEGORIES);
  }

  /**
   * Create a new report
   */
  async createReport(formData: ReportFormData): Promise<Report> {
    return this.request<Report>('POST', API_ENDPOINTS.REPORTS, {
      category_id: formData.category_id,
      title: formData.title,
      description: formData.description,
      location: formData.location,
    });
  }

  /**
   * Get a report by ID
   */
  async getReport(id: string): Promise<Report> {
    return this.request<Report>('GET', API_ENDPOINTS.REPORT_DETAIL(id));
  }

  /**
   * Get all reports with pagination
   */
  async getReports(page: number = 1, pageSize: number = 20) {
    return this.request<{
      items: Report[];
      total: number;
      page: number;
      pageSize: number;
    }>('GET', `${API_ENDPOINTS.REPORTS}?page=${page}&pageSize=${pageSize}`);
  }
}

export const apiClient = new ApiClient();
