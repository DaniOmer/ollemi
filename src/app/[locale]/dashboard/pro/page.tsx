"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Plus,
  Users,
  BarChart2,
  CreditCard,
  Scissors,
} from "lucide-react";

// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Redux
import {
  fetchCompanyById,
  fetchServices,
  selectCurrentCompany,
  selectServices,
  selectCompaniesLoading,
  selectCompaniesError,
} from "@/lib/redux/slices/companiesSlice";
import { selectIsAuthenticated } from "@/lib/redux/slices/authSlice";

import {
  fetchUserProfile,
  selectUserProfile,
  selectUserError,
  selectUserLoading,
} from "@/lib/redux/slices/userSlice";
import {
  fetchBookingsThunk,
  selectUpcomingBookings,
  selectBookingError,
  selectBookingStatus,
} from "@/lib/redux/slices/bookingSlice";
import { AppDispatch } from "@/lib/redux/store";
import { Service, Booking } from "@/types";

export default function ProfessionalDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Redux state
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUserProfile);
  const currentCompany = useSelector(selectCurrentCompany);
  const services = useSelector(selectServices);
  const upcomingBookings = useSelector(selectUpcomingBookings);
  const companiesLoading = useSelector(selectCompaniesLoading);
  const companiesError = useSelector(selectCompaniesError);
  const bookingStatus = useSelector(selectBookingStatus);
  const bookingsError = useSelector(selectBookingError);
  const userLoading = useSelector(selectUserLoading);
  const userError = useSelector(selectUserError);

  const bookingsLoading = bookingStatus === "loading";

  // Loading and error states
  const loading = userLoading || companiesLoading || bookingsLoading;
  const error = userError || companiesError || bookingsError;

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchUserProfile());
    if (user?.company_id) {
      dispatch(fetchCompanyById(user.company_id));
      dispatch(fetchServices(user.company_id));
      dispatch(fetchBookingsThunk(user.company_id));
    }
  }, [dispatch, isAuthenticated, router, user?.company_id]);

  // Stats
  const todayBookings = upcomingBookings.filter(
    (booking: Booking) =>
      new Date(booking.start_time).toDateString() === new Date().toDateString()
  ).length;

  const totalServices = services.length;
  const totalCustomers = new Set(
    upcomingBookings.map((booking: Booking) => booking.client_id)
  ).size;

  const stats = [
    {
      title: "Rendez-vous aujourd'hui",
      value: todayBookings,
      icon: Calendar,
      color: "text-blue-500",
    },
    {
      title: "Services actifs",
      value: totalServices,
      icon: Scissors,
      color: "text-purple-500",
    },
    {
      title: "Clients uniques",
      value: totalCustomers,
      icon: Users,
      color: "text-green-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Bonjour, {currentCompany?.name}
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div
                    className={`p-3 rounded-full bg-primary/10 ${stat.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          className="w-full"
          onClick={() => router.push("/dashboard/pro/bookings")}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Voir les rendez-vous
        </Button>
        <Button
          className="w-full"
          variant="outline"
          onClick={() => router.push("/dashboard/pro/services")}
        >
          <Scissors className="w-4 h-4 mr-2" />
          Gérer les services
        </Button>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Programme du jour
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingBookings
              .filter(
                (booking: Booking) =>
                  new Date(booking.start_time).toDateString() ===
                  new Date().toDateString()
              )
              .map((booking: Booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div>
                    <div className="font-medium">{booking.client_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(booking.start_time), "HH:mm")} -
                      {
                        services.find(
                          (s: Service) => s.id === booking?.service?.id
                        )?.name
                      }
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/dashboard/pro/bookings/${booking.id}`)
                    }
                  >
                    Voir détails
                  </Button>
                </div>
              ))}
            {upcomingBookings.filter(
              (booking: Booking) =>
                new Date(booking.start_time).toDateString() ===
                new Date().toDateString()
            ).length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                Aucun rendez-vous aujourd'hui
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
