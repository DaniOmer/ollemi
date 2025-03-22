import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!data.user.user_metadata.company_id) {
      return NextResponse.json(
        { error: "User has no company assigned" },
        { status: 400 }
      );
    }

    if (!data.user.user_metadata.company_id) {
      console.error("User has no company_id");
      return NextResponse.json(
        { error: "User has no company assigned" },
        { status: 400 }
      );
    }

    const requestData = await request.json();

    // Update the company with the onboarding data
    const { error: updateCompanyError } = await supabase
      .from("companies")
      .update({
        name: requestData.businessName || undefined,
        address: requestData.location?.address || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.user.user_metadata.company_id);

    if (updateCompanyError) {
      console.error("Error updating company:", updateCompanyError);
      return NextResponse.json(
        { error: "Failed to update company data" },
        { status: 500 }
      );
    }

    // Mark user's onboarding as completed
    const { error: updateUserError } = await supabase
      .from("users")
      .update({
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.user.id);

    if (updateUserError) {
      console.error("Error updating user:", updateUserError);
      return NextResponse.json(
        { error: "Failed to update user data" },
        { status: 500 }
      );
    }

    // Update user metadata in auth.users
    const { error: updateAuthError } = await supabase.auth.updateUser({
      data: {
        onboarding_completed: true,
      },
    });

    if (updateAuthError) {
      console.error("Error updating auth user metadata:", updateAuthError);
      // Continue anyway as this is not critical
    }

    // Process service categories
    if (requestData.services && Array.isArray(requestData.services)) {
      // Delete any existing categories for this company to avoid duplicates
      const { error: deleteCategories } = await supabase
        .from("company_categories")
        .delete()
        .eq("company_id", data.user.user_metadata.company_id);

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

      // For each service selected, find the corresponding category and create the association
      for (const serviceName of requestData.services) {
        // Find the category ID by name
        const { data: categoryData, error: categoryError } = await supabase
          .from("categories")
          .select("id")
          .eq("name", serviceName)
          .single();

        if (categoryError) {
          console.error("Error finding category:", categoryError);
          continue; // Skip this category but continue with others
        }

        if (categoryData && categoryData.id) {
          // Create the association between company and category
          const { error: insertError } = await supabase
            .from("company_categories")
            .insert({
              company_id: data.user.user_metadata.company_id,
              category_id: categoryData.id,
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
    }

    // Store team size
    if (requestData.teamSize) {
      const { error: updateTeamSizeError } = await supabase
        .from("companies")
        .update({
          team_size: requestData.teamSize,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.user.user_metadata.company_id);

      if (updateTeamSizeError) {
        console.error("Error updating team size:", updateTeamSizeError);
        return NextResponse.json(
          { error: "Failed to update team size data" },
          { status: 500 }
        );
      }
    }

    // Store any additional fields if present
    if (requestData.industry) {
      const { error: updateIndustryError } = await supabase
        .from("companies")
        .update({
          industry: requestData.industry,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.user.user_metadata.company_id);

      if (updateIndustryError) {
        console.error("Error updating industry:", updateIndustryError);
        return NextResponse.json(
          { error: "Failed to update industry data" },
          { status: 500 }
        );
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
