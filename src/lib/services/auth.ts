import {
  fetchApi,
  fetchPrivateApi,
  ApiResponse,
  saveToken,
  removeToken,
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
