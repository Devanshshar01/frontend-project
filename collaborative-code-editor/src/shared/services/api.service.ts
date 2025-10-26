import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_CONFIG, AUTH_CONFIG } from '../config/constants';
import type { ApiResponse, ApiError } from '../types';

/**
 * Centralized API service with interceptors, retry logic, and error handling
 * Following enterprise-grade patterns for production readiness
 */
class ApiService {
  private axiosInstance: AxiosInstance;
  private requestQueue: Array<() => void> = [];
  private isRefreshing = false;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Set up request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      this.handleRequest.bind(this),
      this.handleRequestError.bind(this)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      this.handleResponse.bind(this),
      this.handleResponseError.bind(this)
    );
  }

  /**
   * Handle outgoing requests - attach auth token
   */
  private handleRequest(
    config: InternalAxiosRequestConfig
  ): InternalAxiosRequestConfig {
    const token = this.getAuthToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  }

  /**
   * Handle request errors
   */
  private handleRequestError(error: unknown): Promise<never> {
    return Promise.reject(this.normalizeError(error));
  }

  /**
   * Handle successful responses
   */
  private handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): AxiosResponse<ApiResponse<T>> {
    return response;
  }

  /**
   * Handle response errors with retry logic and token refresh
   */
  private async handleResponseError(error: unknown): Promise<unknown> {
    if (!axios.isAxiosError(error) || !error.config) {
      return Promise.reject(this.normalizeError(error));
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (this.isRefreshing) {
        // Queue the request if refresh is in progress
        return new Promise((resolve) => {
          this.requestQueue.push(() => {
            resolve(this.axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      this.isRefreshing = true;

      try {
        await this.refreshToken();
        this.processQueue();
        return this.axiosInstance(originalRequest);
      } catch (refreshError) {
        this.clearQueue();
        this.handleAuthFailure();
        return Promise.reject(this.normalizeError(refreshError));
      } finally {
        this.isRefreshing = false;
      }
    }

    // Retry logic for network errors and 5xx errors
    const shouldRetry = this.shouldRetryRequest(error, originalRequest);

    if (shouldRetry) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      await this.delay(API_CONFIG.RETRY_DELAY * originalRequest._retryCount);

      return this.axiosInstance(originalRequest);
    }

    return Promise.reject(this.normalizeError(error));
  }

  /**
   * Determine if request should be retried
   */
  private shouldRetryRequest(
    error: unknown,
    config: InternalAxiosRequestConfig & { _retryCount?: number }
  ): boolean {
    if (!axios.isAxiosError(error)) {
      return false;
    }

    const retryCount = config._retryCount || 0;
    const isNetworkError = !error.response;
    const is5xxError = Boolean(error.response && error.response.status >= 500);
    const hasRetriesLeft = retryCount < API_CONFIG.RETRY_ATTEMPTS;

    return (isNetworkError || is5xxError) && hasRetriesLeft;
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.axiosInstance.post<
      ApiResponse<{ accessToken: string; refreshToken: string }>
    >('/auth/refresh', { refreshToken });

    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, accessToken);
      localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, newRefreshToken);
    } else {
      throw new Error('Token refresh failed');
    }
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(): void {
    this.requestQueue.forEach((callback) => callback());
    this.requestQueue = [];
  }

  /**
   * Clear request queue
   */
  private clearQueue(): void {
    this.requestQueue = [];
  }

  /**
   * Handle authentication failure - clear tokens and redirect
   */
  private handleAuthFailure(): void {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    window.location.href = '/login';
  }

  /**
   * Get authentication token from storage
   */
  private getAuthToken(): string | null {
    return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  }

  /**
   * Normalize errors to consistent format
   */
  private normalizeError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data?.error;

      if (apiError) {
        return apiError;
      }

      return {
        message: error.message || 'An unexpected error occurred',
        code: error.code || 'UNKNOWN_ERROR',
        statusCode: error.response?.status || 500,
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'UNKNOWN_ERROR',
        statusCode: 500,
      };
    }

    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      statusCode: 500,
    };
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.delete<ApiResponse<T>>(url, config);
    return response.data;
  }
}

// Export singleton instance
export const apiService = new ApiService();
