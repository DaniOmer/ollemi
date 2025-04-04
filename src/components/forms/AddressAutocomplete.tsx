"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/hooks/useTranslations";
import { PlaceAutocompleteResult } from "@googlemaps/google-maps-services-js";

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressData) => void;
  defaultValue?: string;
  className?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface AddressData {
  fullAddress: string;
  streetNumber?: string;
  streetName?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export function AddressAutocomplete({
  onAddressSelect,
  defaultValue = "",
  className = "",
  label,
  placeholder,
  required = false,
  disabled = false,
}: AddressAutocompleteProps) {
  const { t } = useTranslations();
  const [address, setAddress] = useState<string>(defaultValue);
  const [predictions, setPredictions] = useState<PlaceAutocompleteResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Fetch address predictions when address input changes
  useEffect(() => {
    const fetchPredictions = async () => {
      if (!address || address.length < 3) {
        setPredictions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/google/autocomplete?input=${encodeURIComponent(address)}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch address suggestions");
        }

        const results = await response.json();
        setPredictions(results);
      } catch (error) {
        console.error("Error fetching address predictions:", error);
        setError(t("errors.addressLookupFailed"));
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
      } else {
        fetchPredictions();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [address]);

  const handleAddressChange = (value: string) => {
    setAddress(value);
    setShowSuggestions(true);
    setError(null);
  };

  const handleSelectAddress = async (prediction: PlaceAutocompleteResult) => {
    setAddress(prediction.description);
    setShowSuggestions(false);
    setIsLoading(true);

    try {
      // Fetch complete address details using place_id
      const response = await fetch(
        `/api/google/place-details?placeId=${encodeURIComponent(
          prediction.place_id
        )}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch address details");
      }

      const placeDetails = await response.json();
      console.log("placeDetails ", placeDetails);

      // Parse address components
      const addressData: AddressData = {
        fullAddress: placeDetails.formatted_address || prediction.description,
      };

      // Extract address components from the address_component array
      if (placeDetails.address_components) {
        for (const component of placeDetails.address_components) {
          const types = component.types;

          if (types.includes("street_number")) {
            addressData.streetNumber = component.long_name;
          }

          if (types.includes("route")) {
            addressData.streetName = component.long_name;
          }

          if (types.includes("locality")) {
            addressData.city = component.long_name;
          }

          if (types.includes("administrative_area_level_1")) {
            addressData.state = component.short_name;
          }

          if (types.includes("postal_code")) {
            addressData.postalCode = component.long_name;
          }

          if (types.includes("country")) {
            addressData.country = component.long_name;
          }
        }
      }

      onAddressSelect(addressData);
    } catch (error) {
      console.error("Error fetching address details:", error);
      setError(t("errors.addressLookupFailed"));

      // Fallback to using just the prediction data
      const addressData: AddressData = {
        fullAddress: prediction.description,
      };

      // Extract address components based on address structure (fallback)
      const addressParts = prediction.structured_formatting;
      if (addressParts) {
        const mainText = addressParts.main_text;
        const secondaryText = addressParts.secondary_text;

        const streetMatch = mainText.match(/^(\d+)\s+(.+)/);
        if (streetMatch) {
          addressData.streetNumber = streetMatch[1];
          addressData.streetName = streetMatch[2];
        }

        const parts = secondaryText.split(", ");
        if (parts.length >= 1) addressData.city = parts[0];
        if (parts.length >= 2) {
          const stateZip = parts[1].split(" ");
          if (stateZip.length >= 1) addressData.state = stateZip[0];
          if (stateZip.length >= 2) addressData.postalCode = stateZip[1];
        }
        if (parts.length >= 3) addressData.country = parts[2];
      }

      onAddressSelect(addressData);
    } finally {
      setIsLoading(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Vérifie si la cible du clic est en dehors du conteneur parent
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={className}>
      {label && (
        <Label
          htmlFor="address"
          className={
            required
              ? "after:content-['*'] after:ml-0.5 after:text-red-500"
              : ""
          }
        >
          {label}
        </Label>
      )}
      <div className="relative" ref={containerRef}>
        <Input
          id="address"
          ref={inputRef}
          type="text"
          value={address}
          onChange={(e) => handleAddressChange(e.target.value)}
          placeholder={placeholder || t("settings.streetAddress")}
          className={`w-full ${isLoading ? "pr-10" : ""} ${
            error ? "border-red-500" : ""
          }`}
          required={required}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? "address-error" : undefined}
          onFocus={() => setShowSuggestions(true)}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
          </div>
        )}

        {/* Suggestions dropdown */}
        {showSuggestions && predictions.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {predictions.map((prediction) => (
              <li
                key={prediction.place_id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelectAddress(prediction)}
              >
                <div className="font-semibold">
                  {prediction.structured_formatting?.main_text}
                </div>
                <div className="text-sm text-gray-600">
                  {prediction.structured_formatting?.secondary_text}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && (
        <p id="address-error" className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
