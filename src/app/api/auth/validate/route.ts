import { NextResponse, NextRequest } from "next/server";
import { extractToken, createAuthClient } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  try {
    // Get token from the request
    const token = extractToken(request);

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    // Create an authenticated Supabase client
    const supabaseWithAuth = createAuthClient(token);

    // Validate the token by getting the user
    const { data, error } = await supabaseWithAuth.auth.getUser();

    if (error || !data.user) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    // Token is valid
    return NextResponse.json({
      valid: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || "client",
      },
    });
  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json(
      { valid: false, error: "Session validation failed" },
      { status: 500 }
    );
  }
}
