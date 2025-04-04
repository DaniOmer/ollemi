"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const locale = useLocale();
  const { t } = useTranslations();

  // Get date-fns locale based on the current app locale
  const dateLocale = locale === "fr" ? fr : enUS;

  return (
    <DayPicker
      ISOWeek
      showOutsideDays={showOutsideDays}
      className={cn("p-4 rounded-xl", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-6",
        caption: "flex justify-center pt-1 relative items-center px-1 py-3",
        caption_label: "text-base font-medium",
        nav: "flex items-center justify-between px-1",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 bg-transparent p-0 rounded-full opacity-70 hover:opacity-100 hover:bg-accent hover:text-accent-foreground transition-colors"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-2",
        head_row: "flex justify-center",
        head_cell:
          "text-muted-foreground rounded-md w-12 font-medium text-[0.8rem] py-2 flex items-center justify-center",
        row: "flex w-full mt-1 justify-center",
        cell: "relative p-0 text-center text-sm w-12 flex items-center justify-center focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
        day: "h-10 w-10 p-0 font-normal rounded-full aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full shadow-sm",
        day_today:
          "border-2 border-primary/50 text-accent-foreground font-medium",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent/20 aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      formatters={{
        formatCaption: (date, options) => {
          return format(date, "MMMM yyyy", { locale: dateLocale });
        },
        formatWeekdayName: (weekday, options) => {
          return format(weekday, "EEE", { locale: dateLocale });
        },
      }}
      locale={dateLocale}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
