declare namespace google {
  namespace maps {
    namespace places {
      class Autocomplete {
        constructor(
          inputField: HTMLInputElement,
          options?: AutocompleteOptions
        );
        addListener(eventName: string, handler: () => void): void;
        getPlace(): PlaceResult;
      }

      interface AutocompleteOptions {
        types?: string[];
        componentRestrictions?: {
          country: string | string[];
        };
        fields?: string[];
        bounds?: LatLngBounds;
        strictBounds?: boolean;
      }

      interface PlaceResult {
        address_components?: AddressComponent[];
        formatted_address?: string;
        geometry?: {
          location: LatLng;
          viewport: LatLngBounds;
        };
        place_id?: string;
        name?: string;
        types?: string[];
      }

      interface AddressComponent {
        long_name: string;
        short_name: string;
        types: string[];
      }
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    class LatLngBounds {
      constructor(sw?: LatLng, ne?: LatLng);
      extend(point: LatLng): LatLngBounds;
      getCenter(): LatLng;
      getNorthEast(): LatLng;
      getSouthWest(): LatLng;
    }
  }
}
