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

interface ServiceOption {
  id: string;
  name: string;
  icon: JSX.Element;
}

interface ServiceData {
  id: string;
  isPrimary: boolean;
}

export default function ServicesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const storedServices = useAppSelector(selectServices);

  const [selectedServices, setSelectedServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(false);

  // Load data from Redux store when component mounts
  useEffect(() => {
    if (storedServices && storedServices.length > 0) {
      // Convert from array of strings to array of ServiceData objects
      // For backward compatibility with existing data structure
      if (typeof storedServices[0] === "string") {
        const primaryService =
          localStorage.getItem("onboarding_primary_service") || "";
        const formattedServices = (storedServices as string[]).map((id) => ({
          id,
          isPrimary: id === primaryService,
        }));
        setSelectedServices(formattedServices);
      } else {
        setSelectedServices(storedServices as ServiceData[]);
      }
    }
  }, [storedServices]);

  const serviceOptions: ServiceOption[] = [
    {
      id: "haircuts",
      name: "Haircuts & styling",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 5L12 2M12 2L9 5M12 2V13M8 6L3 10M3 10L8 14M3 10H10M16 6L21 10M21 10L16 14M21 10H14M5 20H19C20.1046 20 21 19.1046 21 18V16H3V18C3 19.1046 3.89543 20 5 20Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "nails",
      name: "Nail services",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 6C12 3.79086 10.2091 2 8 2C5.79086 2 4 3.79086 4 6C4 7.4533 4.77926 8.72079 5.9374 9.40062M12 6H16M12 6V18M16 6C18.2091 6 20 7.79086 20 10C20 12.2091 18.2091 14 16 14M16 6C17.3833 6 18.6177 6.67235 19.391 7.6875M20 22L17 19M17 19L14 22M17 19V16M8 14H12M8 14C5.79086 14 4 15.7909 4 18C4 20.2091 5.79086 22 8 22C10.2091 22 12 20.2091 12 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "eyebrows",
      name: "Eyebrows & lashes",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 7C14.7614 7 17 9.23858 17 12M12 7C9.23858 7 7 9.23858 7 12M12 7V4M17 12C17 14.7614 14.7614 17 12 17M17 12H20M12 17C9.23858 17 7 14.7614 7 12M12 17V20M7 12H4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "facials",
      name: "Facials & skincare",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L15 5.5M12 2L9 5.5M12 2V8M4 10L2 14M2 14L4 18M2 14H8M20 10L22 14M22 14L20 18M22 14H16M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM12 16V20C12 21.1046 12.8954 22 14 22H18M12 16V20C12 21.1046 11.1046 22 10 22H6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "injectables",
      name: "Injectables & fillers",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17 7L7 17M17 7H12M17 7V12M14 3L14 6M10 3V6M6 10H3M6 14H3M14 21V18M10 21V18M21 10H18M21 14H18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "makeup",
      name: "Makeup",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 10H3M16 20V10M8 20V10M3 10L3.81365 5.13636C3.92449 4.46275 4.51058 4 5.19452 4H18.8055C19.4894 4 20.0755 4.46275 20.1864 5.13636L21 10Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  const toggleService = (serviceId: string) => {
    const isSelected = selectedServices.some(
      (service) => service.id === serviceId
    );

    if (isSelected) {
      // Remove the service
      setSelectedServices(
        selectedServices.filter((service) => service.id !== serviceId)
      );
    } else {
      // Add the service, set as primary if it's the first one
      const isPrimary =
        selectedServices.length === 0 ||
        !selectedServices.some((service) => service.isPrimary);
      setSelectedServices([...selectedServices, { id: serviceId, isPrimary }]);
    }
  };

  const setPrimary = (serviceId: string) => {
    setSelectedServices(
      selectedServices.map((service) => ({
        ...service,
        isPrimary: service.id === serviceId,
      }))
    );
  };

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some((service) => service.id === serviceId);
  };

  const isServicePrimary = (serviceId: string) => {
    return selectedServices.some(
      (service) => service.id === serviceId && service.isPrimary
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save data to Redux store
      dispatch(setServices(selectedServices));

      // Navigate to next step
      router.push("/onboarding/team-size");
    } catch (error) {
      console.error("Error saving services:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold">
        What services do you offer?
      </h2>
      <p className="mb-8 text-gray-600">
        Choose your primary and up to 3 related service types
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {serviceOptions.map((service) => (
            <div
              key={service.id}
              onClick={() => toggleService(service.id)}
              className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                isServiceSelected(service.id)
                  ? "border-primary shadow-sm"
                  : "border-gray-200"
              }`}
            >
              {isServicePrimary(service.id) && (
                <span className="absolute top-2 right-2 text-xs font-medium text-primary px-2 py-1 bg-primary/10 rounded-full">
                  Primary
                </span>
              )}
              <div className="flex items-center">
                <div
                  className={`mr-3 ${
                    isServiceSelected(service.id)
                      ? "text-primary"
                      : "text-gray-500"
                  }`}
                >
                  {service.icon}
                </div>
                <span className="font-medium truncate">{service.name}</span>
                {isServiceSelected(service.id) && (
                  <CheckCircle className="ml-auto h-5 w-5 text-primary flex-shrink-0" />
                )}
              </div>
              {isServiceSelected(service.id) &&
                !isServicePrimary(service.id) && (
                  <div className="mt-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPrimary(service.id);
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
              selectedServices.length === 0 ||
              !selectedServices.some((service) => service.isPrimary) ||
              loading
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
