"use client";

import { useEffect, useState, useCallback } from "react";
import ServiceCard from "@/components/professional/ServiceCard";
import ServiceForm from "@/components/professional/ServiceForm";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  fetchProfessionals,
  fetchProfessionalById,
  updateProfessional,
  fetchServices,
  createServiceThunk,
  updateServiceThunk,
  deleteServiceThunk,
  selectProfessionals,
  selectCurrentProfessional,
  selectServices,
  selectProfessionalsLoading,
  selectProfessionalsError,
} from "@/lib/redux/slices/professionalsSlice";
import {
  selectIsAuthenticated,
  selectUser,
} from "@/lib/redux/slices/authSlice";
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

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const professionals = useSelector(selectProfessionals);
  const currentProfessional = useSelector(selectCurrentProfessional);
  const services = useSelector(selectServices);
  const upcomingAppointments = useSelector(selectUpcomingAppointments);
  const professionalsLoading = useSelector(selectProfessionalsLoading);
  const appointmentsLoading = useSelector(selectAppointmentsLoading);
  const professionalsError = useSelector(selectProfessionalsError);
  const appointmentsError = useSelector(selectAppointmentsError);
  const loading = professionalsLoading || appointmentsLoading;
  const error = professionalsError || appointmentsError;

  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceFormData, setServiceFormData] = useState({
    name: "",
    description: "",
    duration: 60,
    price: 0,
    pro_id: "",
    category: "general",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.id) {
      dispatch(fetchProfessionalById(user.id));
      dispatch(fetchServices(user.id));
      dispatch(fetchAppointments());
    }
  }, [dispatch, isAuthenticated, router, user?.id]);

  // Memoized callback functions to prevent unnecessary re-renders
  const handleServiceSubmit = useCallback(
    (formData: Omit<Service, "id">) => {
      if (editingService) {
        dispatch(
          updateServiceThunk({
            id: editingService.id,
            service: {
              ...formData,
              pro_id: user?.id || "",
            },
          })
        );
      } else {
        dispatch(
          createServiceThunk({
            ...formData,
            pro_id: user?.id || "",
          })
        );
      }

      setShowServiceForm(false);
      setEditingService(null);
    },
    [dispatch, editingService, user?.id]
  );

  const handleEditService = useCallback((service: Service) => {
    setEditingService(service);
    setShowServiceForm(true);
  }, []);

  const handleDeleteService = useCallback(
    (serviceId: string) => {
      if (window.confirm("Are you sure you want to delete this service?")) {
        dispatch(deleteServiceThunk(serviceId));
      }
    },
    [dispatch]
  );

  const handleCancelForm = useCallback(() => {
    setShowServiceForm(false);
    setEditingService(null);
  }, []);

  const handleAddService = useCallback(() => {
    setEditingService(null);
    setShowServiceForm(true);
  }, []);

  // if (loading) {
  //   return (
  //     <div className="container mx-auto p-6">
  //       <div className="flex justify-center items-center h-64">
  //         <p>Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow p-6 md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          {currentProfessional ? (
            <div>
              <div className="mb-4">
                {currentProfessional.imageUrl ? (
                  <img
                    src={currentProfessional.imageUrl}
                    alt={currentProfessional.businessName || "Professional"}
                    className="w-32 h-32 object-cover rounded-full mx-auto"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-gray-500 text-4xl">
                      {currentProfessional.firstName?.charAt(0) || "P"}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-center text-xl font-semibold mb-2">
                {currentProfessional.businessName ||
                  `${currentProfessional.firstName} ${currentProfessional.lastName}`}
              </p>
              <p className="text-center text-gray-600 mb-4">
                {currentProfessional.profession || "Professional"}
              </p>
              <div className="border-t pt-4">
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {currentProfessional.email}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {currentProfessional.phone || "Not provided"}
                </p>
                <p>
                  <span className="font-medium">Address:</span>{" "}
                  {currentProfessional.address || "Not provided"}
                </p>
              </div>
              <button className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Edit Profile
              </button>
            </div>
          ) : (
            <p>No profile information available</p>
          )}
        </div>

        {/* Services Section */}
        <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Services</h2>
            <button
              onClick={handleAddService}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Add Service
            </button>
          </div>

          {showServiceForm && (
            <div className="mb-6">
              <ServiceForm
                initialData={editingService}
                onSubmit={handleServiceSubmit}
                onCancel={handleCancelForm}
                isEditing={!!editingService}
              />
            </div>
          )}

          {services && services.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {services.map((service: Service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onEdit={handleEditService}
                  onDelete={handleDeleteService}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-8 text-center rounded-lg">
              <p className="text-gray-600 mb-4">
                You haven't added any services yet.
              </p>
              <button
                onClick={handleAddService}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Add Your First Service
              </button>
            </div>
          )}
        </div>

        {/* Appointments Section */}
        <div className="bg-white rounded-lg shadow p-6 md:col-span-3">
          <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingAppointments && upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment: Appointment) => (
                    <tr key={appointment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(
                            appointment.start_time
                          ).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(appointment.start_time).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointment.client_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.client_email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {services.find(
                            (s: Service) => s.id === appointment.service_id
                          )?.name || "Service"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {Math.round(
                            (new Date(appointment.end_time).getTime() -
                              new Date(appointment.start_time).getTime()) /
                              60000
                          )}{" "}
                          minutes
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            appointment.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {appointment.status.charAt(0).toUpperCase() +
                            appointment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-blue-500 hover:text-blue-700 mr-3">
                          Reschedule
                        </button>
                        <button className="text-red-500 hover:text-red-700">
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No upcoming appointments
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Availability Section */}
        <div className="bg-white rounded-lg shadow p-6 md:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Availability</h2>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Edit Availability
            </button>
          </div>
          <div className="grid grid-cols-7 gap-4">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="border rounded-lg p-3 text-center">
                <div className="font-medium mb-2">{day}</div>
                <div className="text-sm">
                  {day === "Sat" || day === "Sun"
                    ? "Closed"
                    : "9:00 AM - 5:00 PM"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
