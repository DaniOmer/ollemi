import { NextResponse } from "next/server";
import { extractToken, createAuthClient } from "@/lib/supabase/client";

export async function POST(request: Request) {
  try {
    // Get token from the request
    const token = extractToken(request);
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Create a new Supabase client with the token
    const supabaseWithAuth = createAuthClient(token);

    // Get the user with the token
    const { data, error } = await supabaseWithAuth.auth.getUser();

    if (error || !data.user) {
      console.error("Unauthorized access:", error);
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const requestData = await request.json();

    // Check if user already has a company
    const { data: existingCompany, error: queryError } = await supabaseWithAuth
      .from("companies")
      .select("id")
      .eq("user_id", data.user.id)
      .single();

    let companyId;

    if (existingCompany) {
      // User already has a company, use that instead of creating a new one
      console.log("User already has a company, using existing one");
      companyId = existingCompany.id;

      // Update existing company information
      const { error: updateError } = await supabaseWithAuth
        .from("companies")
        .update({
          name: requestData.businessName,
          address: requestData.location?.address,
          website: requestData.website,
          team_size: requestData.teamSize,
          industry: requestData.industry,
        })
        .eq("id", companyId);

      if (updateError) {
        console.error("Error updating company:", updateError);
        return NextResponse.json(
          { error: "Failed to update company" },
          { status: 500 }
        );
      }
    } else {
      // Create a new company for the user
      const { data: companyData, error: companyError } = await supabaseWithAuth
        .from("companies")
        .insert({
          name: requestData.businessName,
          address: requestData.location?.address,
          website: requestData.website,
          team_size: requestData.teamSize,
          industry: requestData.industry,
          user_id: data.user.id,
        })
        .select("id")
        .single();

      if (companyError) {
        console.error("Error creating company:", companyError);
        return NextResponse.json(
          { error: "Failed to create company" },
          { status: 500 }
        );
      }

      companyId = companyData.id;

      // Update user metadata with the new company_id
      const { error: updateUserError } = await supabaseWithAuth
        .from("users")
        .update({
          company_id: companyId,
          onboarding_completed: true,
        })
        .eq("id", data.user.id);

      if (updateUserError) {
        console.error("Error updating user metadata:", updateUserError);
        return NextResponse.json(
          { error: "Failed to assign company to user" },
          { status: 500 }
        );
      }
    }

    // Process service categories - regardless of whether company is new or existing
    if (requestData.services && Array.isArray(requestData.services)) {
      // Delete any existing categories for this company to avoid duplicates
      const { error: deleteCategories } = await supabaseWithAuth
        .from("company_categories")
        .delete()
        .eq("company_id", companyId);

      if (deleteCategories) {
        console.error(
          "Error deleting existing category associations:",
          deleteCategories
        );
        return NextResponse.json(
          { error: "Failed to update service categories" },
          { status: 500 }
        );
      }

      // For each service ID selected, create the association
      for (const categoryId of requestData.services) {
        // Create the association between company and category directly using the ID
        const { error: insertError } = await supabaseWithAuth
          .from("company_categories")
          .insert({
            company_id: companyId,
            category_id: categoryId,
            created_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error("Error inserting category association:", insertError);
          return NextResponse.json(
            { error: "Failed to associate service category" },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
    });
  } catch (error: any) {
    console.error("Error completing onboarding:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
