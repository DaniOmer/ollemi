"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { fetchPrivateApi } from "@/lib/services/api";

interface LocationSuggestion {
  id: string;
  address: string;
}

export default function LocationPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationSuggestion | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock location suggestions based on input
  useEffect(() => {
    if (searchQuery.length > 2) {
      // In a real app, you would call an address search API here
      const mockSuggestions = [
        {
          id: "loc1",
          address: `${searchQuery} Boulevard Voltaire, Paris, France`,
        },
        {
          id: "loc2",
          address: `${searchQuery} Boulevard Marguerite de Rochechouart, Paris, France`,
        },
        {
          id: "loc3",
          address: `${searchQuery} Rue de Clignancourt, Paris, France`,
        },
      ];
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const selectLocation = (location: LocationSuggestion) => {
    setSelectedLocation(location);
    setSearchQuery(location.address);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation && searchQuery.trim() === "") return;

    setLoading(true);

    try {
      // Save location to localStorage or your API
      localStorage.setItem(
        "onboarding_location",
        JSON.stringify(
          selectedLocation || { id: "custom", address: searchQuery }
        )
      );

      // Get the company ID from localStorage or from API
      const businessName =
        localStorage.getItem("onboarding_business_name") || "";
      const services = JSON.parse(
        localStorage.getItem("onboarding_services") || "[]"
      );
      const teamSize = localStorage.getItem("onboarding_team_size") || "";

      // In a real app, you would make an API call to update the company here
      // with all the collected data from onboarding
      try {
        const response = await fetchPrivateApi("/auth/complete-onboarding", {
          method: "POST",
          data: {
            businessName,
            services,
            teamSize,
            location: selectedLocation || {
              id: "custom",
              address: searchQuery,
            },
          },
        });

        if (response.error) {
          throw new Error(response.error || "Failed to complete onboarding");
        }
      } catch (error) {
        console.error("Error completing onboarding:", error);
        // Continue to success page even if API call fails
        // since we're storing data in localStorage
      }

      // Navigate to success page
      router.push("/onboarding/success");
    } catch (error) {
      console.error("Error saving location:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold">Set your location address</h2>
      <p className="mb-8 text-gray-600">
        Add your business location so your clients can easily find you.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-8 relative">
          <label htmlFor="location" className="mb-2 block font-medium">
            Where's your business located?
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter your address"
              className="pl-10"
              required
            />
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              <ul className="py-1">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.id}
                    onClick={() => selectLocation(suggestion)}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    {suggestion.address}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/onboarding/team-size")}
          >
            Back
          </Button>
          <Button type="submit" disabled={searchQuery.trim() === "" || loading}>
            {loading ? "Saving..." : "Continue"}
          </Button>
        </div>
      </form>
    </div>
  );
}
