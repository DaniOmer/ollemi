import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const service = searchParams.get("service");
    const location = searchParams.get("location");
    const date = searchParams.get("date");

    let query = supabase.from("companies").select(
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
    );

    // Filter by service name if provided
    if (service) {
      query = query.filter("services.name", "ilike", `%${service}%`);
    }

    // Filter by location if provided
    if (location) {
      query = query.filter(
        "addresses.formatted_address",
        "ilike",
        `%${location}%`
      );
    }

    // We'll handle date filtering on the client side since it requires
    // checking availability which is more complex

    const { data, error } = await query;

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If date is provided, we could filter companies based on availability
    // This would require additional logic to check availability for the given date
    // For now, we'll just return all matching companies

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to search companies" },
      { status: 500 }
    );
  }
}
