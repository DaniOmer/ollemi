// Generic API service for making requests to Next.js API routes
// This abstracts away the implementation details of the backend
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};

const API_BASE_URL = "/api";

// Token storage and retrieval functions
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const saveToken = (token: string, refreshToken?: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  }
};

export const getAccessToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return null;
};

export const getRefreshToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
};

export const removeToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

/**
 * Refreshes the access token using the refresh token
 * @returns A boolean indicating if the token was successfully refreshed
 */
export const fetchRefreshToken = async (): Promise<boolean> => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    const response = await fetchApi<any>("/auth/refresh", {
      method: "POST",
      data: { refresh_token: refreshToken },
    });

    if (response.data?.session?.access_token) {
      saveToken(
        response.data.session.access_token,
        response.data.session.refresh_token
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return false;
  }
};

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
    Accept: "application/json",
  },
  withCredentials: true,
});

// Intercept requests to add auth token for private client
// Request interceptor - adds token to requests
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

// Response interceptor - handles token expiration
httpClientPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401/403 and we haven't tried to refresh the token yet
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshed = await fetchRefreshToken();

        if (refreshed) {
          // If token refresh succeeded, retry the original request
          const token = getAccessToken();
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return httpClientPrivate(originalRequest);
        } else {
          // If refresh failed, we need to redirect to login
          if (typeof window !== "undefined") {
            // Clear any auth state here
            console.log("Token refresh failed, redirecting to login");
            // You can dispatch an event or directly navigate
            window.location.href = "/login";
          }
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Handle failed refresh by redirecting to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export async function fetchApi<T>(
  endpoint: string,
  options?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    console.log("Fetching API:", "public");
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
