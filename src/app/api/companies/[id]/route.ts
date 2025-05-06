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
  try {
    const { id } = await params;

    // Fetch company with all related data
    const { data: company, error } = await supabase
      .from("companies")
      .select(
        `
        *,
        addresses (
          id,
          formatted_address,
          street_number,
          street_name,
          city,
          postal_code,
          country,
          state,
          latitude,
          longitude
        ),
        services (
          id,
          name,
          description,
          price,
          duration,
          category
        ),
        opening_hours (
          id,
          day_of_week,
          open,
          start_time,
          end_time,
          break_start_time,
          break_end_time
        ),
        company_categories (
          category:categories (
            id,
            name
          )
        ),
        photos (
          id,
          url,
          alt,
          featured
        ),
        reviews (
          id,
          rating,
          review,
          user_id,
          created_at
        )
      `
      )
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.log("error ", error);
      // PGRST116 is "no rows returned"
      return NextResponse.json(
        { error: "Error fetching user company" },
        { status: 500 }
      );
    }

    if (error) {
      // Check if the error is due to no results found
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: error.message || "Failed to fetch company" },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const transformedCompany = {
      ...company,
      photos: company.photos || [],
      services: company.services || [],
      addresses: company.addresses || {},
      opening_hours:
        company.opening_hours?.reduce((acc: any, curr: any) => {
          acc[curr.day_of_week] = {
            open: curr.open,
            start: curr.start_time,
            end: curr.end_time,
            break_start: curr.break_start_time,
            break_end: curr.break_end_time,
          };
          return acc;
        }, {}) || {},
      categories:
        company.company_categories?.map((cc: any) => cc.category) || [],
    };

    return NextResponse.json(transformedCompany);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch company" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // First, check if the company exists
    const { data: existingCompany, error: fetchError } = await supabaseWithAuth
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (!existingCompany && !fetchError) {
      console.log("Company not found ", fetchError);
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Update the company
    const { data, error } = await supabaseWithAuth
      .from("companies")
      .update(body)
      .eq("id", existingCompany.id)
      .select("*")
      .single();

    if (error) {
      console.log("Error updating company ", error);
      return NextResponse.json(
        { error: error.message || "Failed to update company" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.log("error ", error);
    return NextResponse.json(
      { error: error.message || "Failed to update company" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete the company
    const { error } = await supabase.from("companies").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to delete company" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete company" },
      { status: 500 }
    );
  }
}
