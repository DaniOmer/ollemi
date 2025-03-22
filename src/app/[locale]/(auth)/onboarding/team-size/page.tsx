"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import {
  selectTeamSize,
  setTeamSize,
} from "@/lib/redux/slices/onboardingSlice";

interface TeamSizeOption {
  id: string;
  label: string;
}

export default function TeamSizePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const storedTeamSize = useAppSelector(selectTeamSize);

  const [selectedSize, setSelectedSize] = useState<string | null>(
    storedTeamSize || null
  );
  const [loading, setLoading] = useState(false);

  // Load data from Redux store when component mounts
  useEffect(() => {
    if (storedTeamSize) {
      setSelectedSize(storedTeamSize);
    }
  }, [storedTeamSize]);

  const teamSizes: TeamSizeOption[] = [
    { id: "solo", label: "It's just me" },
    { id: "small", label: "2-5 people" },
    { id: "medium", label: "6-10 people" },
    { id: "large", label: "11+ people" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save team size to Redux store
      if (selectedSize) {
        dispatch(setTeamSize(selectedSize));
      }

      // Navigate to next step
      router.push("/onboarding/location");
    } catch (error) {
      console.error("Error saving team size:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold">What's your team size?</h2>
      <p className="mb-8 text-gray-600">
        This will help us set up your calendar correctly
      </p>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4 mb-8">
          {teamSizes.map((size) => (
            <div
              key={size.id}
              onClick={() => setSelectedSize(size.id)}
              className={`relative p-4 border rounded-lg cursor-pointer transition-all flex items-center ${
                selectedSize === size.id
                  ? "border-primary shadow-sm bg-primary/5"
                  : "border-gray-200"
              }`}
            >
              <span className="font-medium">{size.label}</span>
              {selectedSize === size.id && (
                <CheckCircle className="ml-auto h-5 w-5 text-primary" />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/onboarding/services")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            type="submit"
            disabled={!selectedSize || loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
