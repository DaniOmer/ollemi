import { NextResponse } from "next/server";
import { extractToken, createAuthClient } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    // Get token from the request
    const token = extractToken(request);
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Create a new Supabase client with the token
    const supabaseWithAuth = createAuthClient(token);

    // Get the user with the token
    const { data, error } = await supabaseWithAuth.auth.getUser();

    if (error || !data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile from the users table
    const { data: profile, error: profileError } = await supabaseWithAuth
      .from("users")
      .select("id, first_name, last_name, email, phone, avatar_url, created_at")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return NextResponse.json(
        { error: "Error fetching user profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Get user profile error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching user profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Get token from the request
    const token = extractToken(request);
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Create a new Supabase client with the token
    const supabaseWithAuth = createAuthClient(token);

    // Get the user with the token
    const { data, error } = await supabaseWithAuth.auth.getUser();

    if (error || !data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const body = await request.json();

    // Update user profile
    const { data: profile, error: updateError } = await supabaseWithAuth
      .from("users")
      .update({
        first_name: body.first_name,
        last_name: body.last_name,
        phone: body.phone,
        avatar_url: body.avatar_url,
      })
      .eq("id", data.user.id)
      .select("id, first_name, last_name, email, phone, avatar_url, created_at")
      .single();

    if (updateError) {
      console.error("Error updating user profile:", updateError);
      return NextResponse.json(
        { error: "Error updating user profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Update user profile error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating user profile" },
      { status: 500 }
    );
  }
}
