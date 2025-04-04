"use server";
import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client();

const autoComplete = async (input: string) => {
  console.log(process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!);
  try {
    const response = await client.placeAutocomplete({
      params: {
        input,
        key: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!,
      },
    });
    return response.data.predictions;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export { autoComplete };
