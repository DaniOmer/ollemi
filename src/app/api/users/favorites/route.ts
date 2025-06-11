import { NextResponse } from "next/server";
import { extractToken, createAuthClient } from "@/lib/supabase/client";

export async function GET(request: Request) {
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

    // Get user favorites
    const { data: favorites, error: favoritesError } = await supabaseWithAuth
      .from("user_favorites")
      .select(
        `
        id,
        company_id,
        companies (
          id,
          name,
          description,
          phone,
          website,
          address:addresses (
          id,
          formatted_address
          )
        )
      `
      )
      .eq("user_id", data.user.id);

    if (favoritesError && favoritesError.code !== "PGRST116") {
      console.error("Error fetching user favorites:", favoritesError);
      return NextResponse.json(
        { error: "Error fetching user favorites" },
        { status: 500 }
      );
    }

    // Transform data to match the expected format
    const formattedFavorites = favorites?.map((favorite: any) => ({
      id: favorite.company_id,
      name: favorite.companies?.name || "",
      description: favorite.companies?.description || "",
      address: favorite.companies?.address?.formatted_address || "",
      phone: favorite.companies?.phone || "",
      website: favorite.companies?.website || "",
    }));

    return NextResponse.json(formattedFavorites);
  } catch (error) {
    console.error("Get user favorites error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching user favorites" },
      { status: 500 }
    );
  }
}

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

    // Get request body
    const body = await request.json();

    if (!body.company_id) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      );
    }

    // Check if company exists
    const { data: company, error: companyError } = await supabaseWithAuth
      .from("companies")
      .select("id, name, description")
      .eq("id", body.company_id)
      .single();

    if (companyError || !company) {
      console.error("Company not found:", companyError);
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Check if already favorited
    const { data: existingFavorite, error: checkError } = await supabaseWithAuth
      .from("user_favorites")
      .select("id")
      .eq("user_id", data.user.id)
      .eq("company_id", body.company_id)
      .single();

    if (existingFavorite) {
      // Already favorited, return the professional info
      return NextResponse.json({
        id: company.id,
        name: company.name || "",
        description: company.description || "",
      });
    }

    // Add to favorites
    const { data: favorite, error: favoriteError } = await supabaseWithAuth
      .from("user_favorites")
      .insert({
        user_id: data.user.id,
        company_id: body.company_id,
      })
      .select("id");

    if (favoriteError) {
      console.error("Error adding user favorite:", favoriteError);
      return NextResponse.json(
        { error: "Error adding user favorite" },
        { status: 500 }
      );
    }

    // Return the professional info
    return NextResponse.json({
      id: company.id,
      name: company.name || "",
      description: company.description || "",
    });
  } catch (error) {
    console.error("Add user favorite error:", error);
    return NextResponse.json(
      { error: "An error occurred while adding user favorite" },
      { status: 500 }
    );
  }
}
