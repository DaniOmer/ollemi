import { Booking, BookingStatus } from "@/types";
import { ApiResponse, fetchPrivateApi } from "./api";

export async function getBookings(
  companyId: string
): Promise<ApiResponse<Booking[]>> {
  return fetchPrivateApi<Booking[]>(`/companies/${companyId}/bookings`);
}

export async function createBooking(
  data: Booking
): Promise<ApiResponse<Booking>> {
  return fetchPrivateApi<Booking>(`/companies/${data?.company_id}/bookings`, {
    method: "POST",
    data: data,
  });
}

export async function updateBookingStatus(
  bookingId: string,
  booking: Booking,
  status: string
): Promise<ApiResponse<Booking>> {
  return fetchPrivateApi<Booking>(
    `/companies/${booking?.company?.id}/bookings/${bookingId}`,
    {
      method: "PATCH",
      data: { ...booking, status: status },
    }
  );
}

export async function deleteBooking(
  bookingId: string,
  companyId: string
): Promise<ApiResponse<void>> {
  return fetchPrivateApi<void>(
    `/companies/${companyId}/bookings/${bookingId}`,
    {
      method: "DELETE",
    }
  );
}

export async function getBookingById(
  bookingId: string,
  companyId: string
): Promise<ApiResponse<Booking>> {
  return fetchPrivateApi<Booking>(
    `/companies/${companyId}/bookings/${bookingId}`
  );
}

export async function getBookingByUserId(): Promise<ApiResponse<Booking[]>> {
  return fetchPrivateApi<Booking[]>(`/users/bookings`);
}
