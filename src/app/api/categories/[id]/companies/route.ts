import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// GET /api/categories/:id/professionals
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    // Fetch companies that belong to this category using the company_categories junction table
    const { data, error } = await supabase
      .from("company_categories")
      .select(
        `
        company:companies (
          id, 
          name, 
          description, 
          user_id,
          address,
          city,
          zipcode,
          phone,
          website,
          instagram,
          facebook,
          services (
            id,
            name,
            description,
            price,
            duration,
            category
          )
        )
      `
      )
      .eq("category_id", id);

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "No professionals found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "An error occurred while processing your request" },
        { status: 500 }
      );
    }

    // Transform the data to match our interface
    const professionals = data.map((item: any) => {
      const company = item.company;
      return {
        id: company.id,
        user_id: company.user_id,
        name: company.name,
        description: company.description,
        address: company.address,
        city: company.city,
        zipcode: company.zipcode,
        phone: company.phone,
        website: company.website,
        instagram: company.instagram,
        facebook: company.facebook,
        imageUrl: company.image_url,
        opening_hours: company.opening_hours,
        services: company.services
          ? company.services.map((service: any) => ({
              id: service.id,
              name: service.name,
              description: service.description,
              price: service.price,
              duration: service.duration,
              category: service.category,
            }))
          : [],
      };
    });
    return NextResponse.json(professionals);
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
