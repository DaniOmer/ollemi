import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    // First, try to get the company by ID
    let { data: company, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned" - in this case we just return 0 points
      console.error("Error fetching user points:", error);
      return NextResponse.json(
        { error: "Error fetching user points" },
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

    return NextResponse.json(company);
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
