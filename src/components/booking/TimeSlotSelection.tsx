import { useState, useEffect } from "react";
import { Service } from "@/types";
import { Button } from "@/components/ui/button";
import { format, addMinutes, isBefore, isAfter } from "date-fns";
import { fr } from "date-fns/locale/fr";

interface TimeSlotSelectionProps {
  selectedService: Service;
  selectedDate: Date;
  onTimeSlotSelect: (startTime: Date) => void;
}

interface TimeSlot {
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
}

export default function TimeSlotSelection({
  selectedService,
  selectedDate,
  onTimeSlotSelect,
}: TimeSlotSelectionProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  useEffect(() => {
    // Générer les créneaux horaires pour la journée sélectionnée
    const slots: TimeSlot[] = [];
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(9, 0, 0, 0); // Commence à 9h
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(19, 0, 0, 0); // Termine à 19h

    let currentTime = startOfDay;
    while (isBefore(currentTime, endOfDay)) {
      const endTime = addMinutes(currentTime, selectedService.duration);
      if (isBefore(endTime, endOfDay)) {
        slots.push({
          startTime: new Date(currentTime),
          endTime,
          isAvailable: true, // À remplacer par la logique de vérification de disponibilité
        });
      }
      currentTime = addMinutes(currentTime, 30); // Créneaux de 30 minutes
    }

    setTimeSlots(slots);
  }, [selectedService, selectedDate]);

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    onTimeSlotSelect(slot.startTime);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Choisissez un horaire</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {timeSlots.map((slot, index) => (
          <Button
            key={index}
            variant={
              selectedSlot?.startTime === slot.startTime ? "default" : "outline"
            }
            className="w-full"
            onClick={() => handleTimeSlotSelect(slot)}
            disabled={!slot.isAvailable}
          >
            {format(slot.startTime, "HH:mm", { locale: fr })}
          </Button>
        ))}
      </div>
      {selectedSlot && (
        <div className="text-center mt-4">
          <p className="text-muted-foreground">
            Créneau sélectionné :{" "}
            {format(selectedSlot.startTime, "HH:mm", { locale: fr })} -{" "}
            {format(selectedSlot.endTime, "HH:mm", { locale: fr })}
          </p>
        </div>
      )}
    </div>
  );
}
