"use client";

import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Appointment } from "@/types";
import { useTranslations } from "@/hooks/useTranslations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useDispatch } from "react-redux";
import {
  addAppointmentRealtime,
  updateAppointmentRealtime,
  deleteAppointmentRealtime,
} from "@/lib/redux/slices/appointmentsSlice";

interface AppointmentCalendarProps {
  appointments?: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onDateSelect?: (start: Date, end: Date) => void;
  isReadOnly?: boolean;
}

export function AppointmentCalendar({
  appointments = [],
  onAppointmentClick,
  onDateSelect,
  isReadOnly = false,
}: AppointmentCalendarProps) {
  const dispatch = useDispatch();
  const { t } = useTranslations();
  const calendarRef = useRef<FullCalendar | null>(null);
  const [view, setView] = useState<"timeGridWeek" | "timeGridDay">(
    "timeGridWeek"
  );

  // Set up Supabase Realtime subscription
  useEffect(() => {
    const subscription = supabase
      .channel("appointments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            dispatch(addAppointmentRealtime(payload.new as Appointment));
          } else if (payload.eventType === "UPDATE") {
            dispatch(updateAppointmentRealtime(payload.new as Appointment));
          } else if (payload.eventType === "DELETE") {
            dispatch(deleteAppointmentRealtime(payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  // Convert appointments to FullCalendar events
  const events = appointments.map((appointment) => ({
    id: appointment.id,
    title: appointment.client_name,
    start: appointment.start_time,
    end: appointment.end_time,
    extendedProps: { appointment },
    className: `status-${appointment.status}`,
  }));

  // Handle date selection for creating new appointments
  const handleDateSelect = (selectInfo: any) => {
    if (isReadOnly) return;
    if (onDateSelect) {
      onDateSelect(selectInfo.start, selectInfo.end);
    }
  };

  // Handle clicking on an existing appointment
  const handleEventClick = (clickInfo: any) => {
    if (onAppointmentClick) {
      onAppointmentClick(clickInfo.event.extendedProps.appointment);
    }
  };

  // Switch between week and day view
  const switchToWeekView = () => {
    setView("timeGridWeek");
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView("timeGridWeek");
    }
  };

  const switchToDayView = () => {
    setView("timeGridDay");
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView("timeGridDay");
    }
  };

  return (
    <Card className="border-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          {t("dashboard.appointments")}
        </CardTitle>
        <div className="flex space-x-2">
          <Button
            variant={view === "timeGridWeek" ? "default" : "outline"}
            size="sm"
            onClick={switchToWeekView}
          >
            <Calendar className="h-4 w-4 mr-2" />
            {t("calendar.weekView")}
          </Button>
          <Button
            variant={view === "timeGridDay" ? "default" : "outline"}
            size="sm"
            onClick={switchToDayView}
          >
            <Clock className="h-4 w-4 mr-2" />
            {t("calendar.dayView")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[600px]">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={view}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "",
            }}
            events={events}
            selectable={!isReadOnly}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            height="100%"
            slotDuration="00:15:00"
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5, 6],
              startTime: "09:00",
              endTime: "19:00",
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
