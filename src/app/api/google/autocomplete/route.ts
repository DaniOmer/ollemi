import { NextRequest, NextResponse } from "next/server";
import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const input = searchParams.get("input");

  if (!input) {
    return NextResponse.json(
      { error: "Input parameter is required" },
      { status: 400 }
    );
  }

  try {
    const response = await client.placeAutocomplete({
      params: {
        input,
        key: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!,
      },
    });

    return NextResponse.json(response.data.predictions);
  } catch (error) {
    console.error("Google Places API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch address suggestions" },
      { status: 500 }
    );
  }
}
