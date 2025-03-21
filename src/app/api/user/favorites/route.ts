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
        professional_id,
        professionals (
          id,
          business_name,
          address,
          city,
          zipcode,
          phone,
          website
        )
      `
      )
      .eq("user_id", data.user.id);

    if (favoritesError) {
      console.error("Error fetching user favorites:", favoritesError);
      return NextResponse.json(
        { error: "Error fetching user favorites" },
        { status: 500 }
      );
    }

    // Transform data to match the expected format
    const formattedFavorites = favorites.map((favorite: any) => ({
      id: favorite.professional_id,
      businessName: favorite.professionals?.business_name || "",
      address: favorite.professionals?.address || "",
      city: favorite.professionals?.city || "",
      postalCode: favorite.professionals?.postal_code || "",
      country: favorite.professionals?.country || "",
      phone: favorite.professionals?.phone || "",
      email: favorite.professionals?.email || "",
      website: favorite.professionals?.website || "",
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

    if (!body.professionalId) {
      return NextResponse.json(
        { error: "Professional ID is required" },
        { status: 400 }
      );
    }

    // Check if professional exists
    const { data: professional, error: professionalError } =
      await supabaseWithAuth
        .from("professionals")
        .select("id, first_name, last_name, business_name, avatar_url")
        .eq("id", body.professionalId)
        .single();

    if (professionalError || !professional) {
      return NextResponse.json(
        { error: "Professional not found" },
        { status: 404 }
      );
    }

    // Check if already favorited
    const { data: existingFavorite, error: checkError } = await supabaseWithAuth
      .from("user_favorites")
      .select("id")
      .eq("user_id", data.user.id)
      .eq("professional_id", body.professionalId)
      .single();

    if (existingFavorite) {
      // Already favorited, return the professional info
      return NextResponse.json({
        id: professional.id,
        name: `${professional.first_name} ${professional.last_name}`,
        businessName: professional.business_name || "",
        imageUrl: professional.avatar_url || undefined,
      });
    }

    // Add to favorites
    const { data: favorite, error: favoriteError } = await supabaseWithAuth
      .from("user_favorites")
      .insert({
        user_id: data.user.id,
        professional_id: body.professionalId,
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
      id: professional.id,
      name: `${professional.first_name} ${professional.last_name}`,
      businessName: professional.business_name || "",
      imageUrl: professional.avatar_url || undefined,
    });
  } catch (error) {
    console.error("Add user favorite error:", error);
    return NextResponse.json(
      { error: "An error occurred while adding user favorite" },
      { status: 500 }
    );
  }
}
