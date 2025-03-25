import { NextResponse } from "next/server";
import { extractToken, createAuthClient } from "@/lib/supabase/client";

export async function POST(request: Request) {
  try {
    const token = extractToken(request);
    const body = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const supabaseWithAuth = createAuthClient(token);

    // Get the user with the token
    const { data: authUser, error: authError } =
      await supabaseWithAuth.auth.getUser();

    if (authError || !authUser.user) {
      console.error("Invalid authentication", authError);
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 }
      );
    }

    const { data: userData, error: userError } = await supabaseWithAuth
      .from("users")
      .select("*")
      .eq("id", authUser.user.id)
      .single();

    if (userError) {
      console.error("User not found", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("body", body);
    console.log("userData", userData);
    // Ensure the pro_id matches the authenticated user
    if (body.company_id !== userData.company_id) {
      return NextResponse.json(
        { error: "Unauthorized to create service for another professional" },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseWithAuth
      .from("services")
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create service" },
      { status: 500 }
    );
  }
}
