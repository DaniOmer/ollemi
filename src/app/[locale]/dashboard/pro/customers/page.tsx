"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Search, Mail, Phone, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  fetchAppointments,
  selectAppointments,
  selectAppointmentsLoading,
  selectAppointmentsError,
} from "@/lib/redux/slices/appointmentsSlice";
import { AppDispatch } from "@/lib/redux/store";
import { selectServices } from "@/lib/redux/slices/companiesSlice";
import { Appointment, Service } from "@/types";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  appointments: AppointmentData[];
  lastAppointment: Date | null;
  totalAppointments: number;
}

interface AppointmentData {
  id: string;
  date: string;
  status: string;
  service: {
    name: string;
  };
  client_email: string;
  client_name: string;
  client_phone: string;
  start_time: string;
  service_id: string;
}

export default function CustomersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const appointments = useSelector(selectAppointments);
  const services = useSelector(selectServices);
  const loading = useSelector(selectAppointmentsLoading);
  const error = useSelector(selectAppointmentsError);

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  // Fetch appointments on component mount
  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  // Process customers data
  const customers = appointments.reduce(
    (acc: Customer[], appointment: AppointmentData) => {
      const existingCustomer = acc.find(
        (c) => c.email === appointment.client_email
      );
      if (existingCustomer) {
        existingCustomer.appointments.push(appointment);
        existingCustomer.totalAppointments++;
        if (
          !existingCustomer.lastAppointment ||
          new Date(appointment.start_time) > existingCustomer.lastAppointment
        ) {
          existingCustomer.lastAppointment = new Date(appointment.start_time);
        }
      } else {
        acc.push({
          id: appointment.client_email,
          name: appointment.client_name,
          email: appointment.client_email,
          phone: appointment.client_phone,
          appointments: [appointment],
          lastAppointment: new Date(appointment.start_time),
          totalAppointments: 1,
        });
      }
      return acc;
    },
    []
  );

  // Filter customers by search query
  const filteredCustomers = customers.filter(
    (customer: Customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Clients</h1>
        <p className="text-muted-foreground">
          Gérez vos clients et leur historique
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher un client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Customers Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Dernier RDV</TableHead>
                <TableHead>Total RDV</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer: Customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {customer.lastAppointment
                        ? format(customer.lastAppointment, "PPP", {
                            locale: fr,
                          })
                        : "Jamais"}
                    </div>
                  </TableCell>
                  <TableCell>{customer.totalAppointments}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCustomer(customer)}
                        >
                          Voir détails
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Détails du client</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div>
                            <h3 className="font-medium mb-2">Informations</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Nom
                                </p>
                                <p className="font-medium">{customer.name}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Email
                                </p>
                                <p className="font-medium">{customer.email}</p>
                              </div>
                              {customer.phone && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Téléphone
                                  </p>
                                  <p className="font-medium">
                                    {customer.phone}
                                  </p>
                                </div>
                              )}
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Total RDV
                                </p>
                                <p className="font-medium">
                                  {customer.totalAppointments}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium mb-2">
                              Historique des rendez-vous
                            </h3>
                            <div className="space-y-4">
                              {customer.appointments
                                .sort(
                                  (a, b) =>
                                    new Date(b.start_time).getTime() -
                                    new Date(a.start_time).getTime()
                                )
                                .map((appointment: AppointmentData) => (
                                  <div
                                    key={appointment.id}
                                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                                  >
                                    <div>
                                      <div className="font-medium">
                                        {format(
                                          new Date(appointment.start_time),
                                          "PPP",
                                          {
                                            locale: fr,
                                          }
                                        )}{" "}
                                        à{" "}
                                        {format(
                                          new Date(appointment.start_time),
                                          "HH:mm"
                                        )}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {
                                          services.find(
                                            (s: Service) =>
                                              s.id === appointment.service_id
                                          )?.name
                                        }
                                      </div>
                                    </div>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        appointment.status === "confirmed"
                                          ? "bg-green-100 text-green-800"
                                          : appointment.status === "pending"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : appointment.status === "cancelled"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {appointment.status === "confirmed"
                                        ? "Confirmé"
                                        : appointment.status === "pending"
                                        ? "En attente"
                                        : appointment.status === "cancelled"
                                        ? "Annulé"
                                        : "Terminé"}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCustomers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-4"
                  >
                    Aucun client trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
