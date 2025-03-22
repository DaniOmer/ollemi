"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Building2, Globe, ArrowRight, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import {
  selectBusinessInfo,
  setBusinessInfo,
} from "@/lib/redux/slices/onboardingSlice";

export default function BusinessNamePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const storedBusinessInfo = useAppSelector(selectBusinessInfo);

  const [businessName, setBusinessName] = useState(
    storedBusinessInfo.businessName || ""
  );
  const [website, setWebsite] = useState(storedBusinessInfo.website || "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    businessName?: string;
    website?: string;
  }>({});

  // Load data from Redux store when component mounts
  useEffect(() => {
    if (storedBusinessInfo.businessName) {
      setBusinessName(storedBusinessInfo.businessName);
    }
    if (storedBusinessInfo.website) {
      setWebsite(storedBusinessInfo.website);
    }
  }, [storedBusinessInfo]);

  const validateForm = () => {
    const newErrors: { businessName?: string; website?: string } = {};
    let isValid = true;

    // Validate business name
    if (!businessName.trim()) {
      newErrors.businessName = "Business name is required";
      isValid = false;
    } else if (businessName.length < 2) {
      newErrors.businessName = "Business name must be at least 2 characters";
      isValid = false;
    }

    // Validate website if provided
    if (
      website &&
      !website.match(
        /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/
      )
    ) {
      newErrors.website = "Please enter a valid website address";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Save data to Redux store
      dispatch(setBusinessInfo({ businessName, website }));

      // Proceed to next step
      router.push("/onboarding/services");
    } catch (error) {
      console.error("Error saving business info:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold text-gray-800">
        What's your business name?
      </h2>
      <p className="mb-8 text-gray-600">
        This is the brand name your clients will see. Your billing and legal
        name can be added later.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="businessName" className="text-gray-700">
            Business name <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Building2 className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => {
                setBusinessName(e.target.value);
                if (errors.businessName) {
                  setErrors({ ...errors, businessName: undefined });
                }
              }}
              placeholder="Your business name"
              className={`pl-10 ${
                errors.businessName
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
              required
            />
          </div>
          {errors.businessName && (
            <p className="text-sm text-red-500 mt-1">{errors.businessName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="text-gray-700">
            Website (Optional)
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Globe className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="website"
              value={website}
              onChange={(e) => {
                setWebsite(e.target.value);
                if (errors.website) {
                  setErrors({ ...errors, website: undefined });
                }
              }}
              placeholder="www.yoursite.com"
              className={`pl-10 ${
                errors.website
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
            />
          </div>
          {errors.website && (
            <p className="text-sm text-red-500 mt-1">{errors.website}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Your website will be displayed on your profile page
          </p>
        </div>

        <div className="pt-4 flex justify-end">
          <Button
            type="submit"
            disabled={!businessName || loading}
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
