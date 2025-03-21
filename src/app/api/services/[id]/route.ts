import { NextResponse } from "next/server";
import {
  supabase,
  extractToken,
  createAuthClient,
} from "@/lib/supabase/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch service" },
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
    const token = extractToken(request);

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const supabaseWithAuth = createAuthClient(token);

    // Get the user with the token
    const { data: userData, error: authError } =
      await supabaseWithAuth.auth.getUser();

    if (authError || !userData.user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 }
      );
    }

    // First get the service to check ownership
    const { data: serviceData, error: serviceError } = await supabaseWithAuth
      .from("services")
      .select("pro_id")
      .eq("id", id)
      .single();

    if (serviceError) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Ensure the user owns this service
    if (serviceData.pro_id !== userData.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to update this service" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const { data, error } = await supabaseWithAuth
      .from("services")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update service" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Await the params to properly resolve them
    const { id } = await params;
    const token = extractToken(request);

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const supabaseWithAuth = createAuthClient(token);

    // Get the user with the token
    const { data: userData, error: authError } =
      await supabaseWithAuth.auth.getUser();

    if (authError || !userData.user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 }
      );
    }

    // First get the service to check ownership
    const { data: serviceData, error: serviceError } = await supabaseWithAuth
      .from("services")
      .select("pro_id")
      .eq("id", id)
      .single();

    if (serviceError) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Ensure the user owns this service
    if (serviceData.pro_id !== userData.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this service" },
        { status: 403 }
      );
    }

    const { error } = await supabaseWithAuth
      .from("services")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete service" },
      { status: 500 }
    );
  }
}
