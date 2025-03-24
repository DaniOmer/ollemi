"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { fetchPrivateApi } from "@/lib/services/api";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import {
  selectAllOnboardingData,
  setOnboardingCompleted,
  resetOnboarding,
} from "@/lib/redux/slices/onboardingSlice";

export default function SuccessPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const onboardingData = useAppSelector(selectAllOnboardingData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Collect and save all onboarding data
  useEffect(() => {
    const saveOnboardingData = async () => {
      try {
        setIsLoading(true);

        // Format services data for the API
        const formattedServices = onboardingData.services.map((service) =>
          typeof service === "string" ? service : service.id
        );

        // Send data to backend
        const response = await fetchPrivateApi("/auth/complete-onboarding", {
          method: "POST",
          data: {
            businessName: onboardingData.businessName,
            website: onboardingData.website,
            services: formattedServices,
            teamSize: onboardingData.teamSize,
            location: onboardingData.location,
          },
        });

        if (response.error) {
          throw new Error(response.error || "Failed to complete onboarding");
        }

        // Mark onboarding as completed in Redux
        dispatch(setOnboardingCompleted(true));

        setIsLoading(false);
      } catch (error) {
        console.error("Error saving onboarding data:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
        setIsLoading(false);
      }
    };

    saveOnboardingData();
  }, []);

  const goToDashboard = () => {
    // Redirect to professional dashboard after onboarding
    router.push("/dashboard/pro");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-semibold">Finalizing your account...</h2>
        <p className="text-gray-500 mt-2">This will only take a moment</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 rounded-full p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h2 className="mb-4 text-2xl font-semibold text-red-700">
          Something went wrong
        </h2>
        <p className="mb-8 text-gray-600">{error}</p>

        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="mr-2"
        >
          Try Again
        </Button>
        <Button onClick={goToDashboard}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-green-100 rounded-full p-4">
          <CheckCircle className="h-16 w-16 text-green-600" />
        </div>
      </div>

      <h2 className="mb-4 text-2xl font-semibold">Onboarding Complete!</h2>
      <p className="mb-8 text-gray-600">
        Your professional account is now set up and ready to use.
      </p>

      <div className="flex justify-center">
        <Button onClick={goToDashboard} className="px-8">
          Go to Dashboard
        </Button>
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="font-medium mb-3 text-blue-800">What's next?</h3>
        <ul className="text-sm text-left list-disc pl-5 space-y-3">
          <li>Set up your services and pricing</li>
          <li>Configure your working hours</li>
          <li>Invite your team members</li>
          <li>Connect your calendar</li>
        </ul>
      </div>
    </div>
  );
}
