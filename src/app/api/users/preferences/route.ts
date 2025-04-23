import { NextResponse } from "next/server";
import { extractToken, createAuthClient } from "@/lib/supabase/client";

// GET retrieve user preferences /api/users/preferences
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

    // Get user preferences from the user_preferences table
    const { data: preferences, error: preferencesError } =
      await supabaseWithAuth
        .from("user_preferences")
        .select("theme, language, notifications_enabled")
        .eq("user_id", data.user.id)
        .single();

    if (preferencesError && preferencesError.code !== "PGRST116") {
      return NextResponse.json(
        { error: "Error fetching user preferences" },
        { status: 500 }
      );
    }

    if (!preferences) {
      return NextResponse.json(
        { error: "User preferences not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Get user preferences error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching user preferences" },
      { status: 500 }
    );
  }
}

// POST /api/users/preferences
export async function POST(request: Request) {
  try {
    const token = extractToken(request);
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabaseWithAuth = createAuthClient(token);

    const { data, error } = await supabaseWithAuth.auth.getUser();

    if (error || !data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: existingPrefs, error: checkError } = await supabaseWithAuth
      .from("user_preferences")
      .select("id")
      .eq("user_id", data.user.id)
      .single();

    if (checkError) {
      console.error("Error checking user preferences:", checkError);
      return NextResponse.json(
        { error: "Error checking user preferences" },
        { status: 500 }
      );
    }

    if (existingPrefs) {
      return NextResponse.json(
        { error: "User preferences already exist" },
        { status: 400 }
      );
    }

    // Get request body
    const body = await request.json();

    const { data: newPreferences, error: insertError } = await supabaseWithAuth
      .from("user_preferences")
      .insert({
        user_id: data.user.id,
        notifications_enabled: body.notifications_enabled,
        theme: body.theme,
        language: body.language,
      })
      .select("notifications_enabled, theme, language")
      .single();

    if (insertError) {
      console.error("Error creating user preferences:", insertError);
      return NextResponse.json(
        { error: "Error creating user preferences" },
        { status: 500 }
      );
    }

    return NextResponse.json(newPreferences);
  } catch (error) {
    console.error("Create user preferences error:", error);
    return NextResponse.json(
      { error: "An error occurred while creating user preferences" },
      { status: 500 }
    );
  }
}
// PUT /api/users/preferences
export async function PUT(request: Request) {
  try {
    const token = extractToken(request);
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabaseWithAuth = createAuthClient(token);
    const { data, error } = await supabaseWithAuth.auth.getUser();

    if (error || !data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { data: existingPrefs, error: checkError } = await supabaseWithAuth
      .from("user_preferences")
      .select("id")
      .eq("user_id", data.user.id)
      .single();

    let result;

    if (!existingPrefs) {
      const { data: newPreferences, error: insertError } =
        await supabaseWithAuth
          .from("user_preferences")
          .insert({
            user_id: data.user.id,
            notifications_enabled:
              body.notifications_enabled !== undefined
                ? body.notifications_enabled
                : true,
            theme: body.theme,
            language: body.language,
          })
          .select("notifications_enabled, theme, language")
          .single();

      if (insertError) {
        console.error("Error creating user preferences:", insertError);
        return NextResponse.json(
          { error: "Error creating user preferences" },
          { status: 500 }
        );
      }

      result = newPreferences;
    } else {
      const { data: updatedPreferences, error: updateError } =
        await supabaseWithAuth
          .from("user_preferences")
          .update({
            notifications_enabled:
              body.notifications_enabled !== undefined
                ? body.notifications_enabled
                : undefined,
            theme: body.theme,
            language: body.language,
          })
          .eq("user_id", data.user.id)
          .select("notifications_enabled, theme, language")
          .single();

      if (updateError) {
        console.error("Error updating user preferences:", updateError);
        return NextResponse.json(
          { error: "Error updating user preferences" },
          { status: 500 }
        );
      }

      result = updatedPreferences;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Update user preferences error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating user preferences" },
      { status: 500 }
    );
  }
}
