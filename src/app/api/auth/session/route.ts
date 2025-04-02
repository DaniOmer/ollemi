import { NextResponse, NextRequest } from "next/server";
import { extractToken, createAuthClient } from "@/lib/supabase/client";

/**
 * Session validation endpoint
 *
 * This endpoint allows client-side code to check if a user is authenticated
 * without exposing tokens. It uses HTTP-only cookies for token validation.
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from request cookies (not exposed to client JS)
    const token = extractToken(request);

    if (!token) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    // Create an authenticated Supabase client
    const supabaseWithAuth = createAuthClient(token);

    // Validate the token by getting the user
    const { data, error } = await supabaseWithAuth.auth.getUser();

    if (error || !data.user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    // Return user data without exposing tokens
    return NextResponse.json({
      authenticated: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || "client",
        onboarding_completed:
          data.user.user_metadata?.onboarding_completed || false,
      },
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  }
}
