import { Booking } from "@/types";
import { ApiResponse, fetchPrivateApi } from "./api";

export async function getBookings(
  companyId: string
): Promise<ApiResponse<Booking[]>> {
  return fetchPrivateApi<Booking[]>(`/companies/${companyId}/bookings`);
}

export async function createBooking(
  booking: Booking
): Promise<ApiResponse<Booking>> {
  return fetchPrivateApi<Booking>(`/companies/${booking.company_id}/bookings`, {
    method: "POST",
    data: booking,
  });
}

export async function updateBooking(
  bookingId: string,
  booking: Booking
): Promise<ApiResponse<Booking>> {
  return fetchPrivateApi<Booking>(`/bookings/${bookingId}`, {
    method: "PUT",
    data: booking,
  });
}

export async function deleteBooking(
  bookingId: string
): Promise<ApiResponse<void>> {
  return fetchPrivateApi<void>(`/bookings/${bookingId}`, {
    method: "DELETE",
  });
}

export async function getBookingById(
  bookingId: string
): Promise<ApiResponse<Booking>> {
  return fetchPrivateApi<Booking>(`/bookings/${bookingId}`);
}
