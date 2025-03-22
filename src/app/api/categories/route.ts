import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// Helper function to handle API errors
const handleApiError = (error: any) => {
  console.error("API Error:", error);
  return NextResponse.json(
    { error: "An error occurred while processing your request" },
    { status: 500 }
  );
};

// GET /api/categories
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, image_url");

    if (error) {
      return handleApiError(error);
    }

    // Transform the data to match our interface
    const categories = data.map(
      (category: { id: string; name: string; image_url: string | null }) => ({
        id: category.id,
        name: category.name,
        imageUrl: category.image_url,
      })
    );

    return NextResponse.json(categories);
  } catch (error) {
    return handleApiError(error);
  }
}
