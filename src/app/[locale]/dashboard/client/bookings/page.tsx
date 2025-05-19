"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  format,
  parseISO,
  isToday,
  isTomorrow,
  isThisWeek,
  isAfter,
} from "date-fns";
import { fr } from "date-fns/locale/fr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Clock,
  MoreHorizontal,
  XCircle,
  User,
  Phone,
  Mail,
  MessageSquare,
  Building,
  MapPin,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import {
  fetchBookingByUserIdThunk,
  selectBookingByUserId,
  selectBookingLoading,
  updateBookingThunk,
} from "@/lib/redux/slices/bookingSlice";

import { useAppSelector, useAppDispatch } from "@/lib/redux/store";
import { Booking } from "@/types";

export default function ClientBookingsPage() {
  const { t } = useTranslations();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const bookingHistory = useAppSelector(selectBookingByUserId);
  const bookingLoading = useAppSelector(selectBookingLoading);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Booking | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!isAuthenticated || !user) return;

      if (!bookingHistory) {
        dispatch(fetchBookingByUserIdThunk());
      }
    };

    if (!authLoading) {
      fetchAppointments();
    }
  }, [user, isAuthenticated, authLoading, toast, dispatch]);

  // Filter appointments based on active tab
  const filteredAppointments = bookingHistory.filter((appointment) => {
    const startTime = parseISO(appointment.start_time);
    const now = new Date();

    switch (activeTab) {
      case "upcoming":
        return (
          (appointment.status === "pending" ||
            appointment.status === "confirmed") &&
          isAfter(startTime, now)
        );
      case "today":
        return (
          (appointment.status === "pending" ||
            appointment.status === "confirmed") &&
          isToday(startTime)
        );
      case "past":
        return (
          appointment.status === "completed" ||
          (!isAfter(startTime, now) &&
            (appointment.status === "pending" ||
              appointment.status === "confirmed"))
        );
      case "cancelled":
        return appointment.status === "cancelled";
      default:
        return true;
    }
  });

  // Handle appointment cancellation
  const cancelAppointment = async (appointmentId: string) => {
    try {
      dispatch(
        updateBookingThunk({
          booking: bookingHistory.find(
            (booking) => booking.id === appointmentId
          ) as Booking,
          status: "cancelled",
        })
      );

      toast({
        title: "Succès",
        description: "Votre rendez-vous a été annulé.",
      });

      setConfirmDialogOpen(false);
      setDetailsDialogOpen(false);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'annuler le rendez-vous.",
        variant: "destructive",
      });
    }
  };

  // Format date for display
  const formatAppointmentDate = (dateString: string) => {
    const date = parseISO(dateString);

    if (isToday(date)) {
      return `Aujourd'hui à ${format(date, "HH:mm")}`;
    } else if (isTomorrow(date)) {
      return `Demain à ${format(date, "HH:mm")}`;
    } else {
      return format(date, "EEEE d MMMM à HH:mm", { locale: fr });
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            {t("bookings.status.pending")}
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {t("bookings.status.confirmed")}
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {t("bookings.status.cancelled")}
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {t("bookings.status.completed")}
          </span>
        );
      default:
        return null;
    }
  };

  if (authLoading || bookingLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Accès non autorisé
          </h1>
          <p className="text-gray-600 mb-6">
            Veuillez vous connecter pour accéder à cette page.
          </p>
          <Button asChild>
            <a href="/login">Se connecter</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">{t("bookings.title")}</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {
                bookingHistory.filter(
                  (a) =>
                    (a.status === "pending" || a.status === "confirmed") &&
                    isToday(parseISO(a.start_time))
                ).length
              }
            </div>
            <p className="text-muted-foreground">{t("bookings.stats.today")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {
                bookingHistory.filter(
                  (a) =>
                    (a.status === "pending" || a.status === "confirmed") &&
                    isAfter(parseISO(a.start_time), new Date())
                ).length
              }
            </div>
            <p className="text-muted-foreground">
              {t("bookings.stats.upcoming")}
            </p>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 md:col-span-1">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {bookingHistory.filter((a) => a.status === "cancelled").length}
            </div>
            <p className="text-muted-foreground">
              {t("bookings.stats.cancelled")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4 w-full flex flex-wrap sm:flex-nowrap">
          <TabsTrigger className="flex-1" value="upcoming">
            {t("bookings.tabs.upcoming")}
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="today">
            {t("bookings.tabs.today")}
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="past">
            {t("bookings.tabs.past")}
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="cancelled">
            {t("bookings.tabs.cancelled")}
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <TabsContent value={activeTab} className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "upcoming" && t("bookings.tabs.upcoming")}
                {activeTab === "today" && t("bookings.tabs.today")}
                {activeTab === "past" && t("bookings.tabs.past")}
                {activeTab === "cancelled" && t("bookings.tabs.cancelled")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {filteredAppointments.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[30%]">
                          {t("bookings.table.professional")}
                        </TableHead>
                        <TableHead className="w-[25%]">
                          {t("bookings.table.service")}
                        </TableHead>
                        <TableHead className="w-[25%]">
                          {t("bookings.table.date")} &{" "}
                          {t("bookings.table.time")}
                        </TableHead>
                        <TableHead className="w-[10%]">
                          {t("bookings.table.status")}
                        </TableHead>
                        <TableHead className="text-right w-[10%]">
                          {t("bookings.table.actions")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell className="font-medium">
                            <div className="truncate max-w-[200px]">
                              {appointment.company?.name}
                            </div>
                            <p className="text-xs sm:text-sm flex items-center">
                              <MapPin className="w-3 h-3 mr-1 text-muted-foreground flex-shrink-0" />
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                  appointment.company?.address
                                    ?.formatted_address || ""
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-600 hover:underline truncate"
                              >
                                {
                                  appointment.company?.address
                                    ?.formatted_address
                                }
                              </a>
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="truncate max-w-[150px]">
                              {appointment.service?.name}
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              {appointment.service?.duration} min •{" "}
                              {appointment.service?.price} FCFA
                            </div>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            {formatAppointmentDate(appointment.start_time)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(appointment.status ?? "pending")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setDetailsDialogOpen(true);
                              }}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">
                                {t("bookings.details.title")}
                              </span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t("bookings.noBookings")}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Appointment Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)] overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{t("bookings.details.title")}</DialogTitle>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                  {t("bookings.details.dateTime")}
                </h3>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm sm:text-base">
                    {format(
                      parseISO(selectedAppointment.start_time),
                      "EEEE d MMMM yyyy",
                      { locale: fr }
                    )}
                  </p>
                  <p className="text-xs sm:text-sm">
                    {format(parseISO(selectedAppointment.start_time), "HH:mm")}{" "}
                    - {format(parseISO(selectedAppointment.end_time), "HH:mm")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium flex items-center">
                  <Building className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                  {t("bookings.details.provider")}
                </h3>
                <div className="bg-muted p-3 rounded-md space-y-1">
                  <p className="font-medium">
                    {selectedAppointment.company?.name}
                  </p>
                  <p className="text-xs sm:text-sm flex items-center">
                    <MapPin className="w-3 h-3 mr-1 text-muted-foreground flex-shrink-0" />
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        selectedAppointment.company?.address
                          ?.formatted_address || ""
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 hover:underline truncate"
                    >
                      {selectedAppointment.company?.address?.formatted_address}
                    </a>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                  {t("bookings.details.service")}
                </h3>
                <div className="bg-muted p-3 rounded-md">
                  <p className="font-medium text-sm sm:text-base">
                    {selectedAppointment.service?.name}
                  </p>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>{selectedAppointment.service?.duration} minutes</span>
                    <span className="font-medium">
                      {selectedAppointment.service?.price} FCFA
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium flex items-center">
                  <User className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                  {t("bookings.details.yourInfo")}
                </h3>
                <div className="bg-muted p-3 rounded-md space-y-1">
                  <p className="font-medium">
                    {selectedAppointment.client_name}
                  </p>
                  <p className="text-xs sm:text-sm flex items-center">
                    <Mail className="w-3 h-3 mr-1 text-muted-foreground flex-shrink-0" />
                    {selectedAppointment.client_email}
                  </p>
                  <p className="text-xs sm:text-sm flex items-center">
                    <Phone className="w-3 h-3 mr-1 text-muted-foreground flex-shrink-0" />
                    {selectedAppointment.client_phone}
                  </p>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                    {t("bookings.details.notes")}
                  </h3>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-xs sm:text-sm">
                      {selectedAppointment.notes}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-medium">{t("bookings.details.status")}</h3>
                <div className="flex justify-between items-center">
                  <div>
                    {getStatusBadge(selectedAppointment.status ?? "pending")}
                  </div>

                  {(selectedAppointment.status === "pending" ||
                    selectedAppointment.status === "confirmed") && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setDetailsDialogOpen(false);
                        setConfirmDialogOpen(true);
                      }}
                    >
                      <span className="hidden sm:inline">
                        {t("bookings.details.cancel")}
                      </span>
                      <XCircle className="w-4 h-4 sm:ml-2 sm:hidden" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDetailsDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              {t("bookings.details.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Cancellation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle>{t("bookings.cancelDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("bookings.cancelDialog.description")}
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="bg-muted p-3 rounded-md mb-4">
              <p className="font-medium text-sm sm:text-base">
                {selectedAppointment.company?.name}
              </p>
              <p className="text-xs sm:text-sm">
                {selectedAppointment.service?.name}
              </p>
              <p className="text-xs sm:text-sm">
                {formatAppointmentDate(selectedAppointment.start_time)}
              </p>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:space-x-0">
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={bookingLoading}
              className="w-full sm:w-auto"
            >
              {t("bookings.cancelDialog.back")}
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedAppointment &&
                cancelAppointment(selectedAppointment.id ?? "")
              }
              disabled={bookingLoading}
              className="w-full sm:w-auto"
            >
              {bookingLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              {t("bookings.cancelDialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
