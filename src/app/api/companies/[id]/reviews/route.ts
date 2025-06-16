import { NextRequest, NextResponse } from "next/server";
import {
  supabase,
  extractToken,
  createAuthClient,
} from "@/lib/supabase/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("reviews")
    .select("*, user:users(first_name, last_name)")
    .eq("company_id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = extractToken(request);
  const { id } = await params;
  const body = await request.json();

  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabaseWithAuth = createAuthClient(token);

  if (!body.rating || !body.comment) {
    return NextResponse.json(
      { error: "Rating and comment are required" },
      { status: 400 }
    );
  }

  const { data: userData, error: userError } =
    await supabaseWithAuth.auth.getUser();
  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  const { data, error } = await supabaseWithAuth.from("reviews").insert({
    company_id: id,
    user_id: userData.user?.id,
    rating: body.rating,
    comment: body.comment,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate the new rating for the company
  const { data: company_rating, error: company_rating_error } =
    await supabaseWithAuth
      .from("reviews")
      .select(`average_ratings:rating.avg()`)
      .eq("company_id", id)
      .single();

  if (company_rating_error) {
    console.error("Error calculating company rating", company_rating_error);
    return NextResponse.json(
      { error: company_rating_error.message },
      { status: 500 }
    );
  }

  // Update the company with the new rating
  const { data: company_data, error: company_data_error } =
    await supabaseWithAuth
      .from("companies")
      .update({ rating: company_rating.average_ratings })
      .eq("id", id);

  if (company_data_error) {
    console.error("Error updating company rating", company_data_error);
    return NextResponse.json(
      { error: company_data_error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
