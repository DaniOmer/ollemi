import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Await the params to properly resolve them
    const { id } = await params;

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("pro_id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch services" },
      { status: 500 }
    );
  }
}
