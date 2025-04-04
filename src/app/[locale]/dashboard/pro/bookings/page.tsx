"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "@/hooks/useTranslations";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  CheckCircle,
  XCircle,
  User,
  Phone,
  Mail,
  MessageSquare,
  Filter,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAppSelector, useAppDispatch } from "@/lib/redux/store";
import { selectUserProfile } from "@/lib/redux/slices/userSlice";
import { selectCurrentCompany } from "@/lib/redux/slices/companiesSlice";
import {
  selectBookings,
  selectBookingStatus,
  selectBookingError,
} from "@/lib/redux/slices/bookingSlice";
import { Booking } from "@/types";
import {
  updateBookingThunk,
  fetchBookingsThunk,
} from "@/lib/redux/slices/bookingSlice";

export default function ProBookingsPage() {
  const { t } = useTranslations();
  const { toast } = useToast();

  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "confirm" | "cancel" | "complete" | null
  >(null);
  const [actionLoading, setActionLoading] = useState(false);

  const user = useAppSelector(selectUserProfile);
  const company = useAppSelector(selectCurrentCompany);
  const bookings = useAppSelector(selectBookings);
  const bookingStatus = useAppSelector(selectBookingStatus);
  const bookingError = useAppSelector(selectBookingError);

  const loading = bookingStatus === "loading";

  // Fetch appointments
  useEffect(() => {
    if (user && company) {
      dispatch(fetchBookingsThunk(company.id));
    }
  }, [user, company, toast]);

  // Filter appointments based on active tab
  const filteredBookings = bookings.filter((booking) => {
    const startTime = parseISO(booking.start_time);
    const now = new Date();

    switch (activeTab) {
      case "upcoming":
        return (
          (booking.status === "pending" || booking.status === "confirmed") &&
          isAfter(startTime, now)
        );
      case "today":
        return (
          (booking.status === "pending" || booking.status === "confirmed") &&
          isToday(startTime)
        );
      case "tomorrow":
        return (
          (booking.status === "pending" || booking.status === "confirmed") &&
          isTomorrow(startTime)
        );
      case "thisWeek":
        return (
          (booking.status === "pending" || booking.status === "confirmed") &&
          isThisWeek(startTime, { weekStartsOn: 1 })
        );
      case "completed":
        return booking.status === "completed";
      case "cancelled":
        return booking.status === "cancelled";
      default:
        return true;
    }
  });

  // Handle appointment status update
  const updateBookingStatus = async (booking: Booking, status: string) => {
    try {
      dispatch(updateBookingThunk(booking));

      toast({
        title: "Succès",
        description: `Le rendez-vous a été ${
          status === "confirmed"
            ? "confirmé"
            : status === "cancelled"
            ? "annulé"
            : "marqué comme terminé"
        }.`,
      });

      setConfirmDialogOpen(false);
      setDetailsDialogOpen(false);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut du rendez-vous.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle confirm action
  const handleConfirmAction = () => {
    if (!selectedBooking || !confirmAction) return;

    updateBookingStatus(selectedBooking, confirmAction);
  };

  // Open confirm dialog
  const openConfirmDialog = (
    booking: Booking,
    action: "confirm" | "cancel" | "complete"
  ) => {
    setSelectedBooking(booking);
    setConfirmAction(action);
    setConfirmDialogOpen(true);
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
            En attente
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Confirmé
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Annulé
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Terminé
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des rendez-vous</h1>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filtrer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {
                bookings.filter(
                  (b) =>
                    (b.status === "pending" || b.status === "confirmed") &&
                    isToday(parseISO(b.start_time))
                ).length
              }
            </div>
            <p className="text-muted-foreground">Rendez-vous aujourd'hui</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {bookings.filter((b) => b.status === "pending").length}
            </div>
            <p className="text-muted-foreground">En attente de confirmation</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {
                bookings.filter(
                  (b) =>
                    (b.status === "pending" || b.status === "confirmed") &&
                    isThisWeek(parseISO(b.start_time), { weekStartsOn: 1 })
                ).length
              }
            </div>
            <p className="text-muted-foreground">Cette semaine</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {bookings.filter((b) => b.status === "completed").length}
            </div>
            <p className="text-muted-foreground">Rendez-vous terminés</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">À venir</TabsTrigger>
          <TabsTrigger value="today">Aujourd'hui</TabsTrigger>
          <TabsTrigger value="tomorrow">Demain</TabsTrigger>
          <TabsTrigger value="thisWeek">Cette semaine</TabsTrigger>
          <TabsTrigger value="completed">Terminés</TabsTrigger>
          <TabsTrigger value="cancelled">Annulés</TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <TabsContent value={activeTab} className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "upcoming" && "Rendez-vous à venir"}
                {activeTab === "today" && "Rendez-vous aujourd'hui"}
                {activeTab === "tomorrow" && "Rendez-vous demain"}
                {activeTab === "thisWeek" && "Rendez-vous cette semaine"}
                {activeTab === "completed" && "Rendez-vous terminés"}
                {activeTab === "cancelled" && "Rendez-vous annulés"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredBookings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date & Heure</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="font-medium">
                            {booking.client_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {booking.client_email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{booking.service.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {booking.service.duration} min •{" "}
                            {booking.service.price}€
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatAppointmentDate(booking.start_time)}
                        </TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setDetailsDialogOpen(true);
                                }}
                              >
                                Voir les détails
                              </DropdownMenuItem>

                              {booking.status === "pending" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    openConfirmDialog(booking, "confirm")
                                  }
                                >
                                  Confirmer
                                </DropdownMenuItem>
                              )}

                              {(booking.status === "pending" ||
                                booking.status === "confirmed") && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    openConfirmDialog(booking, "cancel")
                                  }
                                  className="text-red-600"
                                >
                                  Annuler
                                </DropdownMenuItem>
                              )}

                              {booking.status === "confirmed" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    openConfirmDialog(booking, "complete")
                                  }
                                >
                                  Marquer comme terminé
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun rendez-vous trouvé.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Appointment Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Détails du rendez-vous</DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  Date et heure
                </h3>
                <div className="bg-muted p-3 rounded-md">
                  <p>
                    {format(
                      parseISO(selectedBooking.start_time),
                      "EEEE d MMMM yyyy",
                      { locale: fr }
                    )}
                  </p>
                  <p className="text-sm">
                    {format(parseISO(selectedBooking.start_time), "HH:mm")} -{" "}
                    {format(parseISO(selectedBooking.end_time), "HH:mm")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium flex items-center">
                  <User className="w-4 h-4 mr-2 text-primary" />
                  Client
                </h3>
                <div className="bg-muted p-3 rounded-md space-y-1">
                  <p className="font-medium">{selectedBooking.client_name}</p>
                  <p className="text-sm flex items-center">
                    <Mail className="w-3 h-3 mr-1 text-muted-foreground" />
                    {selectedBooking.client_email}
                  </p>
                  <p className="text-sm flex items-center">
                    <Phone className="w-3 h-3 mr-1 text-muted-foreground" />
                    {selectedBooking.client_phone}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-primary" />
                  Service
                </h3>
                <div className="bg-muted p-3 rounded-md">
                  <p className="font-medium">{selectedBooking.service.name}</p>
                  <div className="flex justify-between text-sm">
                    <span>{selectedBooking.service.duration} minutes</span>
                    <span className="font-medium">
                      {selectedBooking.service.price}€
                    </span>
                  </div>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-primary" />
                    Notes
                  </h3>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">{selectedBooking.notes}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-medium">Statut</h3>
                <div className="flex justify-between">
                  <div>{getStatusBadge(selectedBooking.status)}</div>
                  <div className="space-x-2">
                    {selectedBooking.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          openConfirmDialog(selectedBooking, "confirm")
                        }
                      >
                        Confirmer
                      </Button>
                    )}

                    {(selectedBooking.status === "pending" ||
                      selectedBooking.status === "confirmed") && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          openConfirmDialog(selectedBooking, "cancel")
                        }
                      >
                        Annuler
                      </Button>
                    )}

                    {selectedBooking.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          openConfirmDialog(selectedBooking, "complete")
                        }
                      >
                        Terminé
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailsDialogOpen(false)}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Action Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "confirm" && "Confirmer le rendez-vous"}
              {confirmAction === "cancel" && "Annuler le rendez-vous"}
              {confirmAction === "complete" && "Marquer comme terminé"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "confirm" &&
                "Êtes-vous sûr de vouloir confirmer ce rendez-vous ?"}
              {confirmAction === "cancel" &&
                "Êtes-vous sûr de vouloir annuler ce rendez-vous ?"}
              {confirmAction === "complete" &&
                "Êtes-vous sûr de vouloir marquer ce rendez-vous comme terminé ?"}
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="bg-muted p-3 rounded-md mb-4">
              <p className="font-medium">{selectedBooking.client_name}</p>
              <p className="text-sm">{selectedBooking.service.name}</p>
              <p className="text-sm">
                {formatAppointmentDate(selectedBooking.start_time)}
              </p>
            </div>
          )}

          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={actionLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={actionLoading}
              variant={confirmAction === "cancel" ? "destructive" : "default"}
            >
              {actionLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : confirmAction === "confirm" ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : confirmAction === "cancel" ? (
                <XCircle className="w-4 h-4 mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {confirmAction === "confirm" && "Confirmer"}
              {confirmAction === "cancel" && "Annuler"}
              {confirmAction === "complete" && "Terminer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
