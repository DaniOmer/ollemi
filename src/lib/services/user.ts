import { fetchPrivateApi, ApiResponse } from "./api";
import { Review, User } from "@/types";

// User profile endpoints
export async function getUserProfile(): Promise<ApiResponse<User>> {
  return fetchPrivateApi<User>("/users/profile");
}

export async function updateUserProfile(
  profileData: Partial<User>
): Promise<ApiResponse<User>> {
  return fetchPrivateApi<User>("/users/profile", {
    method: "PUT",
    data: profileData,
  });
}

// User preferences endpoints
export interface UserPreferences {
  notifications: boolean;
  theme: "light" | "dark" | "system";
  language: string;
}

export async function getUserPreferences(): Promise<
  ApiResponse<UserPreferences>
> {
  return fetchPrivateApi<UserPreferences>("/users/preferences");
}

export async function createUserPreferences(
  preferences: UserPreferences
): Promise<ApiResponse<UserPreferences>> {
  return fetchPrivateApi<UserPreferences>("/users/preferences", {
    method: "POST",
    data: preferences,
  });
}

export async function updateUserPreferences(
  preferences: Partial<UserPreferences>
): Promise<ApiResponse<UserPreferences>> {
  return fetchPrivateApi<UserPreferences>("/users/preferences", {
    method: "PUT",
    data: preferences,
  });
}

// User favorites endpoints
export interface FavoriteProfessional {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
}

// User favorite get endpoint
export async function getUserFavorites(): Promise<
  ApiResponse<FavoriteProfessional[]>
> {
  return fetchPrivateApi<FavoriteProfessional[]>("/users/favorites");
}

// User favorite add endpoint
export async function addUserFavorite(
  professionalId: string
): Promise<ApiResponse<FavoriteProfessional>> {
  return fetchPrivateApi<FavoriteProfessional>("/users/favorites", {
    method: "POST",
    data: { company_id: professionalId },
  });
}

// User favorite check endpoint
export async function checkUserFavorite(
  professionalId: string
): Promise<ApiResponse<{ isFavorite: boolean }>> {
  return fetchPrivateApi<{ isFavorite: boolean }>(
    `/users/favorites/${professionalId}/check`
  );
}

export async function removeUserFavorite(
  professionalId: string
): Promise<ApiResponse<null>> {
  return fetchPrivateApi<null>(`/users/favorites/${professionalId}`, {
    method: "DELETE",
  });
}

// User points endpoints
export interface UserPoints {
  total: number;
  history: {
    id: string;
    amount: number;
    reason: string;
    date: string;
  }[];
}

export async function getUserPoints(): Promise<ApiResponse<UserPoints>> {
  return fetchPrivateApi<UserPoints>("/users/points");
}

// User appointment history endpoint
export async function getUserAppointmentHistory(): Promise<
  ApiResponse<string[]>
> {
  return fetchPrivateApi<string[]>("/users/appointments/history");
}
