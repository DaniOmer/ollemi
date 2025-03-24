"use client";

import React, { useEffect } from "react";
import { Stepper, StepItem } from "@/components/ui/stepper";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import {
  selectCurrentStep,
  setCurrentStep,
} from "@/lib/redux/slices/onboardingSlice";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector(selectCurrentStep);

  useEffect(() => {
    // Extract the current step from pathname
    const step = pathname.split("/").pop() || "business-name";

    // Update Redux store with current step
    if (step !== currentStep) {
      dispatch(setCurrentStep(step));
    }
  }, [pathname, dispatch, currentStep]);

  // Define onboarding steps
  const steps: StepItem[] = [
    {
      id: "business-name",
      label: "Business name",
      completed: currentStep !== "business-name" && currentStep !== "",
      current: currentStep === "business-name" || currentStep === "",
    },
    {
      id: "services",
      label: "Services",
      completed: ["team-size", "location", "success"].includes(currentStep),
      current: currentStep === "services",
    },
    {
      id: "team-size",
      label: "Team Size",
      completed: ["location", "success"].includes(currentStep),
      current: currentStep === "team-size",
    },
    {
      id: "location",
      label: "Location",
      completed: currentStep === "success",
      current: currentStep === "location",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-gray-50 p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary">Ollemi</h1>
            <p className="text-sm text-gray-600">Complete your account setup</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-lg">
          <div className="relative h-16 bg-primary/10">
            <div className="absolute -bottom-px left-0 right-0">
              <svg
                viewBox="0 0 1000 100"
                preserveAspectRatio="none"
                className="h-6 w-full fill-white"
              >
                <path d="M0,0 C200,100 800,100 1000,0 L1000,100 L0,100 Z"></path>
              </svg>
            </div>
          </div>

          <div className="p-2 md:p-8">
            <div className="mb-10">
              <h2 className="mb-4 text-xl font-bold text-gray-800">
                Account setup
              </h2>
              <Stepper steps={steps} className="mb-8" />
            </div>

            <div className="rounded-lg md:border border-gray-100 bg-white md:p-6 shadow-sm">
              {children}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Ollemi. All rights reserved.
        </div>
      </div>
    </div>
  );
}
