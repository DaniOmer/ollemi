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
import {
  selectIsAuthenticated,
  selectUser,
} from "@/lib/redux/slices/authSlice";
import { fetchUserProfile } from "@/lib/redux/slices/userSlice";
import {
  fetchAppointments,
  selectUpcomingAppointments,
  selectAppointmentsLoading,
  selectAppointmentsError,
} from "@/lib/redux/slices/appointmentsSlice";
import { AppDispatch } from "@/lib/redux/store";
import { Service, Appointment } from "@/types";

export default function ProfessionalDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Redux state
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const currentCompany = useSelector(selectCurrentCompany);
  const services = useSelector(selectServices);
  const upcomingAppointments = useSelector(selectUpcomingAppointments);
  const companiesLoading = useSelector(selectCompaniesLoading);
  const appointmentsLoading = useSelector(selectAppointmentsLoading);
  const companiesError = useSelector(selectCompaniesError);
  const appointmentsError = useSelector(selectAppointmentsError);

  // Loading and error states
  const loading = companiesLoading || appointmentsLoading;
  const error = companiesError || appointmentsError;

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchUserProfile());
    if (user?.id) {
      dispatch(fetchCompanyById(user.id));
      dispatch(fetchServices(user.id));
      dispatch(fetchAppointments());
    }
  }, [dispatch, isAuthenticated, router, user?.id]);

  // Stats
  const todayAppointments = upcomingAppointments.filter(
    (a: Appointment) =>
      new Date(a.start_time).toDateString() === new Date().toDateString()
  ).length;

  const totalServices = services.length;
  const totalCustomers = new Set(
    upcomingAppointments.map((a: Appointment) => a.client_email)
  ).size;

  const stats = [
    {
      title: "Rendez-vous aujourd'hui",
      value: todayAppointments,
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
          Bonjour, {currentCompany?.name || "Pro"}
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
            {upcomingAppointments
              .filter(
                (a: Appointment) =>
                  new Date(a.start_time).toDateString() ===
                  new Date().toDateString()
              )
              .map((appointment: Appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div>
                    <div className="font-medium">{appointment.client_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(appointment.start_time), "HH:mm")} -
                      {
                        services.find(
                          (s: Service) => s.id === appointment.service_id
                        )?.name
                      }
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/dashboard/pro/bookings/${appointment.id}`)
                    }
                  >
                    Voir détails
                  </Button>
                </div>
              ))}
            {upcomingAppointments.filter(
              (a: Appointment) =>
                new Date(a.start_time).toDateString() ===
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
