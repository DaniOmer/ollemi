import { fetchApi, fetchPrivateApi, ApiResponse } from "./api";
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
      first_name: firstName,
      last_name: lastName,
      phone,
      role,
      accept_terms: acceptTerms,
    },
  });

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

  return response;
}

export async function signOut(): Promise<ApiResponse<null>> {
  const response = await fetchPrivateApi<null>("/auth/logout", {
    method: "POST",
  });

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
