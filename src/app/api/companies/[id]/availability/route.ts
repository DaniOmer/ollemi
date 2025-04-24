import { NextRequest, NextResponse } from "next/server";
import {
  supabase,
  extractToken,
  createAuthClient,
} from "@/lib/supabase/client";

// GET /api/companies/[id]/availability
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the business hours for the company
    const { data, error } = await supabase
      .from("opening_hours")
      .select("*")
      .eq("company_id", id);

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "No business hours found" },
          { status: 200 }
        );
      }
      console.error("Error fetching business hours:", error);
      return NextResponse.json(
        { error: "Failed to fetch business hours" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/companies/[id]/availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/companies/[id]/availability
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { businessHours } = body;

    if (!businessHours || !Array.isArray(businessHours)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Get token from the request
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Create a new Supabase client with the token
    const supabaseWithAuth = createAuthClient(token);

    // Get the user with the token
    const { data: authData, error: authError } =
      await supabaseWithAuth.auth.getUser();

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user has permission to update this company's hours
    const { data: userData, error: userError } = await supabaseWithAuth
      .from("users")
      .select("company_id")
      .eq("id", authData.user.id)
      .single();

    if (userError || !userData || userData.company_id !== id) {
      return NextResponse.json(
        { error: "You don't have permission to update this company's hours" },
        { status: 403 }
      );
    }

    // Delete existing hours
    const { error: deleteError } = await supabaseWithAuth
      .from("opening_hours")
      .delete()
      .eq("company_id", id);

    if (deleteError) {
      console.error("Error deleting existing business hours:", deleteError);
      return NextResponse.json(
        { error: "Failed to update business hours" },
        { status: 500 }
      );
    }

    // Insert new hours
    const { data, error } = await supabaseWithAuth
      .from("opening_hours")
      .insert(
        businessHours.map((hours) => ({
          ...hours,
          company_id: id,
        }))
      )
      .select();

    if (error) {
      console.error("Error inserting new business hours:", error);
      return NextResponse.json(
        { error: "Failed to update business hours" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in PUT /api/companies/[id]/availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
