import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// GET /api/categories/:id
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from("categories")
      .select("id, name, image_url")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "An error occurred while processing your request" },
        { status: 500 }
      );
    }

    // Transform the data to match our interface
    const category = {
      id: data.id,
      name: data.name,
      imageUrl: data.image_url,
    };

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
