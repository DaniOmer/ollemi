import { NextResponse } from "next/server";
import { extractToken, createAuthClient } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    // Get token from the request
    const token = extractToken(request);
    if (!token) return NextResponse.json({ user: null }, { status: 401 });

    // Create a new Supabase client with the token
    const supabaseWithAuth = createAuthClient(token);

    // Get the user with the token
    const { data, error } = await supabaseWithAuth.auth.getUser();

    if (error) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    if (!data.user) {
      return NextResponse.json({ user: null });
    }

    // Get additional user data from the users table using the authenticated client
    const { data: userData, error: userError } = await supabaseWithAuth
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      return NextResponse.json(
        { user: { id: data.user.id, email: data.user.email } },
        { status: 200 }
      );
    }

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching user data" },
      { status: 500 }
    );
  }
}
