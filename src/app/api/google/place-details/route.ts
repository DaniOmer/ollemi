import { NextRequest, NextResponse } from "next/server";
import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const placeId = searchParams.get("placeId");

  if (!placeId) {
    return NextResponse.json(
      { error: "placeId parameter is required" },
      { status: 400 }
    );
  }

  try {
    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        fields: ["address_component", "formatted_address", "geometry"],
        key: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!,
      },
    });

    return NextResponse.json(response.data.result);
  } catch (error) {
    console.error("Google Place Details API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch place details" },
      { status: 500 }
    );
  }
}
