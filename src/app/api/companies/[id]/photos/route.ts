import { NextResponse } from "next/server";
import {
  supabase,
  extractToken,
  createAuthClient,
} from "@/lib/supabase/client";

// GET /api/companies/[id]/photos
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("company_id", id);

  if (error && error.code !== "PGRST116") {
    console.error(
      "Something went wrong when trying to fetch photos for company",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } else if (error && error.code === "PGRST116") {
    return NextResponse.json(
      { error: "No photos found for company" },
      { status: 404 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}

// POST /api/companies/[id]/photos
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const { photoUrl } = await request.json();

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

  const { data, error } = await supabaseWithAuth
    .from("photos")
    .insert({ company_id: id, url: photoUrl });

  if (error) {
    console.error("Error inserting photo", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}
