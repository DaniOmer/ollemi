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

interface Appointment {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  start_time: string;
  end_time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  service: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
  company: {
    id: string;
    name: string;
    address: string;
    city: string;
  };
}

export default function ClientBookingsPage() {
  const { t } = useTranslations();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!isAuthenticated || !user) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/bookings?clientId=${user.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await response.json();
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer vos rendez-vous.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchAppointments();
    }
  }, [user, isAuthenticated, authLoading, toast]);

  // Filter appointments based on active tab
  const filteredAppointments = appointments.filter((appointment) => {
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
      setActionLoading(true);

      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel appointment");
      }

      // Update local state
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === appointmentId ? { ...app, status: "cancelled" } : app
        )
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
    } finally {
      setActionLoading(false);
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

  if (authLoading || loading) {
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
      <h1 className="text-2xl font-bold mb-6">Mes rendez-vous</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {
                appointments.filter(
                  (a) =>
                    (a.status === "pending" || a.status === "confirmed") &&
                    isToday(parseISO(a.start_time))
                ).length
              }
            </div>
            <p className="text-muted-foreground">Aujourd'hui</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {
                appointments.filter(
                  (a) =>
                    (a.status === "pending" || a.status === "confirmed") &&
                    isAfter(parseISO(a.start_time), new Date())
                ).length
              }
            </div>
            <p className="text-muted-foreground">À venir</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {appointments.filter((a) => a.status === "cancelled").length}
            </div>
            <p className="text-muted-foreground">Annulés</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">À venir</TabsTrigger>
          <TabsTrigger value="today">Aujourd'hui</TabsTrigger>
          <TabsTrigger value="past">Passés</TabsTrigger>
          <TabsTrigger value="cancelled">Annulés</TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <TabsContent value={activeTab} className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "upcoming" && "Rendez-vous à venir"}
                {activeTab === "today" && "Rendez-vous aujourd'hui"}
                {activeTab === "past" && "Rendez-vous passés"}
                {activeTab === "cancelled" && "Rendez-vous annulés"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredAppointments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prestataire</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date & Heure</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div className="font-medium">
                            {appointment.company.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {appointment.company.address}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{appointment.service.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {appointment.service.duration} min •{" "}
                            {appointment.service.price}€
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatAppointmentDate(appointment.start_time)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(appointment.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setDetailsDialogOpen(true);
                            }}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Détails</span>
                          </Button>
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

          {selectedAppointment && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  Date et heure
                </h3>
                <div className="bg-muted p-3 rounded-md">
                  <p>
                    {format(
                      parseISO(selectedAppointment.start_time),
                      "EEEE d MMMM yyyy",
                      { locale: fr }
                    )}
                  </p>
                  <p className="text-sm">
                    {format(parseISO(selectedAppointment.start_time), "HH:mm")}{" "}
                    - {format(parseISO(selectedAppointment.end_time), "HH:mm")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium flex items-center">
                  <Building className="w-4 h-4 mr-2 text-primary" />
                  Prestataire
                </h3>
                <div className="bg-muted p-3 rounded-md space-y-1">
                  <p className="font-medium">
                    {selectedAppointment.company.name}
                  </p>
                  <p className="text-sm flex items-center">
                    <MapPin className="w-3 h-3 mr-1 text-muted-foreground" />
                    {selectedAppointment.company.address}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-primary" />
                  Service
                </h3>
                <div className="bg-muted p-3 rounded-md">
                  <p className="font-medium">
                    {selectedAppointment.service.name}
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>{selectedAppointment.service.duration} minutes</span>
                    <span className="font-medium">
                      {selectedAppointment.service.price}€
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium flex items-center">
                  <User className="w-4 h-4 mr-2 text-primary" />
                  Vos informations
                </h3>
                <div className="bg-muted p-3 rounded-md space-y-1">
                  <p className="font-medium">
                    {selectedAppointment.client_name}
                  </p>
                  <p className="text-sm flex items-center">
                    <Mail className="w-3 h-3 mr-1 text-muted-foreground" />
                    {selectedAppointment.client_email}
                  </p>
                  <p className="text-sm flex items-center">
                    <Phone className="w-3 h-3 mr-1 text-muted-foreground" />
                    {selectedAppointment.client_phone}
                  </p>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-primary" />
                    Notes
                  </h3>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">{selectedAppointment.notes}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-medium">Statut</h3>
                <div className="flex justify-between items-center">
                  <div>{getStatusBadge(selectedAppointment.status)}</div>

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
                      Annuler
                    </Button>
                  )}
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

      {/* Confirm Cancellation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Annuler le rendez-vous</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir annuler ce rendez-vous ?
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="bg-muted p-3 rounded-md mb-4">
              <p className="font-medium">{selectedAppointment.company.name}</p>
              <p className="text-sm">{selectedAppointment.service.name}</p>
              <p className="text-sm">
                {formatAppointmentDate(selectedAppointment.start_time)}
              </p>
            </div>
          )}

          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={actionLoading}
            >
              Retour
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedAppointment && cancelAppointment(selectedAppointment.id)
              }
              disabled={actionLoading}
            >
              {actionLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Confirmer l'annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
