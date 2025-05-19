"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("dashboard.pro.bookings");
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
    status: "all" as "all" | BookingStatus,
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
  }, [user, company, dispatch]);

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
        booking.service_id !== filters.serviceId
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
      setActionLoading(true);
      await dispatch(updateBookingThunk({ booking, status }));

      toast({
        title: t("toast.success.title"),
        description: t(`toast.success.${status.toLowerCase()}`),
      });
    } catch (error) {
      toast({
        title: t("toast.error.title"),
        description: t("toast.error.message"),
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmAction = () => {
    if (selectedBooking && confirmAction) {
      updateBookingStatus(selectedBooking, confirmAction);
      setConfirmDialogOpen(false);
    }
  };

  const openConfirmDialog = (booking: Booking, action: BookingStatus) => {
    setSelectedBooking(booking);
    setConfirmAction(action);
    setConfirmDialogOpen(true);
  };

  const formatAppointmentDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "PPP", { locale: fr });
  };

  const getStatusBadge = (status: BookingStatus | string | undefined) => {
    if (!status) return null;

    const statusConfig = {
      [BookingStatus.PENDING]: {
        label: t("status.pending"),
        className: "bg-yellow-100 text-yellow-800",
      },
      [BookingStatus.CONFIRMED]: {
        label: t("status.confirmed"),
        className: "bg-blue-100 text-blue-800",
      },
      [BookingStatus.COMPLETED]: {
        label: t("status.completed"),
        className: "bg-green-100 text-green-800",
      },
      [BookingStatus.CANCELLED]: {
        label: t("status.cancelled"),
        className: "bg-red-100 text-red-800",
      },
    };

    const config = statusConfig[status as BookingStatus];
    if (!config) return null;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="upcoming">{t("tabs.upcoming")}</TabsTrigger>
              <TabsTrigger value="today">{t("tabs.today")}</TabsTrigger>
              <TabsTrigger value="tomorrow">{t("tabs.tomorrow")}</TabsTrigger>
              <TabsTrigger value="thisWeek">{t("tabs.thisWeek")}</TabsTrigger>
              <TabsTrigger value="completed">{t("tabs.completed")}</TabsTrigger>
              <TabsTrigger value="cancelled">{t("tabs.cancelled")}</TabsTrigger>
            </TabsList>

            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterDialogOpen(true)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {t("filters.title")}
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-40">
                <LoadingSpinner />
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {t("noBookings")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("table.client")}</TableHead>
                    <TableHead>{t("table.service")}</TableHead>
                    <TableHead>{t("table.date")}</TableHead>
                    <TableHead>{t("table.time")}</TableHead>
                    <TableHead>{t("table.status")}</TableHead>
                    <TableHead>{t("table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.client_name}</TableCell>
                      <TableCell>{booking.service?.name}</TableCell>
                      <TableCell>
                        {formatAppointmentDate(booking.start_time)}
                      </TableCell>
                      <TableCell>
                        {format(parseISO(booking.start_time), "HH:mm")}
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedBooking(booking);
                                setDetailsDialogOpen(true);
                              }}
                            >
                              {t("details.title")}
                            </DropdownMenuItem>
                            {booking.status === BookingStatus.PENDING && (
                              <DropdownMenuItem
                                onClick={() =>
                                  openConfirmDialog(
                                    booking,
                                    BookingStatus.CONFIRMED
                                  )
                                }
                              >
                                {t("status.confirmed")}
                              </DropdownMenuItem>
                            )}
                            {booking.status === BookingStatus.CONFIRMED && (
                              <DropdownMenuItem
                                onClick={() =>
                                  openConfirmDialog(
                                    booking,
                                    BookingStatus.COMPLETED
                                  )
                                }
                              >
                                {t("status.completed")}
                              </DropdownMenuItem>
                            )}
                            {booking.status !== BookingStatus.CANCELLED && (
                              <DropdownMenuItem
                                onClick={() =>
                                  openConfirmDialog(
                                    booking,
                                    BookingStatus.CANCELLED
                                  )
                                }
                              >
                                {t("status.cancelled")}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("filters.title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="clientName">{t("filters.clientName")}</Label>
              <Input
                id="clientName"
                value={filters.clientName}
                onChange={(e) =>
                  setFilters({ ...filters, clientName: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="date">{t("filters.date")}</Label>
              <DatePicker
                date={filters.dateRange}
                onSelect={(date) => setFilters({ ...filters, dateRange: date })}
              />
            </div>
            <div>
              <Label htmlFor="status">{t("filters.status")}</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    status: value as "all" | BookingStatus,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("filters.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.all")}</SelectItem>
                  <SelectItem value={BookingStatus.PENDING}>
                    {t("status.pending")}
                  </SelectItem>
                  <SelectItem value={BookingStatus.CONFIRMED}>
                    {t("status.confirmed")}
                  </SelectItem>
                  <SelectItem value={BookingStatus.COMPLETED}>
                    {t("status.completed")}
                  </SelectItem>
                  <SelectItem value={BookingStatus.CANCELLED}>
                    {t("status.cancelled")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetFilters}>
              {t("filters.reset")}
            </Button>
            <Button onClick={applyFilterChanges}>{t("filters.apply")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("details.title")}</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">{t("details.clientInfo")}</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    {selectedBooking.client_name}
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {selectedBooking.client_phone}
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {selectedBooking.client_email}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium">{t("details.serviceInfo")}</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {formatAppointmentDate(selectedBooking.start_time)}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {format(parseISO(selectedBooking.start_time), "HH:mm")}
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {selectedBooking.notes || t("details.noNotes")}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailsDialogOpen(false)}>
              {t("details.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Action Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmDialog.title")}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {confirmAction === BookingStatus.CONFIRMED
              ? t("confirmDialog.confirmBooking")
              : confirmAction === BookingStatus.COMPLETED
              ? t("confirmDialog.completeBooking")
              : t("confirmDialog.cancelBooking")}
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={actionLoading}
            >
              {t("confirmDialog.cancel")}
            </Button>
            <Button onClick={handleConfirmAction} disabled={actionLoading}>
              {t("confirmDialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
