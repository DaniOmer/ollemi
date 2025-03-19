"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import DashboardHeader from "@/components/layouts/DashboardHeader";
import { AppointmentCalendar } from "@/components/calendar/AppointmentCalendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutGrid,
  Calendar,
  Users,
  Settings,
  UserCircle,
  Plus,
} from "lucide-react";
import { Appointment, User } from "@/types";
import { getCurrentUser } from "@/lib/services";

export default function DashboardPage() {
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState("overview");

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await getCurrentUser();
      setUser(response.data?.user || null);
    };
    fetchUser();
  }, []);

  // Mock data for demonstration
  const upcomingAppointments = [
    {
      id: "1",
      client_name: "Sophie Martin",
      service_id: "1",
      start_time: "2023-04-15T10:00:00",
      end_time: "2023-04-15T11:00:00",
      status: "confirmed",
      client_email: "sophie@example.com",
      client_phone: "+33612345678",
      pro_id: "1",
      notes: "",
      created_at: "2023-04-10T10:00:00",
    },
    {
      id: "2",
      client_name: "Emma Wilson",
      service_id: "2",
      start_time: "2023-04-15T13:30:00",
      end_time: "2023-04-15T14:30:00",
      status: "confirmed",
      client_email: "emma@example.com",
      client_phone: "+33612345679",
      pro_id: "1",
      notes: "",
      created_at: "2023-04-11T10:00:00",
    },
    {
      id: "3",
      client_name: "Olivia Brown",
      service_id: "3",
      start_time: "2023-04-16T11:00:00",
      end_time: "2023-04-16T12:00:00",
      status: "pending",
      client_email: "olivia@example.com",
      client_phone: "+33612345680",
      pro_id: "1",
      notes: "",
      created_at: "2023-04-12T10:00:00",
    },
  ] as Appointment[];

  const recentClients = [
    {
      id: 101,
      name: "Emma Wilson",
      email: "emma@example.com",
      lastVisit: "2023-04-10",
      visits: 5,
    },
    {
      id: 102,
      name: "Sophie Martin",
      email: "sophie@example.com",
      lastVisit: "2023-04-08",
      visits: 8,
    },
    {
      id: 103,
      name: "Olivia Brown",
      email: "olivia@example.com",
      lastVisit: "2023-04-05",
      visits: 3,
    },
  ];

  // Handle appointment click
  const handleAppointmentClick = (appointment: Appointment) => {
    console.log("Appointment clicked:", appointment);
    // Here you would open a modal or navigate to appointment details
  };

  // Handle date selection for new appointment
  const handleDateSelect = (start: Date, end: Date) => {
    console.log("Date selected:", start, end);
    // Here you would open a modal to create a new appointment
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 animate-slide-in-left">
          <Card className="border-gradient shadow-soft">
            <CardContent className="p-4">
              <nav className="space-y-2">
                <Button
                  variant={activeTab === "overview" ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    activeTab === "overview"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-primary/5 hover:text-primary"
                  }`}
                  onClick={() => setActiveTab("overview")}
                >
                  <LayoutGrid className="w-5 h-5 mr-3" />
                  {t("dashboard.overview")}
                </Button>
                <Button
                  variant={activeTab === "appointments" ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    activeTab === "appointments"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-primary/5 hover:text-primary"
                  }`}
                  onClick={() => setActiveTab("appointments")}
                >
                  <Calendar className="w-5 h-5 mr-3" />
                  {t("dashboard.appointments")}
                </Button>
                <Button
                  variant={activeTab === "clients" ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    activeTab === "clients"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-primary/5 hover:text-primary"
                  }`}
                  onClick={() => setActiveTab("clients")}
                >
                  <Users className="w-5 h-5 mr-3" />
                  {t("dashboard.clients")}
                </Button>
                <Button
                  variant={activeTab === "services" ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    activeTab === "services"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-primary/5 hover:text-primary"
                  }`}
                  onClick={() => setActiveTab("services")}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  {t("dashboard.services")}
                </Button>
                <Button
                  variant={activeTab === "profile" ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    activeTab === "profile"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-primary/5 hover:text-primary"
                  }`}
                  onClick={() => setActiveTab("profile")}
                >
                  <UserCircle className="w-5 h-5 mr-3" />
                  {t("dashboard.profile")}
                </Button>
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* Main content */}
        <main className="flex-1 animate-fade-in">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <Card className="border-gradient shadow-soft">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 gradient-text">
                    {t("dashboard.welcomeMessage")}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {t("dashboard.welcomeDescription")}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-primary/10 p-5 rounded-xl shadow-soft hover-lift transition-all">
                      <div className="text-primary text-sm font-medium">
                        {t("dashboard.todayAppointments")}
                      </div>
                      <div className="text-2xl font-bold mt-1">2</div>
                    </div>
                    <div className="bg-accent/10 p-5 rounded-xl shadow-soft hover-lift transition-all">
                      <div className="text-accent-foreground text-sm font-medium">
                        {t("dashboard.upcomingAppointments")}
                      </div>
                      <div className="text-2xl font-bold mt-1">8</div>
                    </div>
                    <div className="bg-secondary p-5 rounded-xl shadow-soft hover-lift transition-all">
                      <div className="text-secondary-foreground text-sm font-medium">
                        {t("dashboard.totalClients")}
                      </div>
                      <div className="text-2xl font-bold mt-1">24</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gradient shadow-soft">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">
                      {t("dashboard.upcomingAppointments")}
                    </CardTitle>
                    <Link
                      href="#"
                      className="text-primary text-sm hover:text-primary/80 transition-colors"
                    >
                      {t("dashboard.viewAll")}
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs text-muted-foreground border-b">
                          <th className="pb-3 font-medium">
                            {t("dashboard.client")}
                          </th>
                          <th className="pb-3 font-medium">
                            {t("dashboard.service")}
                          </th>
                          <th className="pb-3 font-medium">
                            {t("dashboard.date")}
                          </th>
                          <th className="pb-3 font-medium">
                            {t("dashboard.time")}
                          </th>
                          <th className="pb-3 font-medium">
                            {t("dashboard.status")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {upcomingAppointments.map((appointment) => (
                          <tr
                            key={appointment.id}
                            className="border-b last:border-0 hover:bg-secondary/10 transition-colors"
                          >
                            <td className="py-3">{appointment.client_name}</td>
                            <td className="py-3">Service Name</td>
                            <td className="py-3">
                              {new Date(
                                appointment.start_time
                              ).toLocaleDateString()}
                            </td>
                            <td className="py-3">
                              {new Date(
                                appointment.start_time
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="py-3">
                              <span
                                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                  appointment.status === "confirmed"
                                    ? "bg-primary/20 text-primary"
                                    : "bg-accent/20 text-accent-foreground"
                                }`}
                              >
                                {appointment.status === "confirmed"
                                  ? t("dashboard.confirmed")
                                  : t("dashboard.pending")}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gradient shadow-soft">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">
                      {t("dashboard.recentClients")}
                    </CardTitle>
                    <Link
                      href="#"
                      className="text-primary text-sm hover:text-primary/80 transition-colors"
                    >
                      {t("dashboard.viewAll")}
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs text-muted-foreground border-b">
                          <th className="pb-3 font-medium">
                            {t("dashboard.name")}
                          </th>
                          <th className="pb-3 font-medium">
                            {t("dashboard.email")}
                          </th>
                          <th className="pb-3 font-medium">
                            {t("dashboard.lastVisit")}
                          </th>
                          <th className="pb-3 font-medium">
                            {t("dashboard.totalVisits")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentClients.map((client) => (
                          <tr
                            key={client.id}
                            className="border-b last:border-0 hover:bg-secondary/10 transition-colors"
                          >
                            <td className="py-3">{client.name}</td>
                            <td className="py-3">{client.email}</td>
                            <td className="py-3">{client.lastVisit}</td>
                            <td className="py-3">{client.visits}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "appointments" && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button className="bg-primary hover:bg-primary/90 text-white hover-lift">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("dashboard.newAppointment")}
                </Button>
              </div>

              <Card className="border-gradient shadow-soft">
                <CardContent className="p-4">
                  <AppointmentCalendar
                    appointments={upcomingAppointments}
                    onAppointmentClick={handleAppointmentClick}
                    onDateSelect={handleDateSelect}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "clients" && (
            <Card className="border-gradient shadow-soft">
              <CardHeader>
                <CardTitle className="text-xl font-semibold gradient-text">
                  {t("dashboard.clients")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t("dashboard.clientsDescription")}
                </p>
              </CardContent>
            </Card>
          )}

          {activeTab === "services" && (
            <Card className="border-gradient shadow-soft">
              <CardHeader>
                <CardTitle className="text-xl font-semibold gradient-text">
                  {t("dashboard.services")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t("dashboard.servicesDescription")}
                </p>
              </CardContent>
            </Card>
          )}

          {activeTab === "profile" && (
            <Card className="border-gradient shadow-soft">
              <CardHeader>
                <CardTitle className="text-xl font-semibold gradient-text">
                  {t("dashboard.profile")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t("dashboard.profileDescription")}
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
