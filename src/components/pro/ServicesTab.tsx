import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EnhancedBookingFlow } from "@/components/booking/EnhancedBookingFlow";
import { useTranslations } from "@/hooks/useTranslations";

import { Service, Company, Address } from "@/types";

function ServicesTab({
  professional,
  servicesByCategory,
}: {
  professional: Company & { address?: Address; services?: Service[] };
  servicesByCategory: Record<string, Service[]>;
}) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const { t } = useTranslations();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Prestations</h2>

      {/* Catégories de services */}
      <div className="flex overflow-x-auto mb-6 pb-2">
        {Object.keys(servicesByCategory).map((category) => (
          <button
            key={category}
            className="px-4 py-2 mr-2 bg-gray-200 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-300"
          >
            {category}
          </button>
        ))}
      </div>

      {/* Liste des services */}
      <div className="space-y-6">
        {Object.entries(servicesByCategory).map(([category, services]) => (
          <div key={category}>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{category}</h3>
            <div className="space-y-4">
              {services.map((service) => (
                <Dialog key={service.id}>
                  <DialogTrigger asChild>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer">
                      <div className="p-4">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-1">
                              {service.name}
                            </h4>
                            <p className="text-sm text-gray-500 mb-2">
                              {service.description}
                            </p>
                            <div className="flex items-center text-sm text-gray-500">
                              <span>{service.duration} min</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900 mb-2">
                              {service.price.toFixed(2)} €
                            </div>
                            <button
                              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                              onClick={() => setSelectedService(service)}
                            >
                              Réserver
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[900px] p-0">
                    <DialogHeader className="p-4 border-b">
                      <DialogTitle>{service.name}</DialogTitle>
                      <DialogDescription>
                        {t("professional.bookFor")}
                      </DialogDescription>
                    </DialogHeader>
                    <EnhancedBookingFlow
                      companyId={professional.id}
                      services={[service]}
                    />
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          Tout voir
        </button>
      </div>
    </div>
  );
}
export default ServicesTab;
