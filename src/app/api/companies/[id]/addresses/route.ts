import { NextRequest, NextResponse } from "next/server";
import {
  supabase,
  extractToken,
  createAuthClient,
} from "@/lib/supabase/client";

// GET /api/companies/[id]/addresses
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    // Get the addresses for the company
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("company_id", id);

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "No addresses found" },
          { status: 200 }
        );
      }
      console.error("Error fetching addresses:", error);
      return NextResponse.json(
        { error: "Failed to fetch addresses" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/companies/[id]/addresses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/companies/[id]/addresses
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

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

    // Check if user has permission to create this company's addresses
    const { data: userData, error: userError } = await supabaseWithAuth
      .from("users")
      .select("company_id")
      .eq("id", authData.user.id)
      .single();

    if (userError || !userData || userData.company_id !== id) {
      return NextResponse.json(
        { error: "You don't have permission to create addresses" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const { data, error } = await supabaseWithAuth
      .from("addresses")
      .insert({
        ...body,
        company_id: id,
      })
      .select("*");

    if (error) {
      console.error("Error creating address:", error);
      return NextResponse.json(
        { error: "Failed to create address" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in POST /api/companies/[id]/addresses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/companies/[id]/addresses/[addressId]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; addressId: string } }
) {
  try {
    const { id, addressId } = await params;

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

    // Check if user has permission to update this company's addresses
    const { data: userData, error: userError } = await supabaseWithAuth
      .from("users")
      .select("company_id")
      .eq("id", authData.user.id)
      .single();

    if (userError || !userData || userData.company_id !== id) {
      return NextResponse.json(
        { error: "You don't have permission to update addresses" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const { data, error } = await supabaseWithAuth
      .from("addresses")
      .update(body)
      .match({ id: addressId })
      .select("*");

    if (error) {
      console.error("Error updating address:", error);
      return NextResponse.json(
        { error: "Failed to update address" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "Error in PUT /api/companies/[id]/addresses/[addressId]:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
