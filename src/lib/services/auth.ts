import {
  fetchApi,
  fetchPrivateApi,
  ApiResponse,
  setupAuthInterceptor,
} from "./api";
import { User } from "@/types";

export type AuthResponse = {
  user: User;
  user_data: User;
  session: {
    access_token: string;
    expires_at: number;
    refresh_token?: string;
  };
  redirectUrl?: string;
};

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

export const getToken = (): string | null => {
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
export const refreshToken = async (): Promise<boolean> => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    const response = await fetchApi<AuthResponse>("/auth/refresh", {
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

// Initialize auth interceptor with refresh token capability
setupAuthInterceptor(getToken, refreshToken);

export async function signUp(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string,
  phone?: string,
  role: string = "client",
  acceptTerms: boolean = false
): Promise<ApiResponse<AuthResponse>> {
  const response = await fetchApi<AuthResponse>("/auth/signup", {
    method: "POST",
    data: {
      email,
      password,
      firstName,
      lastName,
      phone,
      role,
      acceptTerms,
    },
  });

  // Only save token if signup was successful and we have a token
  if (response.data?.session?.access_token) {
    saveToken(
      response.data.session.access_token,
      response.data.session.refresh_token
    );
  }

  return response;
}

export async function signIn(
  email: string,
  password: string
): Promise<ApiResponse<AuthResponse>> {
  const response = await fetchApi<AuthResponse>("/auth/login", {
    method: "POST",
    data: { email, password },
  });

  if (response.data?.session?.access_token) {
    saveToken(
      response.data.session.access_token,
      response.data.session.refresh_token
    );
  }

  return response;
}

export async function signOut(): Promise<ApiResponse<null>> {
  const response = await fetchPrivateApi<null>("/auth/logout", {
    method: "POST",
  });

  // Remove token regardless of response
  removeToken();

  return response;
}

export async function getCurrentUser(): Promise<
  ApiResponse<{
    user: User | null;
  }>
> {
  return fetchPrivateApi<{
    user: User | null;
  }>("/auth/user");
}
