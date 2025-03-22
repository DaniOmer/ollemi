"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { createSelector } from "@reduxjs/toolkit";
import { Company, Service, ServiceFormData } from "@/types";
import { RootState } from "../store";
import {
  getCompanies,
  getCompany,
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  updateCompany,
} from "@/lib/services/companies";

// Define the state type
interface CompaniesState {
  companies: Company[];
  currentCompany: Company | null;
  services: Service[];
  currentService: Service | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: CompaniesState = {
  companies: [],
  currentCompany: null,
  services: [],
  currentService: null,
  loading: false,
  error: null,
};

// Async thunks for company actions
export const fetchCompanies = createAsyncThunk(
  "companies/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCompanies();
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch companies");
    }
  }
);

export const fetchCompanyById = createAsyncThunk(
  "companies/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await getCompany(id);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch company");
    }
  }
);

export const updateCompanyThunk = createAsyncThunk(
  "companies/update",
  async (
    {
      id,
      company,
    }: {
      id: string;
      company: Partial<Company> & { services?: ServiceFormData[] };
    },
    { rejectWithValue }
  ) => {
    // Extract services from company data if present
    const { services, ...companyData } = company;
    try {
      // Update company without services
      const response = await updateCompany(id, companyData);
      if (response.error) {
        return rejectWithValue(response.error);
      }

      // If services were provided, create/update them
      if (services && services.length > 0) {
        // Here you would handle services separately
        // For example, you could create new services or update existing ones
        // This would require additional API calls
        // For now, we'll just return the company data
        // In a real implementation, you would update the services and return the updated company with services
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update company");
    }
  }
);

// Service-related thunks
export const fetchServices = createAsyncThunk(
  "companies/fetchServices",
  async (companyId: string, { rejectWithValue }) => {
    try {
      const response = await getServices(companyId);
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
  "companies/fetchServiceById",
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
  "companies/createService",
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
  "companies/updateService",
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
  "companies/deleteService",
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

// Create the companies slice
const companiesSlice = createSlice({
  name: "companies",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentCompany: (state, action: PayloadAction<Company | null>) => {
      state.currentCompany = action.payload;
    },
    setCurrentService: (state, action: PayloadAction<Service | null>) => {
      state.currentService = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch all companies
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.companies = action.payload;
        } else {
          state.companies = [];
        }
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch company by ID
    builder
      .addCase(fetchCompanyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyById.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.currentCompany = action.payload;
        } else {
          state.currentCompany = null;
        }
      })
      .addCase(fetchCompanyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update company
    builder
      .addCase(updateCompanyThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompanyThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.companies.findIndex(
            (company) => company.id === action.payload?.id
          );
          if (index !== -1 && action.payload) {
            state.companies[index] = action.payload;
          }
          state.currentCompany = action.payload;
        }
      })
      .addCase(updateCompanyThunk.rejected, (state, action) => {
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
export const { clearError, setCurrentCompany, setCurrentService } =
  companiesSlice.actions;

// Base selectors
const selectCompaniesState = (state: RootState) => (state as any).companies;

// Memoized selectors
export const selectCompanies = createSelector(
  [selectCompaniesState],
  (state) => state.companies
);

export const selectCurrentCompany = createSelector(
  [selectCompaniesState],
  (state) => state.currentCompany
);

export const selectCompaniesLoading = createSelector(
  [selectCompaniesState],
  (state) => state.loading
);

export const selectCompaniesError = createSelector(
  [selectCompaniesState],
  (state) => state.error
);

// Service selectors
export const selectServices = createSelector(
  [selectCompaniesState],
  (state) => state.services
);

export const selectCurrentService = createSelector(
  [selectCompaniesState],
  (state) => state.currentService
);

// Derived selectors
export const selectServicesByCategory = createSelector(
  [selectServices],
  (services) => {
    const servicesByCategory: Record<string, Service[]> = {};
    services.forEach((service: Service) => {
      const category = service.category || "general";
      if (!servicesByCategory[category]) {
        servicesByCategory[category] = [];
      }
      servicesByCategory[category].push(service);
    });
    return servicesByCategory;
  }
);

export const selectServicesSortedByPrice = createSelector(
  [selectServices],
  (services) => [...services].sort((a, b) => a.price - b.price)
);

// For backward compatibility with professionals slice
export const selectProfessionals = selectCompanies;
export const selectCurrentProfessional = selectCurrentCompany;
export const selectProfessionalsLoading = selectCompaniesLoading;
export const selectProfessionalsError = selectCompaniesError;

export default companiesSlice.reducer;
