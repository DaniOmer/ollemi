"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus } from "lucide-react";

// Components
import { AppointmentCalendar } from "@/components/calendar/AppointmentCalendar";
import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Redux
import {
  fetchAppointments,
  updateAppointment,
  deleteAppointment,
  createAppointment,
  selectAppointments,
  selectUpcomingAppointments,
  selectAppointmentsLoading,
  selectAppointmentsError,
} from "@/lib/redux/slices/appointmentsSlice";
import { selectServices } from "@/lib/redux/slices/companiesSlice";
import { AppDispatch } from "@/lib/redux/store";
import { Appointment, Service } from "@/types";

export default function BookingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const appointments = useSelector(selectAppointments);
  const upcomingAppointments = useSelector(selectUpcomingAppointments);
  const services = useSelector(selectServices);
  const loading = useSelector(selectAppointmentsLoading);
  const error = useSelector(selectAppointmentsError);

  // UI state
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch appointments on component mount
  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  // Handle appointment form submission
  const handleAppointmentSubmit = (formData: any) => {
    if (editingAppointment) {
      dispatch(
        updateAppointment({
          id: editingAppointment.id,
          appointment: formData,
        })
      );
    } else {
      dispatch(createAppointment(formData));
    }
    setShowAppointmentForm(false);
    setEditingAppointment(null);
    setSelectedTimeSlot(null);
  };

  // Handle appointment confirmation
  const handleConfirmAppointment = (appointmentId: string) => {
    dispatch(
      updateAppointment({
        id: appointmentId,
        appointment: { status: "confirmed" },
      })
    );
  };

  // Handle appointment cancellation
  const handleCancelAppointment = (appointmentId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) {
      dispatch(
        updateAppointment({
          id: appointmentId,
          appointment: { status: "cancelled" },
        })
      );
    }
  };

  // Filter appointments by status
  const filteredAppointments = appointments.filter(
    (appointment: Appointment) => {
      if (statusFilter === "all") return true;
      return appointment.status === statusFilter;
    }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rendez-vous</h1>
          <p className="text-muted-foreground">
            Gérez vos rendez-vous et votre planning
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={view}
            onValueChange={(value: "calendar" | "list") => setView(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Vue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calendar">Calendrier</SelectItem>
              <SelectItem value="list">Liste</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="confirmed">Confirmé</SelectItem>
              <SelectItem value="cancelled">Annulé</SelectItem>
              <SelectItem value="completed">Terminé</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowAppointmentForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau rendez-vous
          </Button>
        </div>
      </div>

      {/* Appointment Form Modal */}
      {showAppointmentForm && (
        <Card>
          <CardContent className="pt-6">
            <AppointmentForm
              services={services}
              initialValues={
                editingAppointment
                  ? {
                      client_name: editingAppointment.client_name,
                      client_email: editingAppointment.client_email,
                      client_phone: editingAppointment.client_phone || "",
                      service_id: editingAppointment.service_id,
                      date: new Date(editingAppointment.start_time),
                      start_time: new Date(editingAppointment.start_time),
                      notes: editingAppointment.notes || "",
                    }
                  : selectedTimeSlot
                  ? {
                      date: selectedTimeSlot.start,
                      start_time: selectedTimeSlot.start,
                    }
                  : undefined
              }
              onSubmit={handleAppointmentSubmit}
              isLoading={loading}
            />
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      {view === "calendar" && (
        <Card>
          <CardContent className="pt-6">
            <AppointmentCalendar
              appointments={filteredAppointments}
              onAppointmentClick={(appointment) => {
                setEditingAppointment(appointment);
                setShowAppointmentForm(true);
              }}
              onDateSelect={(start, end) => {
                setSelectedTimeSlot({ start, end });
                setShowAppointmentForm(true);
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {view === "list" && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {filteredAppointments.map((appointment: Appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div>
                    <div className="font-medium">{appointment.client_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(appointment.start_time), "PPP", {
                        locale: fr,
                      })}{" "}
                      à {format(new Date(appointment.start_time), "HH:mm")} -{" "}
                      {
                        services.find(
                          (s: Service) => s.id === appointment.service_id
                        )?.name
                      }
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : appointment.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : appointment.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {appointment.status === "confirmed"
                        ? "Confirmé"
                        : appointment.status === "pending"
                        ? "En attente"
                        : appointment.status === "cancelled"
                        ? "Annulé"
                        : "Terminé"}
                    </span>
                    {appointment.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfirmAppointment(appointment.id)}
                      >
                        Confirmer
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelAppointment(appointment.id)}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingAppointment(appointment);
                        setShowAppointmentForm(true);
                      }}
                    >
                      Modifier
                    </Button>
                  </div>
                </div>
              ))}
              {filteredAppointments.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  Aucun rendez-vous trouvé
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
