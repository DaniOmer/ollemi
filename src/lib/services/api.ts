// Generic API service for making requests to Next.js API routes
// This abstracts away the implementation details of the backend
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};

const API_BASE_URL = "/api";

// Public HTTP client for unauthenticated requests
export const httpClientPublic: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Private HTTP client for authenticated requests
export const httpClientPrivate: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Intercept requests to add auth token for private client
export const setupAuthInterceptor = (getAccessToken: () => string | null) => {
  httpClientPrivate.interceptors.request.use(
    (config) => {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

export async function fetchApi<T>(
  endpoint: string,
  options?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    // Use the public client by default
    const response: AxiosResponse<T> = await httpClientPublic({
      url: endpoint,
      ...options,
    });

    return {
      data: response.data,
      error: null,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Handle server errors with response data
      const errorData = error.response.data as any;
      return {
        data: null,
        error: errorData.error || `Error: ${error.response.status}`,
      };
    } else {
      // Handle network errors or other issues
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}

// Helper function for private API calls (using auth token)
export async function fetchPrivateApi<T>(
  endpoint: string,
  options?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response: AxiosResponse<T> = await httpClientPrivate({
      url: endpoint,
      ...options,
    });

    return {
      data: response.data,
      error: null,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Handle server errors with response data
      const errorData = error.response.data as any;
      return {
        data: null,
        error: errorData.error || `Error: ${error.response.status}`,
      };
    } else {
      // Handle network errors or other issues
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
