import { NextResponse } from "next/server";
import { extractToken, createAuthClient } from "@/lib/supabase/client";

// DELETE /api/users/favorites/:id
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // Remove from favorites
    const { data: deleteResult, error: deleteError } = await supabaseWithAuth
      .from("user_favorites")
      .delete()
      .eq("user_id", data.user.id)
      .eq("company_id", id);

    if (deleteError) {
      console.error("Error removing user favorite:", deleteError);
      return NextResponse.json(
        { error: "Error removing user favorite" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove user favorite error:", error);
    return NextResponse.json(
      { error: "An error occurred while removing user favorite" },
      { status: 500 }
    );
  }
}
