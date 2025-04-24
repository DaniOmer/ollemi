import { NextResponse } from "next/server";
import { extractToken, createAuthClient } from "@/lib/supabase/client";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; addressId: string }> }
) {
  const { id, addressId } = await params;
  const body = await request.json();
  console.log("body ", body);

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
    .from("addresses")
    .update(body)
    .eq("id", addressId)
    .select("*")
    .single();

  if (error) {
    console.error(
      "Something went wrong when trying to fetch an address",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}
