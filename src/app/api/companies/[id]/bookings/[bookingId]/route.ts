import { NextResponse } from "next/server";
import { extractToken, createAuthClient } from "@/lib/supabase/client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; bookingId: string }> }
) {
  try {
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const supabaseWithAuth = createAuthClient(token);

    const { id: companyId, bookingId } = await params;

    if (!companyId || !bookingId) {
      return NextResponse.json(
        { error: "Company ID and booking ID are required" },
        { status: 400 }
      );
    }

    // REMBEMBER TO DO THE FOLLOWING:
    // - Check if the user is the owner of the company
    // - Check if the user is the client of the booking
    // - Check if the user is the professional of the booking
    const { data, error } = await supabaseWithAuth
      .from("appointments")
      .update({ status: body.status })
      .eq("id", bookingId)
      .eq("company_id", companyId)
      .select(
        `
        *,
        service:services (
          id,
          name,
          duration,
          price
        ),
        customer:users (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `
      )
      .single();

    if (error) {
      console.error("Error updating booking:", error);
      return NextResponse.json(
        { error: "Error updating booking" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Error updating booking" },
      { status: 500 }
    );
  }
}
