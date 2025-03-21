import { NextResponse } from "next/server";
import { extractToken, createAuthClient } from "@/lib/supabase/client";

export async function POST(request: Request) {
  try {
    const token = extractToken(request);

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const supabaseWithAuth = createAuthClient(token);

    // Get the user with the token
    const { data: userData, error: authError } =
      await supabaseWithAuth.auth.getUser();

    if (authError || !userData.user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Ensure the pro_id matches the authenticated user
    if (body.pro_id !== userData.user.id) {
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
