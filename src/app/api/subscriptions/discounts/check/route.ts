import { NextRequest, NextResponse } from "next/server";
import {
  supabase,
  createAuthClient,
  extractToken,
} from "@/lib/supabase/client";

export async function POST(request: NextRequest) {
  const { code } = await request.json();

  // Check if the discount code is valid
  const { data, error } = await supabase
    .from("discounts")
    .select("*")
    .eq("code", code)
    .single();

  if (error && error.code === "PGRST116") {
    console.error("Error fetching discount:", error);
    return NextResponse.json(
      { message: "Discount not found", is_valid: false },
      { status: 404 }
    );
  }

  // Check if the discount is expired
  if (data.discount_expiration_date < new Date()) {
    return NextResponse.json(
      { message: "Discount expired", is_valid: false },
      { status: 400 }
    );
  }

  // Check if the user is authenticated
  const token = extractToken(request);
  if (token) {
    const supabaseWithAuth = createAuthClient(token);

    // Get the current user
    const {
      data: { user },
    } = await supabaseWithAuth.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized access", is_valid: false },
        { status: 401 }
      );
    }

    // Check if user has already used the discount and if the max_uses has been reached
    if (user) {
      const { data: usageData, error: usageError } = await supabase
        .from("discounts_usage")
        .select("*")
        .eq("discount_id", data.id)
        .eq("user_id", user.id);

      if (usageError && usageError.code !== "PGRST116") {
        console.error("Error fetching discount usage:", usageError);
        return NextResponse.json(
          { message: usageError.message, is_valid: false },
          { status: 500 }
        );
      }

      if (usageData && usageData.length >= data.max_uses) {
        return NextResponse.json(
          { message: "Discount max uses reached", is_valid: false },
          { status: 400 }
        );
      }
    }
  }

  return NextResponse.json({
    discount: data,
    is_valid: true,
    message: "Discount is valid",
  });
}
