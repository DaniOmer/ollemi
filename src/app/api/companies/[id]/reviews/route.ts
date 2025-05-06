import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { id } = await params;

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
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
  const supabase = createRouteHandlerClient({ cookies });
  const { id } = await params;
  const body = await request.json();

  if (!body.rating || !body.review) {
    return NextResponse.json(
      { error: "Rating and review are required" },
      { status: 400 }
    );
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  const { data, error } = await supabase.from("reviews").insert({
    company_id: id,
    user_id: userData.user?.id,
    rating: body.rating,
    review: body.review,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate the new rating for the company
  const { data: company_rating, error: company_rating_error } = await supabase
    .from("reviews")
    .select(`average_ratings:rating.avg()`)
    .eq("company_id", id)
    .single();

  if (company_rating_error) {
    return NextResponse.json(
      { error: company_rating_error.message },
      { status: 500 }
    );
  }

  // Update the company with the new rating
  const { data: company_data, error: company_data_error } = await supabase
    .from("companies")
    .update({ rating: company_rating.average_ratings })
    .eq("id", id);

  if (company_data_error) {
    return NextResponse.json(
      { error: company_data_error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
