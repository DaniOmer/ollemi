"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import {
  selectServices,
  setServices,
} from "@/lib/redux/slices/onboardingSlice";
import { getCategories } from "@/lib/services/categories";
import Image from "next/image";

interface CategoryData {
  id: string;
  name: string;
  imageUrl: string;
}

interface SelectedCategoryData {
  id: string;
  isPrimary: boolean;
}

export default function ServicesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const storedServices = useAppSelector(selectServices);

  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<
    SelectedCategoryData[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategoriesData = async () => {
      setFetchingCategories(true);
      try {
        const response = await getCategories();
        if (response.data) {
          setCategories(response.data);
        } else {
          console.error("Failed to fetch categories:", response.error);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setFetchingCategories(false);
      }
    };

    fetchCategoriesData();
  }, []);

  // Load data from Redux store when component mounts
  useEffect(() => {
    if (storedServices && storedServices.length > 0) {
      // Convert from array of strings to array of SelectedCategoryData objects
      // For backward compatibility with existing data structure
      if (typeof storedServices[0] === "string") {
        const primaryService =
          localStorage.getItem("onboarding_primary_service") || "";
        const formattedServices = (storedServices as string[]).map((id) => ({
          id,
          isPrimary: id === primaryService,
        }));
        setSelectedCategories(formattedServices);
      } else {
        setSelectedCategories(storedServices as SelectedCategoryData[]);
      }
    }
  }, [storedServices]);

  const toggleCategory = (categoryId: string) => {
    const isSelected = selectedCategories.some(
      (category) => category.id === categoryId
    );

    if (isSelected) {
      // Remove the category
      setSelectedCategories(
        selectedCategories.filter((category) => category.id !== categoryId)
      );
    } else {
      // Add the category, set as primary if it's the first one
      const isPrimary =
        selectedCategories.length === 0 ||
        !selectedCategories.some((category) => category.isPrimary);
      setSelectedCategories([
        ...selectedCategories,
        { id: categoryId, isPrimary },
      ]);
    }
  };

  const setPrimary = (categoryId: string) => {
    setSelectedCategories(
      selectedCategories.map((category) => ({
        ...category,
        isPrimary: category.id === categoryId,
      }))
    );
  };

  const isCategorySelected = (categoryId: string) => {
    return selectedCategories.some((category) => category.id === categoryId);
  };

  const isCategoryPrimary = (categoryId: string) => {
    return selectedCategories.some(
      (category) => category.id === categoryId && category.isPrimary
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save data to Redux store
      dispatch(setServices(selectedCategories));

      // Save data to localStorage - store only IDs for consistency
      const serviceIds = selectedCategories.map((category) => category.id);
      localStorage.setItem("onboarding_services", JSON.stringify(serviceIds));

      // Store primary service ID separately
      const primaryService = selectedCategories.find(
        (category) => category.isPrimary
      );
      if (primaryService) {
        localStorage.setItem("onboarding_primary_service", primaryService.id);
      }

      // Navigate to next step
      router.push("/onboarding/team-size");
    } catch (error) {
      console.error("Error saving categories:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold">
        What categories do you offer?
      </h2>
      <p className="mb-8 text-gray-600">
        Choose your primary and up to 3 related service categories
      </p>

      <form onSubmit={handleSubmit}>
        {fetchingCategories ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg animate-pulse h-[90px]"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 mr-3"></div>
                    <div className="w-24 h-6 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                  isCategorySelected(category.id)
                    ? "border-primary shadow-sm"
                    : "border-gray-200"
                }`}
              >
                {isCategoryPrimary(category.id) && (
                  <span className="absolute top-2 right-2 text-xs font-medium text-primary px-2 py-1 bg-primary/10 rounded-full">
                    Primary
                  </span>
                )}
                <div className="flex items-center">
                  <div
                    className={`relative w-8 h-8 mr-3 rounded-full overflow-hidden flex-shrink-0 ${
                      isCategorySelected(category.id)
                        ? "ring-2 ring-primary"
                        : ""
                    }`}
                  >
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                  <span className="font-medium truncate">{category.name}</span>
                  {isCategorySelected(category.id) && (
                    <CheckCircle className="ml-auto h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </div>
                {isCategorySelected(category.id) &&
                  !isCategoryPrimary(category.id) && (
                    <div className="mt-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPrimary(category.id);
                        }}
                        className="text-xs text-primary hover:underline"
                      >
                        Set as primary
                      </button>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/onboarding/business-name")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button
            type="submit"
            disabled={
              selectedCategories.length === 0 ||
              !selectedCategories.some((category) => category.isPrimary) ||
              loading ||
              fetchingCategories
            }
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
