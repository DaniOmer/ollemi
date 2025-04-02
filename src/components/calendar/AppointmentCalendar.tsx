"use client";

import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Appointment, BusinessHours } from "@/types";
import { useTranslations } from "@/hooks/useTranslations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useDispatch } from "react-redux";
import { useLocale } from "next-intl";
import {
  addAppointmentRealtime,
  updateAppointmentRealtime,
  deleteAppointmentRealtime,
} from "@/lib/redux/slices/appointmentsSlice";

// Locale imports
import frLocale from "@fullcalendar/core/locales/fr";
import enLocale from "@fullcalendar/core/locales/en-gb";

interface AppointmentCalendarProps {
  appointments?: Appointment[];
  businessHours?: BusinessHours[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onDateSelect?: (start: Date, end: Date) => void;
  isReadOnly?: boolean;
}

export function AppointmentCalendar({
  appointments = [],
  businessHours = [],
  onAppointmentClick,
  onDateSelect,
  isReadOnly = false,
}: AppointmentCalendarProps) {
  const dispatch = useDispatch();
  const { t } = useTranslations();
  const locale = useLocale();
  const calendarRef = useRef<FullCalendar | null>(null);
  const [view, setView] = useState<"timeGridWeek" | "timeGridDay">(
    "timeGridWeek"
  );

  // Map to available locales for FullCalendar
  const getFullCalendarLocale = () => {
    switch (locale) {
      case "fr":
        return frLocale;
      case "en":
      default:
        return enLocale;
    }
  };

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

  // Convert business hours to FullCalendar business hours format
  const formattedBusinessHours =
    businessHours.length > 0
      ? businessHours
          .filter((hours) => hours.open)
          .map((hours) => {
            // Map day of week string to number (0=Sunday, 1=Monday, etc.)
            const daysMap: Record<string, number> = {
              monday: 1,
              tuesday: 2,
              wednesday: 3,
              thursday: 4,
              friday: 5,
              saturday: 6,
              sunday: 0,
            };

            const dayNumber = daysMap[hours.day_of_week];

            return {
              daysOfWeek: [dayNumber],
              startTime: hours.start_time,
              endTime: hours.end_time,
            };
          })
      : {
          // Default business hours if none provided
          daysOfWeek: [1, 2, 3, 4, 5, 6], // Monday to Saturday
          startTime: "09:00",
          endTime: "19:00",
        };

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
            businessHours={formattedBusinessHours}
            selectConstraint="businessHours"
            locale={getFullCalendarLocale()}
            firstDay={1} // 1 = Monday (0 would be Sunday)
            buttonText={{
              today: t("calendar.today"),
              day: t("calendar.dayView"),
              week: t("calendar.weekView"),
              month: t("calendar.monthView"),
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
