import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// GET /api/categories/:id
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const include = url.searchParams.get("include");
    const includeCompanies = include === "companies";

    // Get the category data
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("id, name, image_url")
      .eq("id", id)
      .single();

    if (categoryError) {
      if (categoryError.code === "PGRST116") {
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

    // Transform the category data to match our interface
    const category = {
      id: categoryData.id,
      name: categoryData.name,
      imageUrl: categoryData.image_url,
    };

    // If include=companies is specified, fetch and include companies
    if (includeCompanies) {
      // Récupérer d'abord les IDs des entreprises liées à cette catégorie
      const { data: companyLinks, error: linksError } = await supabase
        .from("company_categories")
        .select("company_id")
        .eq("category_id", id);

      if (linksError) {
        console.error("Erreur lors de la récupération des liens:", linksError);
        return NextResponse.json(
          { error: "Failed to fetch company relationships" },
          { status: 500 }
        );
      }

      // Extraire les IDs des entreprises
      const companyIds = companyLinks.map((link) => link.company_id);

      // Récupérer les données complètes des entreprises
      const { data: companiesData, error: companiesError } = await supabase
        .from("companies")
        .select(
          `
          id, 
          name, 
          description, 
          phone, 
          website, 
          addresses (
            id, 
            formatted_address, 
            street_number, 
            street_name,
            city,
            state,
            postal_code, 
            country,
            place_id
          ),
          services (
            id, 
            name, 
            description, 
            price, 
            duration
          ),
          photos (
            id, 
            url, 
            alt
          )
        `
        )
        .in("id", companyIds);

      if (companiesError) {
        console.error(
          "Erreur lors de la récupération des entreprises:",
          companiesError
        );
        return NextResponse.json(
          { error: "Failed to fetch companies" },
          { status: 500 }
        );
      }

      // Transform company data
      const companies = companiesData.map((company) => ({
        id: company.id,
        name: company.name,
        description: company.description,
        phone: company.phone,
        website: company.website,
        addresses: company.addresses,
        services: company.services,
        photos: company.photos,
      }));

      // Include companies in the response
      return NextResponse.json({
        ...category,
        companies,
      });
    }

    // If include=companies is not specified, just return the category
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
