import {
  fetchApi,
  fetchPrivateApi,
  ApiResponse,
  setupAuthInterceptor,
} from "./api";

export type AuthResponse = {
  user: {
    id: string;
    email: string;
    role: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
  session: {
    access_token: string;
    expires_at: number;
  };
};

// Token storage and retrieval functions
const ACCESS_TOKEN_KEY = "access_token";

export const saveToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
};

export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return null;
};

export const removeToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};

// Initialize auth interceptor
setupAuthInterceptor(getToken);

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
    saveToken(response.data.session.access_token);
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
    saveToken(response.data.session.access_token);
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
    user: {
      id: string;
      email: string;
      role: string;
      first_name: string;
      last_name: string;
      phone?: string;
    } | null;
  }>
> {
  // Use private API to get the current user (requires auth)
  return fetchPrivateApi<{
    user: {
      id: string;
      email: string;
      role: string;
      first_name: string;
      last_name: string;
      phone?: string;
    } | null;
  }>("/auth/user");
}
