// Generic API service for making requests to Next.js API routes
// This abstracts away the implementation details of the backend
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { cookies } from "next/headers";

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
    Accept: "application/json",
  },
  withCredentials: true,
});

// Variables pour gérer les refresh concurrents
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Fonction pour ajouter des abonnés à la file d'attente
function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

// Fonction pour notifier tous les abonnés avec le nouveau token
function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// Response interceptor - handles token expiration
httpClientPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401/403 and we haven't tried to refresh the token yet
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry &&
      // Don't try to refresh if this is already a refresh request
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      if (!isRefreshing) {
        // Marquer que nous sommes en train de rafraîchir le token
        isRefreshing = true;
        originalRequest._retry = true;

        try {
          // Try to refresh the token
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );

          // If refresh was successful, retry the original request and notify subscribers
          if (refreshResponse.status === 200) {
            isRefreshing = false;

            // Notifier tous les abonnés que le token a été rafraîchi
            onTokenRefreshed(refreshResponse.data.token || "refreshed");

            return httpClientPrivate(originalRequest);
          } else {
            // If refresh wasn't successful but returned a response, redirect to login
            isRefreshing = false;
            handleAuthFailure();
          }
        } catch (refreshError) {
          // Handle failed refresh by redirecting to login
          isRefreshing = false;
          console.error("Failed to refresh token:", refreshError);
          handleAuthFailure();
        }
      } else {
        // Si un refresh est déjà en cours, ajouter cette requête à la file d'attente
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => {
            resolve(httpClientPrivate(originalRequest));
          });
        });
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to handle authentication failures
function handleAuthFailure() {
  // No need to clear localStorage - tokens should only be in HTTP-only cookies
  if (typeof window !== "undefined") {
    // Determine the current locale for redirection
    const pathParts = window.location.pathname.split("/");
    const locale =
      pathParts.length > 1 && pathParts[1].length === 2 ? pathParts[1] : "fr"; // Default to French if no locale in path

    // Redirect to login with current locale
    window.location.href = `/${locale}/login`;
  }
}

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
