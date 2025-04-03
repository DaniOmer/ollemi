import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/client";

/**
 * Token refresh endpoint
 *
 * This endpoint refreshes the access token using the refresh token
 * stored in HTTP-only cookies. It then sets new cookies with the refreshed tokens.
 */
export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookies
    const refreshToken = request.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { authenticated: false, error: "No refresh token" },
        { status: 401 }
      );
    }

    // Exchange the refresh token for a new access token
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session || !data.user) {
      // Clear all auth cookies on refresh failure
      const response = NextResponse.json(
        { authenticated: false, error: "Token refresh failed" },
        { status: 401 }
      );

      response.cookies.set({
        name: "access_token",
        value: "",
        httpOnly: true,
        path: "/",
        maxAge: 0,
      });

      response.cookies.set({
        name: "refresh_token",
        value: "",
        httpOnly: true,
        path: "/",
        maxAge: 0,
      });

      response.cookies.set({
        name: "auth_state",
        value: "",
        httpOnly: false,
        path: "/",
        maxAge: 0,
      });

      return response;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 401 });
    }

    // Set new cookies with the refreshed tokens
    const response = NextResponse.json({
      authenticated: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || "client",
        onboarding_completed: userData.onboarding_completed || false,
        company_id: userData.company_id || null,
      },
    });

    // Set the new access token cookie
    response.cookies.set({
      name: "access_token",
      value: data.session.access_token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60, // 60 minutes
      sameSite: "lax",
    });

    // Update the refresh token cookie if a new one was provided
    if (data.session.refresh_token) {
      response.cookies.set({
        name: "refresh_token",
        value: data.session.refresh_token,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: "lax",
      });
    }

    // Update the auth state cookie for middleware
    response.cookies.set({
      name: "auth_state",
      value: JSON.stringify({
        authenticated: true,
        id: data.user.id,
        role: userData.role || "client",
        onboarding_completed: userData.onboarding_completed || false,
      }),
      httpOnly: false,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Token refresh failed" },
      { status: 500 }
    );
  }
}
