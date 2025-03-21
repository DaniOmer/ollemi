"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { createSelector } from "@reduxjs/toolkit";
import { Appointment } from "@/types";
import { RootState } from "../store";
import {
  getAppointments,
  getAppointment,
  createAppointment as createAppointmentService,
  updateAppointment as updateAppointmentService,
  deleteAppointment as deleteAppointmentService,
  checkAvailability,
} from "@/lib/services/appointments";

// Define the state type
interface AppointmentsState {
  appointments: Appointment[];
  currentAppointment: Appointment | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: AppointmentsState = {
  appointments: [],
  currentAppointment: null,
  loading: false,
  error: null,
};

// Async thunks for appointment actions
export const fetchAppointments = createAsyncThunk(
  "appointments/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAppointments();
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch appointments");
    }
  }
);

export const fetchAppointmentById = createAsyncThunk(
  "appointments/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await getAppointment(id);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch appointment");
    }
  }
);

export const createAppointment = createAsyncThunk(
  "appointments/create",
  async (
    appointment: Omit<Appointment, "id" | "created_at">,
    { rejectWithValue }
  ) => {
    try {
      const response = await createAppointmentService(appointment);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create appointment");
    }
  }
);

export const updateAppointment = createAsyncThunk(
  "appointments/update",
  async (
    { id, appointment }: { id: string; appointment: Partial<Appointment> },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateAppointmentService(id, appointment);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update appointment");
    }
  }
);

export const deleteAppointment = createAsyncThunk(
  "appointments/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await deleteAppointmentService(id);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete appointment");
    }
  }
);

// Additional thunk for checking availability
export const checkAppointmentAvailability = createAsyncThunk(
  "appointments/checkAvailability",
  async (
    {
      proId,
      startTime,
      endTime,
    }: { proId: string; startTime: string; endTime: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await checkAvailability(proId, startTime, endTime);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to check availability");
    }
  }
);

// Create the appointments slice
const appointmentsSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentAppointment: (
      state,
      action: PayloadAction<Appointment | null>
    ) => {
      state.currentAppointment = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch all appointments
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.appointments = action.payload;
        } else {
          state.appointments = [];
        }
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch appointment by ID
    builder
      .addCase(fetchAppointmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentById.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.currentAppointment = action.payload;
        } else {
          state.currentAppointment = null;
        }
      })
      .addCase(fetchAppointmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create appointment
    builder
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.appointments.push(action.payload);
          state.currentAppointment = action.payload;
        }
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update appointment
    builder
      .addCase(updateAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.appointments.findIndex(
            (appointment) => appointment.id === action.payload?.id
          );
          if (index !== -1 && action.payload) {
            state.appointments[index] = action.payload;
          }
          state.currentAppointment = action.payload;
        }
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete appointment
    builder
      .addCase(deleteAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.appointments = state.appointments.filter(
            (appointment) => appointment.id !== action.payload
          );
          if (state.currentAppointment?.id === action.payload) {
            state.currentAppointment = null;
          }
        }
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { clearError, setCurrentAppointment } = appointmentsSlice.actions;

// Base selector
const selectAppointmentsState = (state: RootState) =>
  (state as any).appointments;

// Memoized selectors
export const selectAppointments = createSelector(
  [selectAppointmentsState],
  (state) => state.appointments
);

export const selectCurrentAppointment = createSelector(
  [selectAppointmentsState],
  (state) => state.currentAppointment
);

export const selectAppointmentsLoading = createSelector(
  [selectAppointmentsState],
  (state) => state.loading
);

export const selectAppointmentsError = createSelector(
  [selectAppointmentsState],
  (state) => state.error
);

// Derived selectors
export const selectUpcomingAppointments = createSelector(
  [selectAppointments],
  (appointments) => {
    const now = new Date();
    return appointments
      .filter((appointment: Appointment) => {
        const appointmentDate = new Date(appointment.start_time);
        return appointmentDate > now;
      })
      .sort((a: Appointment, b: Appointment) => {
        return (
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
      });
  }
);

export const selectPastAppointments = createSelector(
  [selectAppointments],
  (appointments) => {
    const now = new Date();
    return appointments
      .filter((appointment: Appointment) => {
        const appointmentDate = new Date(appointment.start_time);
        return appointmentDate <= now;
      })
      .sort((a: Appointment, b: Appointment) => {
        return (
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        );
      });
  }
);

export const selectAppointmentsByStatus = createSelector(
  [selectAppointments, (_, status: string) => status],
  (appointments, status) => {
    return appointments.filter(
      (appointment: Appointment) => appointment.status === status
    );
  }
);

export default appointmentsSlice.reducer;
