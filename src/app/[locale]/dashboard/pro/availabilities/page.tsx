"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Clock,
  Save,
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  Calendar,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppSelector, useAppDispatch } from "@/lib/redux/store";
import { selectUserProfile } from "@/lib/redux/slices/userSlice";
import {
  fetchBusinessHours,
  updateBusinessHours,
  selectBusinessHours,
  selectAvailabilityLoading,
  selectAvailabilityError,
} from "@/lib/redux/slices/availabilitySlice";
import { BusinessHours } from "@/types";

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_LABELS = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche",
};

// Preset business hours templates
const PRESETS = {
  standard: {
    name: "Standard (9h-18h, Lun-Ven)",
    hours: DAYS_OF_WEEK.map((day) => ({
      day_of_week: day,
      open: ["monday", "tuesday", "wednesday", "thursday", "friday"].includes(
        day
      ),
      start_time: "09:00",
      end_time: "18:00",
      break_start_time: "12:00",
      break_end_time: "13:00",
    })),
  },
  extended: {
    name: "Horaires étendus (8h-20h, Lun-Sam)",
    hours: DAYS_OF_WEEK.map((day) => ({
      day_of_week: day,
      open: day !== "sunday",
      start_time: "08:00",
      end_time: "20:00",
      break_start_time: "12:00",
      break_end_time: "13:00",
    })),
  },
  weekend: {
    name: "Inclus le weekend (9h-18h, Lun-Dim)",
    hours: DAYS_OF_WEEK.map((day) => ({
      day_of_week: day,
      open: true,
      start_time: "09:00",
      end_time: "18:00",
      break_start_time: "12:00",
      break_end_time: "13:00",
    })),
  },
  noBreak: {
    name: "Sans pause déjeuner (9h-17h, Lun-Ven)",
    hours: DAYS_OF_WEEK.map((day) => ({
      day_of_week: day,
      open: ["monday", "tuesday", "wednesday", "thursday", "friday"].includes(
        day
      ),
      start_time: "09:00",
      end_time: "17:00",
      break_start_time: "",
      break_end_time: "",
    })),
  },
};

export default function AvailabilitiesPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUserProfile);
  const businessHours = useSelector(selectBusinessHours);
  const loading = useSelector(selectAvailabilityLoading);
  const error = useSelector(selectAvailabilityError);

  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [saved, setSaved] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [sourceDayIndex, setSourceDayIndex] = useState<number | null>(null);
  const [targetDays, setTargetDays] = useState<Record<string, boolean>>({});
  const [hasBreak, setHasBreak] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user?.company_id) {
      dispatch(fetchBusinessHours(user.company_id));
    }
  }, [dispatch, user?.company_id]);

  useEffect(() => {
    if (businessHours.length > 0) {
      setHours(businessHours);
      // Initialize hasBreak state based on existing hours
      const breakState: Record<string, boolean> = {};
      businessHours.forEach((hour) => {
        breakState[hour.day_of_week] = !!(
          hour.break_start_time && hour.break_end_time
        );
      });
      setHasBreak(breakState);
    } else {
      // Initialize with default hours if none exist
      const defaultHours = DAYS_OF_WEEK.map((day) => ({
        day_of_week: day,
        open: day !== "sunday", // Open all days except Sunday by default
        start_time: "09:00",
        end_time: "18:00",
        break_start_time: "12:00",
        break_end_time: "13:00",
      }));
      setHours(defaultHours);

      // Initialize hasBreak state for default hours
      const breakState: Record<string, boolean> = {};
      defaultHours.forEach((hour) => {
        breakState[hour.day_of_week] = true;
      });
      setHasBreak(breakState);
    }
  }, [businessHours]);

  const handleToggleDay = (day: string) => {
    setHours(
      hours.map((hour) =>
        hour.day_of_week === day ? { ...hour, open: !hour.open } : hour
      )
    );
  };

  const handleTimeChange = (
    day: string,
    field: keyof BusinessHours,
    value: string
  ) => {
    setHours(
      hours.map((hour) =>
        hour.day_of_week === day ? { ...hour, [field]: value } : hour
      )
    );
  };

  const handleToggleBreak = (day: string) => {
    const newHasBreak = { ...hasBreak, [day]: !hasBreak[day] };
    setHasBreak(newHasBreak);

    if (!newHasBreak[day]) {
      // If break is disabled, clear break times
      setHours(
        hours.map((hour) =>
          hour.day_of_week === day
            ? { ...hour, break_start_time: "", break_end_time: "" }
            : hour
        )
      );
    } else {
      // If break is enabled, set default break times
      setHours(
        hours.map((hour) =>
          hour.day_of_week === day
            ? { ...hour, break_start_time: "12:00", break_end_time: "13:00" }
            : hour
        )
      );
    }
  };

  const handleSave = async () => {
    console.log(user);
    if (user?.company_id) {
      await dispatch(
        updateBusinessHours({
          companyId: user.company_id,
          businessHours: hours,
        })
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const openCopyDialog = (dayIndex: number) => {
    setSourceDayIndex(dayIndex);

    // Initialize target days (all unchecked)
    const targets: Record<string, boolean> = {};
    DAYS_OF_WEEK.forEach((day, index) => {
      if (index !== dayIndex) {
        targets[day] = false;
      }
    });
    setTargetDays(targets);

    setCopyDialogOpen(true);
  };

  const handleCopyHours = () => {
    if (sourceDayIndex === null) return;

    const sourceDay = hours[sourceDayIndex];
    const selectedTargetDays = Object.entries(targetDays)
      .filter(([_, selected]) => selected)
      .map(([day]) => day);

    if (selectedTargetDays.length === 0) return;

    const updatedHours = [...hours];
    selectedTargetDays.forEach((targetDay) => {
      const targetIndex = updatedHours.findIndex(
        (h) => h.day_of_week === targetDay
      );
      if (targetIndex !== -1) {
        updatedHours[targetIndex] = {
          ...updatedHours[targetIndex],
          open: sourceDay.open,
          start_time: sourceDay.start_time,
          end_time: sourceDay.end_time,
          break_start_time: sourceDay.break_start_time,
          break_end_time: sourceDay.break_end_time,
        };

        // Update hasBreak state for the target day
        setHasBreak((prev) => ({
          ...prev,
          [targetDay]: !!(
            sourceDay.break_start_time && sourceDay.break_end_time
          ),
        }));
      }
    });

    setHours(updatedHours);
    setCopyDialogOpen(false);
  };

  const applyPreset = (presetKey: keyof typeof PRESETS) => {
    const preset = PRESETS[presetKey];
    setHours(preset.hours);

    // Update hasBreak state based on preset
    const breakState: Record<string, boolean> = {};
    preset.hours.forEach((hour) => {
      breakState[hour.day_of_week] = !!(
        hour.break_start_time && hour.break_end_time
      );
    });
    setHasBreak(breakState);
  };

  // Helper function to format time for display
  const formatTimeRange = (start: string, end: string) => {
    if (!start || !end) return "";
    return `${start} - ${end}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Horaires d'ouverture
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos horaires d'ouverture et vos pauses
          </p>
        </div>

        {/* Presets Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Modèles d'horaires
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.entries(PRESETS).map(([key, preset]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => applyPreset(key as keyof typeof PRESETS)}
              >
                {preset.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {saved && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            Les horaires ont été enregistrés avec succès
          </AlertDescription>
        </Alert>
      )}

      {/* Business Hours Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Horaires d'ouverture
          </CardTitle>
          <CardDescription>
            Définissez vos horaires d'ouverture pour chaque jour de la semaine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hours.map((dayHours, index) => (
              <div
                key={dayHours.day_of_week}
                className={`rounded-lg border p-4 ${
                  dayHours.open ? "bg-white" : "bg-muted"
                }`}
              >
                <div className="flex flex-col space-y-4">
                  {/* Day header with toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={dayHours.open}
                        onCheckedChange={() =>
                          handleToggleDay(dayHours.day_of_week)
                        }
                        aria-label={`Toggle ${
                          DAY_LABELS[
                            dayHours.day_of_week as keyof typeof DAY_LABELS
                          ]
                        }`}
                      />
                      <Label className="text-base font-medium">
                        {
                          DAY_LABELS[
                            dayHours.day_of_week as keyof typeof DAY_LABELS
                          ]
                        }
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      {dayHours.open && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openCopyDialog(index)}
                          className="text-xs"
                        >
                          <Copy className="h-3.5 w-3.5 mr-1" />
                          Copier
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Time inputs */}
                  {dayHours.open && (
                    <div className="pl-10 space-y-4">
                      {/* Opening hours */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium mb-1 block">
                            Heures d'ouverture
                          </Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="time"
                              value={dayHours.start_time}
                              onChange={(e) =>
                                handleTimeChange(
                                  dayHours.day_of_week,
                                  "start_time",
                                  e.target.value
                                )
                              }
                              className="w-32"
                            />
                            <span className="text-muted-foreground">à</span>
                            <Input
                              type="time"
                              value={dayHours.end_time}
                              onChange={(e) =>
                                handleTimeChange(
                                  dayHours.day_of_week,
                                  "end_time",
                                  e.target.value
                                )
                              }
                              className="w-32"
                            />
                          </div>
                        </div>

                        {/* Break toggle and times */}
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <Checkbox
                              id={`break-${dayHours.day_of_week}`}
                              checked={hasBreak[dayHours.day_of_week]}
                              onCheckedChange={() =>
                                handleToggleBreak(dayHours.day_of_week)
                              }
                            />
                            <Label
                              htmlFor={`break-${dayHours.day_of_week}`}
                              className="text-sm font-medium"
                            >
                              Pause déjeuner
                            </Label>
                          </div>

                          {hasBreak[dayHours.day_of_week] && (
                            <div className="flex items-center space-x-2">
                              <Input
                                type="time"
                                value={dayHours.break_start_time}
                                onChange={(e) =>
                                  handleTimeChange(
                                    dayHours.day_of_week,
                                    "break_start_time",
                                    e.target.value
                                  )
                                }
                                className="w-32"
                              />
                              <span className="text-muted-foreground">à</span>
                              <Input
                                type="time"
                                value={dayHours.break_end_time}
                                onChange={(e) =>
                                  handleTimeChange(
                                    dayHours.day_of_week,
                                    "break_end_time",
                                    e.target.value
                                  )
                                }
                                className="w-32"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Visual representation */}
                      <div className="bg-muted p-3 rounded-md">
                        <div className="text-xs text-muted-foreground mb-1">
                          Résumé
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium">
                            {formatTimeRange(
                              dayHours.start_time,
                              dayHours.end_time
                            )}
                          </div>
                          {hasBreak[dayHours.day_of_week] && (
                            <>
                              <div className="text-xs text-muted-foreground">
                                Pause:
                              </div>
                              <div className="text-sm">
                                {formatTimeRange(
                                  dayHours.break_start_time || "",
                                  dayHours.break_end_time || ""
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Closed message */}
                  {!dayHours.open && (
                    <div className="pl-10">
                      <span className="text-muted-foreground">Fermé</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="min-w-[200px]"
        >
          {loading ? (
            "Enregistrement..."
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer les horaires
            </>
          )}
        </Button>
      </div>

      {/* Copy Hours Dialog */}
      <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copier les horaires</DialogTitle>
            <DialogDescription>
              Sélectionnez les jours auxquels vous souhaitez appliquer ces
              horaires
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {sourceDayIndex !== null && (
              <div className="mb-4">
                <div className="text-sm font-medium mb-1">Source:</div>
                <div className="text-sm">
                  {
                    DAY_LABELS[
                      hours[sourceDayIndex]
                        .day_of_week as keyof typeof DAY_LABELS
                    ]
                  }{" "}
                  (
                  {formatTimeRange(
                    hours[sourceDayIndex].start_time,
                    hours[sourceDayIndex].end_time
                  )}
                  )
                  {hours[sourceDayIndex].break_start_time && (
                    <span className="text-muted-foreground text-xs ml-2">
                      Pause:{" "}
                      {formatTimeRange(
                        hours[sourceDayIndex].break_start_time || "",
                        hours[sourceDayIndex].break_end_time || ""
                      )}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-sm font-medium mb-1">Appliquer à:</div>
              {DAYS_OF_WEEK.map((day, index) => {
                if (index === sourceDayIndex) return null;
                return (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`copy-to-${day}`}
                      checked={targetDays[day] || false}
                      onCheckedChange={(checked) => {
                        setTargetDays({
                          ...targetDays,
                          [day]: !!checked,
                        });
                      }}
                    />
                    <Label htmlFor={`copy-to-${day}`}>
                      {DAY_LABELS[day as keyof typeof DAY_LABELS]}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCopyDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCopyHours}>
              <Copy className="h-4 w-4 mr-2" />
              Appliquer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
