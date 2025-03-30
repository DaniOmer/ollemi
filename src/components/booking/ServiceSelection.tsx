import { useState } from "react";
import { Service } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";

interface ServiceSelectionProps {
  services: Service[];
  onServiceSelect: (service: Service) => void;
  onDateSelect: (date: Date) => void;
}

export default function ServiceSelection({
  services,
  onServiceSelect,
  onDateSelect,
}: ServiceSelectionProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    onServiceSelect(service);
  };

  const handleDateSelect = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      onDateSelect(date);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Services List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-6">Sélectionnez un service</h2>
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedService?.id === service.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => handleServiceSelect(service)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{service.name}</h3>
                  <p className="text-muted-foreground mt-1">
                    {service.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{service.price}€</p>
                  <p className="text-sm text-muted-foreground">
                    {service.duration} min
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-6">Choisissez une date</h2>
        <div className="border rounded-lg p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            locale={fr}
            className="rounded-md"
          />
        </div>
        {selectedDate && (
          <div className="text-center">
            <p className="text-muted-foreground">
              Date sélectionnée :{" "}
              {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
