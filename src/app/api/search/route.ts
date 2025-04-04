import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract all possible filter parameters
    const name = searchParams.get("name");
    const service = searchParams.get("service");
    const category = searchParams.get("category");
    const location = searchParams.get("location");
    const city = searchParams.get("city");
    const postalCode = searchParams.get("postalCode");
    const date = searchParams.get("date");
    const priceMin = searchParams.get("price_min");
    const priceMax = searchParams.get("price_max");
    const rating = searchParams.get("rating");

    let query = supabase.from("companies").select(
      `
        *,
        addresses (
          id,
          formatted_address,
          street_number,
          street_name,
          city,
          postal_code,
          country,
          state,
          latitude,
          longitude
        ),
        services (
          id,
          name,
          description,
          price,
          duration,
          category
        ),
        opening_hours (
          id,
          day_of_week,
          open,
          start_time,
          end_time,
          break_start_time,
          break_end_time
        ),
        company_categories (
          category:categories (
            id,
            name
          )
        ),
        photos (
          id,
          url,
          alt,
          featured
        )
      `
    );

    // Filter by company name if provided
    if (name) {
      query = query.filter("name", "ilike", `%${name}%`);
    }

    // Filter by service name if provided
    if (service) {
      query = query.filter("services.name", "ilike", `%${service}%`);
    }

    // We'll handle category filtering after fetching the data
    // This is because nested relationship filtering can be tricky with Supabase

    // Filter by location if provided
    if (location) {
      query = query.filter(
        "addresses.formatted_address",
        "ilike",
        `%${location}%`
      );
    }

    // Filter by city if provided
    if (city) {
      query = query.filter("addresses.city", "ilike", `%${city}%`);
    }

    // Filter by postal code if provided
    if (postalCode) {
      query = query.filter("addresses.postal_code", "eq", postalCode);
    }

    // Filter by minimum price if provided
    if (priceMin) {
      query = query.filter("services.price", "gte", parseInt(priceMin));
    }

    // Filter by maximum price if provided
    if (priceMax) {
      query = query.filter("services.price", "lte", parseInt(priceMax));
    }

    // Filter by rating if provided
    if (rating) {
      query = query.filter("rating", "gte", parseFloat(rating));
    }

    // We'll handle date filtering on the client side since it requires
    // checking availability which is more complex

    const { data, error } = await query;

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add debugging for raw data
    console.log(
      "Raw data from database:",
      JSON.stringify(
        data?.map((company) => ({
          id: company.id,
          name: company.name,
          company_categories: company.company_categories,
        })),
        null,
        2
      )
    );

    // Transform the data to match the expected format, similar to the company get route
    let transformedData = data?.map((company: any) => {
      // Debug each company's categories
      console.log(
        `Company ${company.name} categories:`,
        JSON.stringify(company.company_categories, null, 2)
      );

      return {
        ...company,
        photos: company.photos || [],
        services: company.services || [],
        addresses: company.addresses || {},
        opening_hours:
          company.opening_hours?.reduce((acc: any, curr: any) => {
            acc[curr.day_of_week] = {
              open: curr.open,
              start: curr.start_time,
              end: curr.end_time,
              break_start: curr.break_start_time,
              break_end: curr.break_end_time,
            };
            return acc;
          }, {}) || {},
        categories:
          company.company_categories?.map((cc: any) => cc.category) || [],
      };
    });

    // Filter by category if provided
    if (category) {
      console.log("Filtering by category:", category);

      // Debug all companies and their categories before filtering
      console.log(
        "All companies before filtering:",
        transformedData.map((company: any) => ({
          id: company.id,
          name: company.name,
          categories: company.categories,
        }))
      );

      // Try both exact matching and partial matching for flexibility
      const normalizedSearchCategory = category.toLowerCase().trim();
      console.log("Normalized search category:", normalizedSearchCategory);

      transformedData = transformedData.filter((company: any) => {
        // First check if any categories exist
        if (!company.categories || company.categories.length === 0) {
          console.log(`Company ${company.name} has no categories`);
          return false;
        }

        // Check if the company has any categories that match the search term
        const hasMatchingCategory = company.categories.some((cat: any) => {
          if (!cat || !cat.name) return false;

          // Normalize the category name for comparison
          const normalizedCategoryName = cat.name.toLowerCase().trim();

          // For debugging
          console.log(
            `Comparing: "${normalizedCategoryName}" with "${normalizedSearchCategory}"`
          );

          // Try exact match first
          if (normalizedCategoryName === normalizedSearchCategory) {
            return true;
          }

          // If not exact, check if it's a partial match (for flexibility)
          // This helps with cases like "Tattoo" vs "Tattoos" or other minor variations
          if (
            normalizedCategoryName.includes(normalizedSearchCategory) ||
            normalizedSearchCategory.includes(normalizedCategoryName)
          ) {
            console.log(
              `Found partial match: "${normalizedCategoryName}" contains or is contained in "${normalizedSearchCategory}"`
            );
            return true;
          }

          return false;
        });

        // Debug the filtering decision
        console.log(
          `Company ${company.name} has matching category: ${hasMatchingCategory}`
        );
        if (!hasMatchingCategory) {
          console.log(
            `Company ${company.name} categories:`,
            company.categories
          );
        }

        return hasMatchingCategory;
      });

      console.log(
        `Found ${transformedData.length} companies with category ${category}`
      );
    }

    // If date is provided, we could filter companies based on availability
    // This would require additional logic to check availability for the given date
    // For now, we'll just return all matching companies

    return NextResponse.json(transformedData);
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to search companies" },
      { status: 500 }
    );
  }
}
