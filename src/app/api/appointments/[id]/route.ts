import { NextResponse } from "next/server";
import {
  supabase,
  extractToken,
  createAuthClient,
} from "@/lib/supabase/client";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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

    // Get user with the authenticated client
    const { data: user, error: userError } =
      await supabaseWithAuth.auth.getUser();

    if (userError || !user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get appointment using the authenticated client
    const { data, error } = await supabaseWithAuth
      .from("appointments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Check if user has access to this appointment using the authenticated client
    const { data: userData, error: userDataError } = await supabaseWithAuth
      .from("users")
      .select("role")
      .eq("id", user.user.id)
      .single();

    if (userDataError || !userData) {
      return NextResponse.json(
        { error: "Error fetching user data" },
        { status: 500 }
      );
    }

    const isOwner =
      data.client_id === user.user.id ||
      (userData.role === "pro" &&
        data.pro_id ===
          (
            await supabaseWithAuth
              .from("professionals")
              .select("id")
              .eq("user_id", user.user.id)
              .single()
          ).data?.id);

    if (!isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Get appointment error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the appointment" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const appointmentData = await request.json();

    // Get the Authorization header from the request
    const authHeader = request.headers.get("Authorization");
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create a new Supabase client with the token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabaseWithAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Get user with the authenticated client
    const { data: user, error: userError } =
      await supabaseWithAuth.auth.getUser();

    if (userError || !user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has access to update this appointment using the authenticated client
    const { data: existingAppointment, error: fetchError } =
      await supabaseWithAuth
        .from("appointments")
        .select("*")
        .eq("id", id)
        .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 404 });
    }

    const { data: userData, error: userDataError } = await supabaseWithAuth
      .from("users")
      .select("role")
      .eq("id", user.user.id)
      .single();

    if (userDataError || !userData) {
      return NextResponse.json(
        { error: "Error fetching user data" },
        { status: 500 }
      );
    }

    const isOwner =
      existingAppointment.client_id === user.user.id ||
      (userData.role === "pro" &&
        existingAppointment.pro_id ===
          (
            await supabaseWithAuth
              .from("professionals")
              .select("id")
              .eq("user_id", user.user.id)
              .single()
          ).data?.id);

    if (!isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update appointment using the authenticated client
    const { data, error } = await supabaseWithAuth
      .from("appointments")
      .update(appointmentData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Update appointment error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the appointment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get the Authorization header from the request
    const authHeader = request.headers.get("Authorization");
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create a new Supabase client with the token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabaseWithAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Get user with the authenticated client
    const { data: user, error: userError } =
      await supabaseWithAuth.auth.getUser();

    if (userError || !user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has access to delete this appointment using the authenticated client
    const { data: existingAppointment, error: fetchError } =
      await supabaseWithAuth
        .from("appointments")
        .select("*")
        .eq("id", id)
        .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 404 });
    }

    const { data: userData, error: userDataError } = await supabaseWithAuth
      .from("users")
      .select("role")
      .eq("id", user.user.id)
      .single();

    if (userDataError || !userData) {
      return NextResponse.json(
        { error: "Error fetching user data" },
        { status: 500 }
      );
    }

    const isOwner =
      existingAppointment.client_id === user.user.id ||
      (userData.role === "pro" &&
        existingAppointment.pro_id ===
          (
            await supabaseWithAuth
              .from("professionals")
              .select("id")
              .eq("user_id", user.user.id)
              .single()
          ).data?.id);

    if (!isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete appointment using the authenticated client
    const { error } = await supabaseWithAuth
      .from("appointments")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete appointment error:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the appointment" },
      { status: 500 }
    );
  }
}
