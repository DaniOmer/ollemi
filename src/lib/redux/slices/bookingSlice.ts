"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Booking } from "@/types";
import { RootState } from "../store";
import {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  getBookingById,
} from "@/lib/services/booking";

interface BookingState {
  bookings: Booking[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  status: "idle",
  error: null,
};

export const fetchBookingsThunk = createAsyncThunk(
  "bookings/fetchBookings",
  async (companyId: string, { rejectWithValue }) => {
    try {
      const response = await getBookings(companyId);
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch bookings:", error);
      return rejectWithValue(error.message || "Failed to fetch bookings");
    }
  }
);

export const createBookingThunk = createAsyncThunk(
  "bookings/createBooking",
  async (booking: Booking, { rejectWithValue }) => {
    try {
      const response = await createBooking(booking);
      return response.data;
    } catch (error: any) {
      console.error("Failed to create booking:", error);
      return rejectWithValue(error.message || "Failed to create booking");
    }
  }
);

export const updateBookingThunk = createAsyncThunk(
  "bookings/updateBooking",
  async (booking: Booking, { rejectWithValue }) => {
    try {
      const response = await updateBooking(booking.id, booking);
      return response.data;
    } catch (error: any) {
      console.error("Failed to update booking:", error);
      return rejectWithValue(error.message || "Failed to update booking");
    }
  }
);

export const deleteBookingThunk = createAsyncThunk(
  "bookings/deleteBooking",
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const response = await deleteBooking(bookingId);
      return response.data;
    } catch (error: any) {
      console.error("Failed to delete booking:", error);
      return rejectWithValue(error.message || "Failed to delete booking");
    }
  }
);

export const getBookingByIdThunk = createAsyncThunk(
  "bookings/getBookingById",
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const response = await getBookingById(bookingId);
      return response.data;
    } catch (error: any) {
      console.error("Failed to get booking by ID:", error);
      return rejectWithValue(error.message || "Failed to get booking by ID");
    }
  }
);

const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookingsThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBookingsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.bookings = action.payload || [];
      })
      .addCase(fetchBookingsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch bookings";
      })
      .addCase(createBookingThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createBookingThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload) {
          state.bookings.push(action.payload);
        }
      })
      .addCase(createBookingThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to create booking";
      })
      .addCase(updateBookingThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateBookingThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload) {
          const index = state.bookings.findIndex(
            (booking) => booking.id === action.payload?.id
          );
          if (index !== -1) {
            state.bookings[index] = action.payload;
          }
        }
      })
      .addCase(updateBookingThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to update booking";
      })
      .addCase(deleteBookingThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteBookingThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        const bookingId = action.meta.arg;
        state.bookings = state.bookings.filter(
          (booking) => booking.id !== bookingId
        );
      })
      .addCase(deleteBookingThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to delete booking";
      });
  },
});

export const selectBookings = (state: RootState) =>
  state.bookings?.bookings || [];
export const selectBookingById = (state: RootState, bookingId: string) =>
  state.bookings?.bookings.find((booking: Booking) => booking.id === bookingId);
export const selectBookingStatus = (state: RootState) => state.bookings?.status;
export const selectBookingError = (state: RootState) => state.bookings?.error;
export const selectUpcomingBookings = (state: RootState) =>
  state.bookings?.bookings.filter((booking: Booking) => {
    const now = new Date();
    const bookingDate = new Date(booking.start_time);
    return bookingDate > now;
  });

export default bookingSlice.reducer;
