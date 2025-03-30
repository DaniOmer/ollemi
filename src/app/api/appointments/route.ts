import { NextResponse } from "next/server";
import { extractToken, createAuthClient } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
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

    // Get user with the authenticated client
    const { data: user, error: userError } =
      await supabaseWithAuth.auth.getUser();

    if (userError || !user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user role using the authenticated client
    const { data: userData, error: roleError } = await supabaseWithAuth
      .from("users")
      .select("role")
      .eq("id", user.user.id)
      .single();

    if (roleError) {
      return NextResponse.json(
        { error: "Error fetching user role" },
        { status: 500 }
      );
    }

    let query = supabaseWithAuth.from("appointments").select("*");

    // If user is a professional, only show their appointments
    if (userData.role === "pro") {
      // Get professional ID
      const { data: proData } = await supabaseWithAuth
        .from("professionals")
        .select("id")
        .eq("user_id", user.user.id)
        .single();

      if (proData) {
        query = query.eq("pro_id", proData.id);
      }
    } else {
      // If user is a client, only show their appointments
      query = query.eq("client_id", user.user.id);
    }

    const { data, error } = await query.order("start_time", {
      ascending: true,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Get appointments error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching appointments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const appointmentData = await request.json();

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

    // Get user with the authenticated client
    const { data: user, error: userError } =
      await supabaseWithAuth.auth.getUser();

    if (userError || !user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Set client_id if authenticated
    appointmentData.client_id = user.user.id;

    // Insert appointment using the authenticated client
    const { data, error } = await supabaseWithAuth
      .from("appointments")
      .insert(appointmentData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Create appointment error:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the appointment" },
      { status: 500 }
    );
  }
}
