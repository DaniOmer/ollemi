import { NextResponse } from "next/server";
import { extractToken, createAuthClient } from "@/lib/supabase/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string; serviceId: string } }
) {
  const { id, serviceId } = await params;
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
    .select("*")
    .eq("id", serviceId)
    .single();

  if (error) {
    console.error("Something went wrong when trying to fetch a service", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}
