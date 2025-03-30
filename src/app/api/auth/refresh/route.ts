import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { error: "Refresh token is missing" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });
  if (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Token refresh failed" },
      { status: 400 }
    );
  }

  // Set the new access token in the cookie
  const newAccessToken = data.session?.access_token;
  const newRefreshToken = data.session?.refresh_token;
  if (newAccessToken && newRefreshToken) {
    const cookieStore = await cookies();
    cookieStore.set("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semaine
      sameSite: "lax",
    });
    cookieStore.set("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semaine
      sameSite: "lax",
    });
  }

  return NextResponse.json({
    access_token: newAccessToken,
    refresh_token: newRefreshToken,
  });
}
