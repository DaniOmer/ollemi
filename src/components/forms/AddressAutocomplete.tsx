"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/hooks/useTranslations";

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressData) => void;
  defaultValue?: string;
  className?: string;
  label?: string;
  placeholder?: string;
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
}: AddressAutocompleteProps) {
  const { t } = useTranslations();
  const [address, setAddress] = useState(defaultValue);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Load Google Maps API script
  useEffect(() => {
    if (typeof window !== "undefined" && !window.google?.maps?.places) {
      const googleMapsScript = document.createElement("script");
      googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      googleMapsScript.async = true;
      googleMapsScript.defer = true;
      googleMapsScript.onload = () => setIsScriptLoaded(true);
      document.body.appendChild(googleMapsScript);

      return () => {
        document.body.removeChild(googleMapsScript);
      };
    } else if (window.google?.maps?.places) {
      setIsScriptLoaded(true);
    }
  }, []);

  // Initialize autocomplete when script is loaded
  useEffect(() => {
    if (isScriptLoaded && inputRef.current) {
      autocompleteRef.current = new google.maps.places.Autocomplete(
        inputRef.current,
        { types: ["address"] }
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();

        if (place && place.address_components) {
          const addressData: AddressData = {
            fullAddress: place.formatted_address || "",
          };

          // Extract address components
          for (const component of place.address_components) {
            const types = component.types;

            if (types.includes("street_number")) {
              addressData.streetNumber = component.long_name;
            } else if (types.includes("route")) {
              addressData.streetName = component.long_name;
            } else if (types.includes("locality")) {
              addressData.city = component.long_name;
            } else if (types.includes("administrative_area_level_1")) {
              addressData.state = component.long_name;
            } else if (types.includes("postal_code")) {
              addressData.postalCode = component.long_name;
            } else if (types.includes("country")) {
              addressData.country = component.long_name;
            }
          }

          setAddress(place.formatted_address || "");
          onAddressSelect(addressData);
        }
      });
    }
  }, [isScriptLoaded, onAddressSelect]);

  return (
    <div className={className}>
      {label && <Label htmlFor="address">{label}</Label>}
      <Input
        id="address"
        ref={inputRef}
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder={placeholder || t("settings.streetAddress")}
        className="w-full"
      />
    </div>
  );
}
