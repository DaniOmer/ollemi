import { NextResponse } from "next/server";
import {
  supabase,
  extractToken,
  createAuthClient,
} from "@/lib/supabase/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("company_id", id);

  if (error && error.code !== "PGRST116") {
    console.error(
      "Something went wrong when trying to fetch services for company",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } else if (error && error.code === "PGRST116") {
    return NextResponse.json(
      { error: "No services found for company" },
      { status: 404 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const token = extractToken(request);
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  if (userData.company_id !== id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseWithAuth
    .from("services")
    .insert(body)
    .select()
    .single();

  if (error) {
    console.error(
      "Something went wrong when trying to create a service",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
