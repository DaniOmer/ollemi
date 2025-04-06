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
  startOfDay,
  endOfDay,
  isWithinInterval,
} from "date-fns";
import { fr } from "date-fns/locale/fr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  CalendarIcon,
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
import { Booking, BookingStatus } from "@/types";
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
  const [confirmAction, setConfirmAction] = useState<BookingStatus | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState(false);

  // Filter state
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    clientName: "",
    serviceId: "all",
    dateRange: null as Date | null,
    status: "all",
  });
  const [activeFilters, setActiveFilters] = useState(false);

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

  // Apply filters to bookings
  const applyFilters = (bookings: Booking[]) => {
    return bookings.filter((booking) => {
      // Filter by client name
      if (
        filters.clientName &&
        !booking.client_name
          ?.toLowerCase()
          .includes(filters.clientName.toLowerCase())
      ) {
        return false;
      }

      // Filter by service
      if (
        filters.serviceId &&
        filters.serviceId !== "all" &&
        booking.service.id !== filters.serviceId
      ) {
        return false;
      }

      // Filter by date
      if (filters.dateRange) {
        const bookingDate = parseISO(booking.start_time);
        const filterDate = filters.dateRange;

        if (
          !isWithinInterval(bookingDate, {
            start: startOfDay(filterDate),
            end: endOfDay(filterDate),
          })
        ) {
          return false;
        }
      }

      // Filter by status
      if (
        filters.status &&
        filters.status !== "all" &&
        booking.status !== filters.status
      ) {
        return false;
      }

      return true;
    });
  };

  // Filter appointments based on active tab and additional filters
  const filteredBookings = applyFilters(
    bookings.filter((booking) => {
      const startTime = parseISO(booking.start_time);
      const now = new Date();

      switch (activeTab) {
        case "upcoming":
          return (
            (booking.status === BookingStatus.PENDING ||
              booking.status === BookingStatus.CONFIRMED) &&
            isAfter(startTime, now)
          );
        case "today":
          return (
            (booking.status === BookingStatus.PENDING ||
              booking.status === BookingStatus.CONFIRMED) &&
            isToday(startTime)
          );
        case "tomorrow":
          return (
            (booking.status === BookingStatus.PENDING ||
              booking.status === BookingStatus.CONFIRMED) &&
            isTomorrow(startTime)
          );
        case "thisWeek":
          return (
            (booking.status === BookingStatus.PENDING ||
              booking.status === BookingStatus.CONFIRMED) &&
            isThisWeek(startTime, { weekStartsOn: 1 })
          );
        case "completed":
          return booking.status === BookingStatus.COMPLETED;
        case "cancelled":
          return booking.status === BookingStatus.CANCELLED;
        default:
          return true;
      }
    })
  );

  // Reset filters
  const resetFilters = () => {
    setFilters({
      clientName: "",
      serviceId: "all",
      dateRange: null,
      status: "all",
    });
    setActiveFilters(false);
  };

  // Apply filter changes
  const applyFilterChanges = () => {
    // Check if any filters are active
    const hasActiveFilters =
      filters.clientName !== "" ||
      filters.serviceId !== "all" ||
      filters.dateRange !== null ||
      filters.status !== "all";

    setActiveFilters(hasActiveFilters);
    setFilterDialogOpen(false);
  };

  // Handle appointment status update
  const updateBookingStatus = async (
    booking: Booking,
    status: BookingStatus
  ) => {
    try {
      dispatch(updateBookingThunk({ booking, status }));

      if (bookingStatus === "succeeded") {
        toast({
          title: "Succès",
          description: `Le rendez-vous a été ${
            status === BookingStatus.CONFIRMED
              ? "confirmé"
              : status === BookingStatus.COMPLETED
              ? "marqué comme terminé"
              : "annulé"
          }.`,
        });
      }

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
  const openConfirmDialog = (booking: Booking, action: BookingStatus) => {
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
  const getStatusBadge = (status: string | undefined) => {
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
        <Button
          variant={activeFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterDialogOpen(true)}
        >
          <Filter className="w-4 h-4 mr-2" />
          {activeFilters ? "Filtres actifs" : "Filtrer"}
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
                          <div>{booking.service?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {booking.service?.duration} min •{" "}
                            {booking.service?.price}€
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
                                    openConfirmDialog(
                                      booking,
                                      BookingStatus.CONFIRMED
                                    )
                                  }
                                >
                                  Confirmer
                                </DropdownMenuItem>
                              )}

                              {(booking.status === "pending" ||
                                booking.status === "confirmed") && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    openConfirmDialog(
                                      booking,
                                      BookingStatus.CANCELLED
                                    )
                                  }
                                  className="text-red-600"
                                >
                                  Annuler
                                </DropdownMenuItem>
                              )}

                              {booking.status === "confirmed" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    openConfirmDialog(
                                      booking,
                                      BookingStatus.COMPLETED
                                    )
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
                  <CalendarIcon className="w-4 h-4 mr-2 text-primary" />
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
                          openConfirmDialog(
                            selectedBooking,
                            BookingStatus.CONFIRMED
                          )
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
                          openConfirmDialog(
                            selectedBooking,
                            BookingStatus.CANCELLED
                          )
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
                          openConfirmDialog(
                            selectedBooking,
                            BookingStatus.COMPLETED
                          )
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

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filtrer les rendez-vous</DialogTitle>
            <DialogDescription>
              Affinez votre liste de rendez-vous en utilisant les filtres
              ci-dessous.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nom du client</Label>
              <Input
                id="clientName"
                placeholder="Rechercher par nom"
                value={filters.clientName}
                onChange={(e) =>
                  setFilters({ ...filters, clientName: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service">Service</Label>
              <Select
                value={filters.serviceId}
                onValueChange={(value) =>
                  setFilters({ ...filters, serviceId: value })
                }
              >
                <SelectTrigger id="service">
                  <SelectValue placeholder="Tous les services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les services</SelectItem>
                  {/* Get unique services from bookings */}
                  {Array.from(new Set(bookings.map((b) => b.service?.id))).map(
                    (serviceId) => {
                      const service = bookings.find(
                        (b) => b.service?.id === serviceId
                      )?.service;
                      return (
                        <SelectItem key={serviceId} value={serviceId}>
                          {service?.name}
                        </SelectItem>
                      );
                    }
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <DatePicker
                date={filters.dateRange}
                onSelect={(date) => setFilters({ ...filters, dateRange: date })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="confirmed">Confirmé</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button variant="outline" onClick={resetFilters}>
              Réinitialiser
            </Button>
            <Button onClick={applyFilterChanges}>Appliquer les filtres</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Action Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === BookingStatus.CONFIRMED &&
                "Confirmer le rendez-vous"}
              {confirmAction === BookingStatus.CANCELLED &&
                "Annuler le rendez-vous"}
              {confirmAction === BookingStatus.COMPLETED &&
                "Marquer comme terminé"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === BookingStatus.CONFIRMED &&
                "Êtes-vous sûr de vouloir confirmer ce rendez-vous ?"}
              {confirmAction === BookingStatus.CANCELLED &&
                "Êtes-vous sûr de vouloir annuler ce rendez-vous ?"}
              {confirmAction === BookingStatus.COMPLETED &&
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

          <DialogFooter className="flex space-x-2">
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
              variant={
                confirmAction === BookingStatus.CANCELLED
                  ? "destructive"
                  : "default"
              }
            >
              {actionLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : confirmAction === BookingStatus.CONFIRMED ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : confirmAction === BookingStatus.CANCELLED ? (
                <XCircle className="w-4 h-4 mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {confirmAction === BookingStatus.CONFIRMED && "Confirmer"}
              {confirmAction === BookingStatus.CANCELLED && "Annuler"}
              {confirmAction === BookingStatus.COMPLETED && "Terminer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
