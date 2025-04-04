"use client";

import * as React from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";
import { useTranslations } from "@/hooks/useTranslations";

interface DatePickerProps {
  date: Date | null;
  onSelect: (date: Date | null) => void;
  placeholder?: string;
}

export function DatePicker({ date, onSelect, placeholder }: DatePickerProps) {
  const locale = useLocale();
  const { t } = useTranslations();
  const dateLocale = locale === "fr" ? fr : enUS;

  // Use the translated placeholder or fallback to the provided one
  const defaultPlaceholder =
    t("client.home.search.datePlaceholder") || "Choose a date";
  const finalPlaceholder = placeholder || defaultPlaceholder;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          {date ? (
            format(date, "dd MMMM yyyy", { locale: dateLocale })
          ) : (
            <span>{finalPlaceholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-white shadow-lg rounded-lg"
        align="start"
      >
        <CalendarComponent
          mode="single"
          selected={date || undefined}
          onSelect={(date) => onSelect(date || null)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
