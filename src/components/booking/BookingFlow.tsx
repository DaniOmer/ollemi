import { useState, useEffect } from "react";
import { Service } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, addMinutes, isBefore, isAfter, addDays } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  Clock,
  Calendar as CalendarIcon,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BookingFlowProps {
  companyId: string;
  services: Service[];
}

interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
}

export default function BookingFlow({ companyId, services }: BookingFlowProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<Date[]>([]);
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { toast } = useToast();

  // Generate time slots for the selected date
  useEffect(() => {
    if (selectedDate && selectedService) {
      generateTimeSlots();
    }
  }, [selectedDate, selectedService]);

  const generateTimeSlots = () => {
    if (!selectedDate || !selectedService) return;

    const slots: Date[] = [];
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(9, 0, 0, 0); // Start at 9 AM
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(19, 0, 0, 0); // End at 7 PM

    let currentTime = startOfDay;
    while (isBefore(currentTime, endOfDay)) {
      const endTime = addMinutes(currentTime, selectedService.duration);
      if (isBefore(endTime, endOfDay)) {
        slots.push(new Date(currentTime));
      }
      currentTime = addMinutes(currentTime, 30); // 30-minute intervals
    }

    // In a real implementation, you would filter out unavailable slots
    // by checking against existing bookings from the API
    setTimeSlots(slots);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    generateTimeSlots();
  };

  const handleTimeSelect = (time: Date) => {
    setSelectedTime(time);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService || !selectedDate || !selectedTime) {
      toast({
        title: "Information manquante",
        description: "Veuillez sélectionner un service, une date et une heure.",
        variant: "destructive",
      });
      return;
    }

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone
    ) {
      toast({
        title: "Information manquante",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setConfirmDialogOpen(true);
  };

  const confirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    setIsLoading(true);

    try {
      // Calculate end time based on service duration
      const endTime = new Date(selectedTime);
      endTime.setMinutes(endTime.getMinutes() + selectedService.duration);

      // Create booking via API
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_id: companyId,
          service_id: selectedService.id,
          client_name: `${formData.firstName} ${formData.lastName}`,
          client_email: formData.email,
          client_phone: formData.phone,
          start_time: selectedTime.toISOString(),
          end_time: endTime.toISOString(),
          notes: formData.notes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Une erreur est survenue");
      }

      toast({
        title: "Réservation confirmée",
        description: "Votre rendez-vous a été enregistré avec succès.",
      });

      // Reset form
      setSelectedService(null);
      setSelectedTime(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        notes: "",
      });
      setConfirmDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de la réservation:", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la réservation.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {/* Left Panel - Service Selection */}
            <div className="bg-primary/5 p-6 border-r border-border">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-primary" />
                Sélectionnez un service
              </h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedService?.id === service.id
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border hover:border-primary/50 hover:bg-background"
                    }`}
                    onClick={() => handleServiceSelect(service)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {service.name}
                        </h3>
                        <p className="text-muted-foreground text-sm mt-1">
                          {service.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-primary">
                          {service.price}€
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center justify-end mt-1">
                          <Clock className="w-4 h-4 mr-1" />
                          {service.duration} min
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle Panel - Date & Time Selection */}
            <div className="p-6 border-r border-border">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-primary" />
                Date & Heure
              </h3>

              {selectedService ? (
                <>
                  <div className="mb-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date: Date | undefined) =>
                        date && setSelectedDate(date)
                      }
                      locale={fr}
                      disabled={{ before: new Date() }}
                      className="rounded-md border"
                    />
                  </div>

                  {selectedDate && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">
                        Horaires disponibles pour le{" "}
                        {format(selectedDate, "EEEE d MMMM", { locale: fr })}
                      </h4>

                      {timeSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2 max-h-[180px] overflow-y-auto pr-2">
                          {timeSlots.map((time, index) => (
                            <Button
                              key={index}
                              variant={
                                selectedTime?.getTime() === time.getTime()
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              className="w-full"
                              onClick={() => handleTimeSelect(time)}
                            >
                              {format(time, "HH:mm")}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          Aucun horaire disponible pour cette date.
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  Veuillez d'abord sélectionner un service
                </div>
              )}
            </div>

            {/* Right Panel - Customer Information */}
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary" />
                Vos informations
              </h3>

              {selectedService && selectedDate && selectedTime ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg space-y-2 mb-4">
                    <h4 className="font-medium">Récapitulatif</h4>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Service:</span>{" "}
                      <span className="font-medium">
                        {selectedService.name}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Date:</span>{" "}
                      <span className="font-medium">
                        {format(selectedDate, "EEEE d MMMM", { locale: fr })}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Heure:</span>{" "}
                      <span className="font-medium">
                        {format(selectedTime, "HH:mm")}
                      </span>
                    </p>
                    <p className="text-sm font-medium text-primary">
                      Prix: {selectedService.price}€
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optionnel)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Informations supplémentaires..."
                      className="resize-none"
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Réserver maintenant
                  </Button>
                </form>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  Veuillez sélectionner un service, une date et une heure
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer votre réservation</DialogTitle>
            <DialogDescription>
              Veuillez vérifier les détails de votre réservation avant de
              confirmer.
            </DialogDescription>
          </DialogHeader>

          {selectedService && selectedDate && selectedTime && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Service</p>
                    <p className="font-medium">{selectedService.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prix</p>
                    <p className="font-medium text-primary">
                      {selectedService.price}€
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {format(selectedDate, "EEEE d MMMM", { locale: fr })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Heure</p>
                    <p className="font-medium">
                      {format(selectedTime, "HH:mm")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-medium">
                  {formData.firstName} {formData.lastName}
                </p>
                <p className="text-sm">{formData.email}</p>
                <p className="text-sm">{formData.phone}</p>
              </div>
            </div>
          )}

          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={confirmBooking} disabled={isLoading}>
              {isLoading
                ? "Traitement en cours..."
                : "Confirmer la réservation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
