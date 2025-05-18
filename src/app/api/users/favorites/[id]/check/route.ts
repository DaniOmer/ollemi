import { NextResponse } from "next/server";
import { extractToken, createAuthClient } from "@/lib/supabase/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

  // Check if the professional is in the user's favorites
  const { data: favorite, error: favoriteError } = await supabaseWithAuth
    .from("user_favorites")
    .select("id")
    .eq("user_id", data.user.id)
    .eq("company_id", id)
    .single();

  if (favoriteError && favoriteError.code !== "PGRST116") {
    console.error("Error checking user favorite:", favoriteError);
    return NextResponse.json(
      { error: "Error checking user favorite" },
      { status: 500 }
    );
  }

  return NextResponse.json({ isFavorite: favorite !== null });
}
