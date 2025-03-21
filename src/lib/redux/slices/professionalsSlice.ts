"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { createSelector } from "@reduxjs/toolkit";
import { Professional, Service } from "@/types";
import { RootState } from "../store";
import {
  getProfessionals,
  getProfessional,
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  updateProfessional as updateProfessionalService,
} from "@/lib/services/professionals";

// Define the state type
interface ProfessionalsState {
  professionals: Professional[];
  currentProfessional: Professional | null;
  services: Service[];
  currentService: Service | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: ProfessionalsState = {
  professionals: [],
  currentProfessional: null,
  services: [],
  currentService: null,
  loading: false,
  error: null,
};

// Async thunks for professional actions
export const fetchProfessionals = createAsyncThunk(
  "professionals/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getProfessionals();
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch professionals");
    }
  }
);

export const fetchProfessionalById = createAsyncThunk(
  "professionals/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await getProfessional(id);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch professional");
    }
  }
);

export const updateProfessional = createAsyncThunk(
  "professionals/update",
  async (
    { id, professional }: { id: string; professional: Partial<Professional> },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateProfessionalService(id, professional);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update professional");
    }
  }
);

// Service-related thunks
export const fetchServices = createAsyncThunk(
  "professionals/fetchServices",
  async (proId: string, { rejectWithValue }) => {
    try {
      const response = await getServices(proId);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch services");
    }
  }
);

export const fetchServiceById = createAsyncThunk(
  "professionals/fetchServiceById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await getService(id);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch service");
    }
  }
);

export const createServiceThunk = createAsyncThunk(
  "professionals/createService",
  async (service: Omit<Service, "id">, { rejectWithValue }) => {
    try {
      const response = await createService(service);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create service");
    }
  }
);

export const updateServiceThunk = createAsyncThunk(
  "professionals/updateService",
  async (
    { id, service }: { id: string; service: Partial<Service> },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateService(id, service);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update service");
    }
  }
);

export const deleteServiceThunk = createAsyncThunk(
  "professionals/deleteService",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await deleteService(id);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete service");
    }
  }
);

// Create the professionals slice
const professionalsSlice = createSlice({
  name: "professionals",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentProfessional: (
      state,
      action: PayloadAction<Professional | null>
    ) => {
      state.currentProfessional = action.payload;
    },
    setCurrentService: (state, action: PayloadAction<Service | null>) => {
      state.currentService = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch all professionals
    builder
      .addCase(fetchProfessionals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfessionals.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.professionals = action.payload;
        } else {
          state.professionals = [];
        }
      })
      .addCase(fetchProfessionals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch professional by ID
    builder
      .addCase(fetchProfessionalById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfessionalById.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.currentProfessional = action.payload;
        } else {
          state.currentProfessional = null;
        }
      })
      .addCase(fetchProfessionalById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update professional
    builder
      .addCase(updateProfessional.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfessional.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.professionals.findIndex(
            (professional) => professional.id === action.payload?.id
          );
          if (index !== -1 && action.payload) {
            state.professionals[index] = action.payload;
          }
          state.currentProfessional = action.payload;
        }
      })
      .addCase(updateProfessional.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch services
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.services = action.payload;
        } else {
          state.services = [];
        }
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch service by ID
    builder
      .addCase(fetchServiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.currentService = action.payload;
        } else {
          state.currentService = null;
        }
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create service
    builder
      .addCase(createServiceThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createServiceThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.services.push(action.payload);
          state.currentService = action.payload;
        }
      })
      .addCase(createServiceThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update service
    builder
      .addCase(updateServiceThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateServiceThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.services.findIndex(
            (service) => service.id === action.payload?.id
          );
          if (index !== -1 && action.payload) {
            state.services[index] = action.payload;
          }
          state.currentService = action.payload;
        }
      })
      .addCase(updateServiceThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete service
    builder
      .addCase(deleteServiceThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteServiceThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.services = state.services.filter(
            (service) => service.id !== action.payload
          );
          if (state.currentService?.id === action.payload) {
            state.currentService = null;
          }
        }
      })
      .addCase(deleteServiceThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { clearError, setCurrentProfessional, setCurrentService } =
  professionalsSlice.actions;

// Base selectors
const selectProfessionalsState = (state: RootState) =>
  (state as any).professionals;

// Memoized selectors
export const selectProfessionals = createSelector(
  [selectProfessionalsState],
  (state) => state.professionals
);

export const selectCurrentProfessional = createSelector(
  [selectProfessionalsState],
  (state) => state.currentProfessional
);

export const selectProfessionalsLoading = createSelector(
  [selectProfessionalsState],
  (state) => state.loading
);

export const selectProfessionalsError = createSelector(
  [selectProfessionalsState],
  (state) => state.error
);

// Service selectors
export const selectServices = createSelector(
  [selectProfessionalsState],
  (state) => state.services
);

export const selectCurrentService = createSelector(
  [selectProfessionalsState],
  (state) => state.currentService
);

// Derived selectors
export const selectServicesByCategory = createSelector(
  [selectServices],
  (services) => {
    const servicesByCategory: Record<string, Service[]> = {};
    services.forEach((service: Service) => {
      if (!servicesByCategory[service.category]) {
        servicesByCategory[service.category] = [];
      }
      servicesByCategory[service.category].push(service);
    });
    return servicesByCategory;
  }
);

export const selectServicesSortedByPrice = createSelector(
  [selectServices],
  (services) => [...services].sort((a, b) => a.price - b.price)
);

export default professionalsSlice.reducer;
