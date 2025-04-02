import { createClient, User, Session } from "@supabase/supabase-js";
import { StorageError } from "@supabase/storage-js";
import { NextRequest } from "next/server";
/**
 * Supabase client configuration
 *
 * This file provides a centralized interface for all Supabase interactions.
 * It's designed with abstraction in mind to facilitate future migration to FastAPI.
 */

// Environment variables for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for auth responses to maintain consistency across the application
export type AuthResponse = {
  user: User | null;
  session: Session | null;
  error?: string;
};

export type StorageResponse = {
  path?: string;
  url?: string;
  error?: string;
};

/**
 * Authentication functions
 * These functions abstract the Supabase auth API to make future migration easier
 */

/**
 * Valide un token JWT
 * Cette fonction vérifie la structure et l'expiration d'un token JWT
 * @param token - Le token à valider
 * @returns true si le token est valide, false sinon
 */
export function validateToken(token: string): boolean {
  try {
    // Vérifier la structure basique du JWT (3 parties séparées par des points)
    const parts = token.split(".");
    if (parts.length !== 3) {
      return false;
    }

    // Décoder le payload (deuxième partie du token)
    const payload = JSON.parse(atob(parts[1]));

    // Vérifier que le token n'est pas expiré
    const expiry = payload.exp * 1000; // Convertir en millisecondes

    if (Date.now() >= expiry) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
}

export function extractToken(request: Request | NextRequest): string | null {
  // Extraire le token du header Authorization
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    // Valider le token avant de le retourner
    if (validateToken(token)) {
      return token;
    }
  }

  // Si NextRequest, vérifier aussi les cookies
  if ("cookies" in request) {
    const token = request.cookies.get("access_token")?.value;
    if (token && validateToken(token)) {
      return token;
    }
  }

  return null;
}

/**
 * Remove token from cookie
 * This function is used to remove the token from the cookie
 * @param req - The request to remove the token from
 * @returns The request without the token
 */
export async function removeTokenFromCookie(
  req: NextRequest
): Promise<NextRequest> {
  // The actual cookie removal should be handled at the page/route level
  return req;
}

/**
 * Extract user from cookie
 * This function is used to extract the user from the cookie
 * @param req - The request to extract the user from
 * @returns The user from the cookie
 */
export function extractUserFromCookie(req: NextRequest): {
  id?: string;
  email?: string;
  role?: string;
  onboarding_completed?: boolean;
} | null {
  try {
    const userCookie = req.cookies.get("user")?.value;
    if (!userCookie) return null;
    return JSON.parse(userCookie);
  } catch (error) {
    console.error("Error extracting user from cookie:", error);
    return null;
  }
}

/**
 * Extract authentication state from cookie
 * This function is used to extract the authentication state from the cookie
 * @param req - The request to extract the authentication state from
 * @returns The authentication state from the cookie
 */
export function extractAuthStateFromCookie(req: NextRequest): {
  authenticated?: boolean;
  id?: string;
  role?: string;
  onboarding_completed?: boolean;
} | null {
  try {
    const authStateCookie = req.cookies.get("auth_state")?.value;
    if (!authStateCookie) {
      // Fallback to user cookie for backward compatibility
      const userCookie = req.cookies.get("user")?.value;
      if (!userCookie) return null;

      const userData = JSON.parse(userCookie);
      return {
        authenticated: true,
        id: userData.id,
        role: userData.role,
        onboarding_completed: userData.onboarding_completed,
      };
    }
    return JSON.parse(authStateCookie);
  } catch (error) {
    console.error("Error extracting auth state from cookie:", error);
    return null;
  }
}

/**
 * Remove user from cookie
 * This function is used to remove the user from the cookie
 * @param req - The request to remove the user from
 * @returns The request without the user
 */
export async function removeUserFromCookie(
  req: NextRequest
): Promise<NextRequest> {
  // The actual cookie removal should be handled at the page/route level
  return req;
}

/**
 * Create a new Supabase client with the given token
 * This function is used to create a new Supabase client with the given token
 * @param token - The token to use for the new Supabase client
 * @returns A new Supabase client with the given token
 */
export function createAuthClient(token: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

/**
 * Get authenticated user
 * This function is used to get the authenticated user
 * @param client - The client to get the authenticated user from
 * @returns The authenticated user
 */
export async function getAuthenticatedUser(
  client: ReturnType<typeof createClient>
) {
  const { data, error } = await client.auth.getUser();
  return { user: data?.user, error };
}

/**
 * Email/password signup
 * This function is used to sign up with email and password
 * @param email - The email to sign up with
 * @param password - The password to sign up with
 * @returns The authenticated user
 */
export const signUp = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    return {
      user: data.user,
      session: data.session,
    };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      user: null,
      session: null,
      error:
        error instanceof Error
          ? error.message
          : "An unknown error occurred during signup",
    };
  }
};

/**
 * Email/password login
 * This function is used to login with email and password
 * @param email - The email to login with
 * @param password - The password to login with
 * @returns The authenticated user
 */
export const signIn = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return {
      user: data.user,
      session: data.session,
    };
  } catch (error) {
    console.error("Sign in error:", error);
    return {
      user: null,
      session: null,
      error:
        error instanceof Error
          ? error.message
          : "An unknown error occurred during sign in",
    };
  }
};

/**
 * Google OAuth login
 * This function is used to login with Google OAuth
 * @returns The authenticated user
 */
export const signInWithGoogle = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  } catch (error) {
    console.error("Google sign in error:", error);
    throw error;
  }
};

/**
 * Sign out
 * This function is used to sign out
 * @returns The authenticated user
 */
export const signOut = async (): Promise<{ error?: string }> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return {};
  } catch (error) {
    console.error("Sign out error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "An unknown error occurred during sign out",
    };
  }
};

/**
 * Get current session
 * This function is used to get the current session
 * @returns The current session
 */
export const getSession = async (): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    return {
      user: data.session?.user || null,
      session: data.session || null,
    };
  } catch (error) {
    console.error("Get session error:", error);
    return {
      user: null,
      session: null,
      error:
        error instanceof Error
          ? error.message
          : "An unknown error occurred getting session",
    };
  }
};

/**
 * Storage functions
 * These functions abstract the Supabase storage API to make future migration easier
 */

/**
 * Upload file to storage
 * This function is used to upload a file to storage
 * @param bucket - The bucket to upload the file to
 * @param path - The path to upload the file to
 * @param file - The file to upload
 * @returns The uploaded file
 */
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
): Promise<StorageResponse> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) throw error;

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error("File upload error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "An unknown error occurred during file upload",
    };
  }
};

/**
 * Delete file from storage
 * This function is used to delete a file from storage
 * @param bucket - The bucket to delete the file from
 * @param path - The path to delete the file from
 * @returns The deleted file
 */
export const deleteFile = async (
  bucket: string,
  path: string
): Promise<{ error?: string }> => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) throw error;

    return {};
  } catch (error) {
    console.error("File deletion error:", error);
    return {
      error:
        error instanceof StorageError
          ? error.message
          : "An unknown error occurred during file deletion",
    };
  }
};

/**
 * Get public URL for a file
 * This function is used to get the public URL for a file
 * @param bucket - The bucket to get the public URL for
 * @param path - The path to get the public URL for
 * @returns The public URL for the file
 */
export const getFileUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return data.publicUrl;
};
