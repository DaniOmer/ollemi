import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // First, check if the company exists
    const { data: existingCompany, error: fetchError } = await supabase
      .from("companies")
      .select("id, user_id")
      .eq("id", id)
      .single();

    // If not found by ID, try to find by user_id
    let companyId = id;
    let userId = existingCompany?.user_id;

    if (!existingCompany && !fetchError) {
      const { data: companyByUserId, error: userIdError } = await supabase
        .from("companies")
        .select("id, user_id")
        .eq("user_id", id)
        .single();

      if (companyByUserId) {
        companyId = companyByUserId.id;
        userId = id;
      } else if (userIdError) {
        // If no company exists for this user, create one
        const { data: newCompany, error: createError } = await supabase
          .from("companies")
          .insert({
            user_id: id,
            name: body.name || "Company",
            ...body,
            created_at: new Date().toISOString(),
          })
          .select("id, user_id")
          .single();

        if (createError) {
          return NextResponse.json(
            { error: createError.message || "Failed to create company" },
            { status: 500 }
          );
        }

        return NextResponse.json(newCompany);
      }
    }

    // Update the company
    const { data, error } = await supabase
      .from("companies")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", companyId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to update company" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update company" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
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
