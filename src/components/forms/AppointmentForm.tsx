"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useTranslations } from "@/hooks/useTranslations";
import { Service } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar, Clock, User, Mail, Phone } from "lucide-react";

// Define the form schema with zod
const appointmentFormSchema = z.object({
  client_name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  client_email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  client_phone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  service_id: z.string({
    required_error: "Please select a service.",
  }),
  date: z.date({
    required_error: "Please select a date.",
  }),
  start_time: z.date({
    required_error: "Please select a start time.",
  }),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  services: Service[];
  initialValues?: Partial<AppointmentFormValues>;
  onSubmit: (values: AppointmentFormValues) => void;
  isLoading?: boolean;
}

export function AppointmentForm({
  services,
  initialValues,
  onSubmit,
  isLoading = false,
}: AppointmentFormProps) {
  const { t } = useTranslations();
  const [selectedService, setSelectedService] = useState<Service | undefined>(
    initialValues?.service_id
      ? services.find((s) => s.id === initialValues.service_id)
      : undefined
  );

  // Set up the form with react-hook-form and zod validation
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      client_name: initialValues?.client_name || "",
      client_email: initialValues?.client_email || "",
      client_phone: initialValues?.client_phone || "",
      service_id: initialValues?.service_id || "",
      date: initialValues?.date || new Date(),
      start_time: initialValues?.start_time || new Date(),
      notes: initialValues?.notes || "",
    },
  });

  // Calculate end time based on service duration
  const calculateEndTime = (startTime: Date): Date => {
    if (!selectedService) return new Date(startTime.getTime() + 60 * 60 * 1000); // Default 1 hour

    const endTime = new Date(
      startTime.getTime() + selectedService.duration * 60 * 1000
    );
    return endTime;
  };

  // Handle form submission
  const handleSubmit = (values: AppointmentFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {t("appointment.clientInformation")}
            </h3>

            <FormField
              control={form.control}
              name="client_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("appointment.clientName")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder={t("appointment.clientNamePlaceholder")}
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="client_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("appointment.clientEmail")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder={t("appointment.clientEmailPlaceholder")}
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="client_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("appointment.clientPhone")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder={t("appointment.clientPhonePlaceholder")}
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Appointment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {t("appointment.appointmentDetails")}
            </h3>

            <FormField
              control={form.control}
              name="service_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("appointment.service")}</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedService(services.find((s) => s.id === value));
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("appointment.selectService")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - {service.price}€ ({service.duration}{" "}
                          min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("appointment.date")}</FormLabel>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <DatePicker
                      selected={field.value}
                      onChange={(date: Date) => field.onChange(date)}
                      dateFormat="dd/MM/yyyy"
                      locale={fr}
                      minDate={new Date()}
                      className="w-full pl-10 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("appointment.time")}</FormLabel>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <DatePicker
                      selected={field.value}
                      onChange={(date: Date) => field.onChange(date)}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15}
                      timeCaption={t("appointment.time")}
                      dateFormat="HH:mm"
                      className="w-full pl-10 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedService && (
              <div className="text-sm text-gray-500">
                {t("appointment.duration")}: {selectedService.duration} min
                <br />
                {t("appointment.endTime")}:{" "}
                {format(calculateEndTime(form.watch("start_time")), "HH:mm")}
              </div>
            )}
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("appointment.notes")}</FormLabel>
              <FormControl>
                <textarea
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder={t("appointment.notesPlaceholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline">
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
