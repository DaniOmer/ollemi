import { NextResponse } from "next/server";
import { extractToken, createAuthClient } from "@/lib/supabase/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  // Get token from the request
  const token = extractToken(request);
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAuthClient(token);

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("company_id", id);

  if (error) {
    console.error(
      "Something went wrong when trying to fetch services for company",
      id
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}
