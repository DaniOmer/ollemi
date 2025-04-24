"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  format,
  addDays,
  isBefore,
  isAfter,
  addMinutes,
  parseISO,
} from "date-fns";
import { fr } from "date-fns/locale/fr";
import { Service } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  Clock,
  Calendar as CalendarIcon,
  User,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Mail,
  Phone,
  MessageSquare,
  Check,
} from "lucide-react";

import { useAppSelector, useAppDispatch } from "@/lib/redux/store";
import { selectUserProfile } from "@/lib/redux/slices/userSlice";
import { createBookingThunk } from "@/lib/redux/slices/bookingSlice";

interface EnhancedBookingFlowProps {
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

interface TimeSlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
}

export function EnhancedBookingFlow({
  companyId,
  services,
}: EnhancedBookingFlowProps) {
  // Auth hook for user authentication
  const router = useRouter();
  const user = useAppSelector(selectUserProfile);
  const dispatch = useAppDispatch();
  // State for the booking flow
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null
  );
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { toast } = useToast();

  // Reference to track if form has been pre-filled
  const formPrefilledRef = useRef(false);

  // Calendar dates
  const today = new Date();
  const maxDate = addDays(today, 60); // Allow booking up to 60 days in advance
  const [calendarDates, setCalendarDates] = useState<Date[]>([]);
  const [calendarPage, setCalendarPage] = useState(0);
  const daysToShow = 7; // Number of days to show in the calendar view

  // Generate calendar dates
  useEffect(() => {
    const dates: Date[] = [];
    const startDate = addDays(today, calendarPage * daysToShow);

    for (let i = 0; i < daysToShow; i++) {
      const date = addDays(startDate, i);
      if (!isAfter(date, maxDate)) {
        dates.push(date);
      }
    }

    setCalendarDates(dates);
  }, [calendarPage]);

  // Fetch time slots for the selected date and service
  const fetchTimeSlots = useCallback(async () => {
    if (!selectedService || !selectedDate) return;

    setLoadingTimeSlots(true);
    try {
      // In a real implementation, this would fetch from an API
      // For now, we'll generate mock time slots
      const slots: TimeSlot[] = [];
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(9, 0, 0, 0); // Start at 9 AM
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(19, 0, 0, 0); // End at 7 PM

      let currentTime = startOfDay;
      while (isBefore(currentTime, endOfDay)) {
        const endTime = addMinutes(currentTime, selectedService.duration);
        if (isBefore(endTime, endOfDay)) {
          // Simulate some slots being unavailable
          const isAvailable = Math.random() > 0.3; // 70% chance of being available
          slots.push({
            startTime: new Date(currentTime),
            endTime: new Date(endTime),
            available: isAvailable,
          });
        }
        currentTime = addMinutes(currentTime, 30); // 30-minute intervals
      }

      setTimeSlots(slots);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      toast({
        title: "Erreur",
        description:
          "Impossible de récupérer les créneaux horaires disponibles.",
        variant: "destructive",
      });
    } finally {
      setLoadingTimeSlots(false);
    }
  }, [selectedService, selectedDate, toast]);

  // Fetch time slots when service or date changes
  useEffect(() => {
    if (selectedService && selectedDate) {
      fetchTimeSlots();
    }
  }, [selectedService, selectedDate, fetchTimeSlots]);

  // Handle service selection
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCurrentStep(1); // Move to date selection
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
    setCurrentStep(2); // Move to time selection
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);

    // Check if user is authenticated before proceeding to step 4
    if (!user) {
      setShowAuthDialog(true);
    } else {
      setCurrentStep(3); // Move to customer info
    }
  };

  // Pre-fill form with user data when authenticated
  useEffect(() => {
    if (user && !formPrefilledRef.current && currentStep === 3) {
      setFormData({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        notes: "",
      });
      formPrefilledRef.current = true;
    }
  }, [user, currentStep]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService || !selectedDate || !selectedTimeSlot) {
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

  // Confirm booking
  const confirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTimeSlot) return;

    setIsLoading(true);

    try {
      // Create booking via API
      await dispatch(
        createBookingThunk({
          service: selectedService,
          company_id: companyId,
          start_time: selectedTimeSlot.startTime.toISOString(),
          end_time: selectedTimeSlot.endTime.toISOString(),
          notes: formData.notes,
          client_id: user?.id,
          client_name: formData.firstName + " " + formData.lastName,
          client_email: formData.email,
          client_phone: formData.phone,
          service_id: selectedService.id,
        })
      );

      setConfirmDialogOpen(false);
      setSuccessDialogOpen(true);
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

  // Reset booking flow
  const resetBookingFlow = () => {
    setSelectedService(null);
    setSelectedDate(new Date());
    setSelectedTimeSlot(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      notes: "",
    });
    setCurrentStep(0);
    setSuccessDialogOpen(false);
  };

  // Navigate calendar
  const goToPreviousWeek = () => {
    if (calendarPage > 0) {
      setCalendarPage(calendarPage - 1);
    }
  };

  const goToNextWeek = () => {
    if (calendarDates.length === daysToShow) {
      setCalendarPage(calendarPage + 1);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return {
      day: format(date, "d", { locale: fr }),
      weekday: format(date, "EEE", { locale: fr }),
      month: format(date, "MMM", { locale: fr }),
      full: format(date, "EEEE d MMMM", { locale: fr }),
    };
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    return format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
  };

  // Group time slots by hour for better display
  const groupedTimeSlots = timeSlots.reduce<Record<string, TimeSlot[]>>(
    (acc, slot) => {
      const hour = format(slot.startTime, "HH:00");
      if (!acc[hour]) {
        acc[hour] = [];
      }
      acc[hour].push(slot);
      return acc;
    },
    {}
  );

  return (
    <Card className="border-0 shadow-lg rounded-xl overflow-hidden max-h-[80vh] flex flex-col">
      <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
        {/* Stepper */}
        <div className="bg-primary/5 p-4 border-b border-border">
          <div className="flex justify-between items-center">
            <div
              className={`flex items-center cursor-pointer ${
                currentStep > 0 ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={() => currentStep > 0 && setCurrentStep(0)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                  currentStep >= 0
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                1
              </div>
              <span className="hidden sm:inline">Service</span>
            </div>
            <div className="flex-grow mx-2 h-1 bg-muted">
              <div
                className={`h-full bg-primary transition-all ${
                  currentStep > 0 ? "w-full" : "w-0"
                }`}
              ></div>
            </div>
            <div
              className={`flex items-center cursor-pointer ${
                currentStep > 1 ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={() => currentStep > 1 && setCurrentStep(1)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                  currentStep >= 1
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                2
              </div>
              <span className="hidden sm:inline">Date</span>
            </div>
            <div className="flex-grow mx-2 h-1 bg-muted">
              <div
                className={`h-full bg-primary transition-all ${
                  currentStep > 1 ? "w-full" : "w-0"
                }`}
              ></div>
            </div>
            <div
              className={`flex items-center cursor-pointer ${
                currentStep > 2 ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={() => currentStep > 2 && setCurrentStep(2)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                  currentStep >= 2
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                3
              </div>
              <span className="hidden sm:inline">Heure</span>
            </div>
            <div className="flex-grow mx-2 h-1 bg-muted">
              <div
                className={`h-full bg-primary transition-all ${
                  currentStep > 2 ? "w-full" : "w-0"
                }`}
              ></div>
            </div>
            <div
              className={`flex items-center ${
                currentStep > 3 ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                  currentStep >= 3
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                4
              </div>
              <span className="hidden sm:inline">Détails</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 overflow-auto flex-1">
          {/* Left Panel - Content changes based on current step */}
          <div className="md:col-span-2 p-4 sm:p-6">
            {/* Step 1: Service Selection */}
            {currentStep === 0 && (
              <div>
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
            )}

            {/* Step 2: Date Selection */}
            {currentStep === 1 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-primary" />
                  Sélectionnez une date
                </h3>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={goToPreviousWeek}
                      disabled={calendarPage === 0}
                      className="p-2 rounded-full hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h4 className="text-lg font-medium">
                      {format(calendarDates[0], "MMMM yyyy", { locale: fr })}
                    </h4>
                    <button
                      onClick={goToNextWeek}
                      disabled={calendarDates.length < daysToShow}
                      className="p-2 rounded-full hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                    {calendarDates.map((date) => {
                      const formattedDate = formatDate(date);
                      const isSelected =
                        format(selectedDate, "yyyy-MM-dd") ===
                        format(date, "yyyy-MM-dd");

                      return (
                        <div
                          key={date.toISOString()}
                          className={`flex flex-col items-center p-2 rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? "bg-primary text-white"
                              : isToday(date)
                              ? "bg-primary/10 hover:bg-primary/20"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => handleDateSelect(date)}
                        >
                          <span className="text-xs uppercase">
                            {formattedDate.weekday}
                          </span>
                          <span className="text-xl font-semibold">
                            {formattedDate.day}
                          </span>
                          <span className="text-xs">{formattedDate.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setCurrentStep(0)}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                  <Button onClick={() => selectedDate && setCurrentStep(2)}>
                    Continuer
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Time Selection */}
            {currentStep === 2 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-primary" />
                  Sélectionnez une heure
                </h3>

                <div className="mb-4">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    Horaires disponibles pour le{" "}
                    {format(selectedDate, "EEEE d MMMM", { locale: fr })}
                  </h4>

                  {loadingTimeSlots ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : timeSlots.length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(groupedTimeSlots).map(([hour, slots]) => (
                        <div key={hour}>
                          <h5 className="text-sm font-medium mb-2">{hour}</h5>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {slots.map((slot, index) => (
                              <Button
                                key={index}
                                variant={
                                  selectedTimeSlot?.startTime.getTime() ===
                                  slot.startTime.getTime()
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className="w-full"
                                disabled={!slot.available}
                                onClick={() =>
                                  slot.available && handleTimeSlotSelect(slot)
                                }
                              >
                                {format(slot.startTime, "HH:mm")}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucun horaire disponible pour cette date.
                    </div>
                  )}
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                  <Button
                    onClick={() => selectedTimeSlot && setCurrentStep(3)}
                    disabled={!selectedTimeSlot}
                  >
                    Continuer
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Customer Information */}
            {currentStep === 3 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary" />
                  Vos informations
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optionnel)</Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Informations supplémentaires..."
                        className="resize-none pl-10"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Retour
                    </Button>
                    <Button type="submit">Réserver maintenant</Button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right Panel - Booking Summary */}
          <div className="bg-muted/30 p-4 sm:p-6 border-t md:border-t-0 md:border-l border-border">
            <h3 className="text-lg font-semibold mb-4">Récapitulatif</h3>

            {selectedService ? (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-medium mb-2">{selectedService.name}</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Prix</span>
                    <span className="font-medium">
                      {selectedService.price}€
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Durée</span>
                    <span>{selectedService.duration} min</span>
                  </div>
                </div>

                {selectedDate && (
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date</span>
                      <span>
                        {format(selectedDate, "EEEE d MMMM", { locale: fr })}
                      </span>
                    </div>

                    {selectedTimeSlot && (
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-muted-foreground">Heure</span>
                        <span>
                          {format(selectedTimeSlot.startTime, "HH:mm")} -{" "}
                          {format(selectedTimeSlot.endTime, "HH:mm")}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {currentStep >= 3 && (
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-medium mb-2">Informations client</h4>
                    {formData.firstName && formData.lastName && (
                      <div className="text-sm">
                        <span>
                          {formData.firstName} {formData.lastName}
                        </span>
                      </div>
                    )}
                    {formData.email && (
                      <div className="text-sm text-muted-foreground">
                        {formData.email}
                      </div>
                    )}
                    {formData.phone && (
                      <div className="text-sm text-muted-foreground">
                        {formData.phone}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Veuillez sélectionner un service pour commencer.
              </div>
            )}
          </div>
        </div>
      </CardContent>

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

          {selectedService && selectedDate && selectedTimeSlot && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                      {format(selectedTimeSlot.startTime, "HH:mm")} -{" "}
                      {format(selectedTimeSlot.endTime, "HH:mm")}
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
      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connexion requise</DialogTitle>
            <DialogDescription>
              Vous devez être connecté pour effectuer une réservation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <p className="text-center">
              Veuillez vous connecter ou créer un compte pour continuer votre
              réservation.
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setShowAuthDialog(false);
                router.push(`/login?redirect=/booking/${companyId}`);
              }}
            >
              Se connecter
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                setShowAuthDialog(false);
                router.push(`/signup?redirect=/booking/${companyId}`);
              }}
            >
              Créer un compte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-green-600">
              <Check className="w-5 h-5 mr-2" />
              Réservation confirmée
            </DialogTitle>
            <DialogDescription>
              Votre rendez-vous a été enregistré avec succès.
            </DialogDescription>
          </DialogHeader>

          {selectedService && selectedDate && selectedTimeSlot && (
            <div className="space-y-4 my-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="text-center mb-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="font-medium text-green-800">
                    Merci pour votre réservation !
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {format(selectedDate, "EEEE d MMMM", { locale: fr })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Heure:</span>
                    <span className="font-medium">
                      {format(selectedTimeSlot.startTime, "HH:mm")}
                    </span>
                  </div>
                  {/* <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Numéro de réservation:
                    </span>
                    <span className="font-medium">{bookingId || "N/A"}</span>
                  </div> */}
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Un email de confirmation a été envoyé à {formData.email}. Vous
                recevrez également un rappel 24 heures avant votre rendez-vous.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button onClick={resetBookingFlow}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
