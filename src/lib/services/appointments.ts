import { fetchApi, fetchPrivateApi, ApiResponse } from "./api";
import { Appointment } from "@/types";

export async function getAppointments(): Promise<ApiResponse<Appointment[]>> {
  return fetchPrivateApi<Appointment[]>("/appointments");
}

export async function getAppointment(
  id: string
): Promise<ApiResponse<Appointment>> {
  return fetchPrivateApi<Appointment>(`/appointments/${id}`);
}

export async function createAppointment(
  appointmentData: Omit<Appointment, "id" | "created_at">
): Promise<ApiResponse<Appointment>> {
  return fetchPrivateApi<Appointment>("/appointments", {
    method: "POST",
    data: appointmentData,
  });
}

export async function updateAppointment(
  id: string,
  appointmentData: Partial<Appointment>
): Promise<ApiResponse<Appointment>> {
  return fetchPrivateApi<Appointment>(`/appointments/${id}`, {
    method: "PUT",
    data: appointmentData,
  });
}

export async function deleteAppointment(
  id: string
): Promise<ApiResponse<null>> {
  return fetchPrivateApi<null>(`/appointments/${id}`, {
    method: "DELETE",
  });
}

export async function checkAvailability(
  proId: string,
  startTime: string,
  endTime: string
): Promise<ApiResponse<{ available: boolean }>> {
  return fetchApi<{ available: boolean }>("/appointments/availability", {
    method: "POST",
    data: { proId, startTime, endTime },
  });
}
