import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  try {
    const { data, error } = await supabase.from("companies").select(
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

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // This endpoint is not directly used for creating companies
    // Companies are created automatically when a pro user is created
    return NextResponse.json(
      { error: "Companies are created through user registration" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
