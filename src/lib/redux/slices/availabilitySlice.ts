import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BusinessHours, AvailabilityState } from "@/types";
import {
  getBusinessHours,
  updateBusinessHours as updateHours,
} from "@/lib/services/availability";

const initialState: AvailabilityState = {
  businessHours: [],
  status: "idle",
  error: null,
};

export const fetchBusinessHours = createAsyncThunk(
  "availability/fetchBusinessHours",
  async (companyId: string, { rejectWithValue }) => {
    try {
      const response = await getBusinessHours(companyId);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch business hours");
    }
  }
);

export const updateBusinessHours = createAsyncThunk(
  "availability/updateBusinessHours",
  async (
    {
      companyId,
      businessHours,
    }: {
      companyId: string;
      businessHours: BusinessHours[];
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateHours(companyId, businessHours);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data || [];
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to update business hours"
      );
    }
  }
);

const availabilitySlice = createSlice({
  name: "availability",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch business hours
      .addCase(fetchBusinessHours.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBusinessHours.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.businessHours = action.payload;
      })
      .addCase(fetchBusinessHours.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch business hours";
      })
      // Update business hours
      .addCase(updateBusinessHours.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateBusinessHours.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.businessHours = action.payload;
      })
      .addCase(updateBusinessHours.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to update business hours";
      });
  },
});

export const selectBusinessHours = (state: {
  availability: AvailabilityState;
}) => state.availability.businessHours;
export const selectAvailabilityStatus = (state: {
  availability: AvailabilityState;
}) => state.availability.status;
export const selectAvailabilityError = (state: {
  availability: AvailabilityState;
}) => state.availability.error;

export default availabilitySlice.reducer;
