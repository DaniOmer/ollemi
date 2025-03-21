import { NextResponse } from "next/server";
import {
  supabase,
  extractToken,
  createAuthClient,
} from "@/lib/supabase/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from("professionals")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      // If the error is because no rows or multiple rows were returned, return 404
      if (
        error.message.includes("multiple") ||
        error.message.includes("no rows")
      ) {
        return NextResponse.json(
          { error: "Professional not found" },
          { status: 404 }
        );
      }

      // Otherwise, it's an internal server error
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch professional" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
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

    // Ensure user can only update their own profile
    if (userData.user.id !== id) {
      return NextResponse.json(
        { error: "Unauthorized to update this professional" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const { data, error } = await supabaseWithAuth
      .from("professionals")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update professional" },
      { status: 500 }
    );
  }
}
