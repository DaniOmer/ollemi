import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(request: Request) {
  const { refresh_token } = await request.json();

  const { data, error } = await supabase.auth.refreshSession(refresh_token);
  console.log("data", data);
  if (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Token refresh failed" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    session: data.session,
  });
}
