import { NextResponse } from "next/server";
import { extractToken, createAuthClient } from "@/lib/supabase/client";

export async function POST(request: Request) {
  try {
    // Get token from the request
    const token = extractToken(request);
    if (!token) return NextResponse.json({ user: null }, { status: 401 });

    // Create a new Supabase client with the token
    const supabaseWithAuth = createAuthClient(token);

    // Sign out with the authenticated client
    const { error } = await supabaseWithAuth.auth.signOut();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Delete the authentication cookie
    const response = NextResponse.json({ success: true });
    response.cookies.delete("access_token");
    response.cookies.delete("user");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "An error occurred during logout" },
      { status: 500 }
    );
  }
}
