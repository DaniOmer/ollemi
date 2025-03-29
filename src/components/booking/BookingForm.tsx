import { useState } from "react";
import { Service } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";

interface BookingFormProps {
  selectedService: Service;
  selectedDate: Date;
  selectedTime: Date;
  onSubmit: (bookingData: BookingFormData) => void;
}

export interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
}

export default function BookingForm({
  selectedService,
  selectedDate,
  selectedTime,
  onSubmit,
}: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-6">Informations de réservation</h2>

        {/* Récapitulatif */}
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <h3 className="font-semibold">Récapitulatif</h3>
          <p className="text-muted-foreground">
            Service : {selectedService.name}
          </p>
          <p className="text-muted-foreground">
            Date : {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
          </p>
          <p className="text-muted-foreground">
            Heure : {format(selectedTime, "HH:mm", { locale: fr })}
          </p>
          <p className="font-semibold">Prix : {selectedService.price}€</p>
        </div>

        {/* Formulaire */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optionnel)</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Informations supplémentaires pour votre rendez-vous..."
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        Confirmer la réservation
      </Button>
    </form>
  );
}
