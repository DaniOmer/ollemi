"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { createSelector } from "@reduxjs/toolkit";
import { Category, Company, Service, ServiceFormData, Address } from "@/types";
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
  getCompaniesByCategory,
  uploadPhoto,
  deletePhoto,
  createCompanyAddress,
  updateCompanyAddress,
  deleteCompanyAddress,
} from "@/lib/services/companies";

// Define the state type
interface CompaniesState {
  companies: Company[];
  currentCompany: Company | null;
  companiesByCategory: Company[];
  services: Service[];
  currentService: Service | null;
  photos: Record<string, string[]>; // Photos indexed by company ID
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: CompaniesState = {
  companies: [],
  currentCompany: null,
  companiesByCategory: [],
  services: [],
  currentService: null,
  photos: {},
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

export const fetchCompaniesByCategory = createAsyncThunk(
  "companies/fetchByCategory",
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const response = await getCompaniesByCategory(categoryId);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to fetch companies by category"
      );
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
  async (
    { id, companyId }: { id: string; companyId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await getService(id, companyId);
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
  async (
    { service, companyId }: { service: Omit<Service, "id">; companyId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await createService(service, companyId);
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
    {
      id,
      service,
      companyId,
    }: { id: string; service: Partial<Service>; companyId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateService(id, service, companyId);
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
  async (
    { id, companyId }: { id: string; companyId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await deleteService(id, companyId);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete service");
    }
  }
);

export const uploadPhotoThunk = createAsyncThunk(
  "companies/uploadPhoto",
  async (
    { companyId, photoUrl }: { companyId: string; photoUrl: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await uploadPhoto(companyId, photoUrl);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to upload photo");
    }
  }
);

export const deletePhotoThunk = createAsyncThunk(
  "companies/deletePhoto",
  async (
    { companyId, photoId }: { companyId: string; photoId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await deletePhoto(companyId, photoId);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete photo");
    }
  }
);

// Address-related thunks
export const createAddressThunk = createAsyncThunk(
  "companies/createAddress",
  async (
    {
      companyId,
      addressData,
    }: {
      companyId: string;
      addressData: Omit<
        Address,
        "id" | "company_id" | "created_at" | "updated_at"
      >;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await createCompanyAddress(companyId, addressData);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create address");
    }
  }
);

export const updateAddressThunk = createAsyncThunk(
  "companies/updateAddress",
  async (
    {
      companyId,
      addressId,
      addressData,
    }: {
      companyId: string;
      addressId: string;
      addressData: Partial<Address>;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateCompanyAddress(
        companyId,
        addressId,
        addressData
      );
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update address");
    }
  }
);

export const deleteAddressThunk = createAsyncThunk(
  "companies/deleteAddress",
  async (
    { companyId, addressId }: { companyId: string; addressId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await deleteCompanyAddress(companyId, addressId);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return { companyId, addressId };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete address");
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
    // Add actions for photos
    addCompanyPhotos: (
      state,
      action: PayloadAction<{ companyId: string; photos: string[] }>
    ) => {
      const { companyId, photos } = action.payload;
      if (!state.photos?.[companyId]) {
        state.photos[companyId] = [];
      }
      state.photos[companyId] = [...state.photos[companyId], ...photos];
    },
    removeCompanyPhoto: (
      state,
      action: PayloadAction<{ companyId: string; photoUrl: string }>
    ) => {
      const { companyId, photoUrl } = action.payload;
      if (state.photos[companyId]) {
        state.photos[companyId] = state.photos[companyId].filter(
          (photo) => photo !== photoUrl
        );
      }
    },
    clearCompanyPhotos: (state, action: PayloadAction<string>) => {
      const companyId = action.payload;
      state.photos[companyId] = [];
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

    // Fetch companies by category
    builder
      .addCase(fetchCompaniesByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompaniesByCategory.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.companiesByCategory = action.payload;
        } else {
          state.companiesByCategory = [];
        }
      })
      .addCase(fetchCompaniesByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Upload photo
    builder
      .addCase(uploadPhotoThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadPhotoThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.currentCompany?.photos?.push(action.payload);
        }
      })
      .addCase(uploadPhotoThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete photo
    builder
      .addCase(deletePhotoThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePhotoThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentCompany?.photos && action.meta.arg.photoId) {
          state.currentCompany.photos = state.currentCompany.photos.filter(
            (photo) => photo.id !== action.meta.arg.photoId
          );
        }
      })
      .addCase(deletePhotoThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Address-related cases
      .addCase(createAddressThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAddressThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && state.currentCompany) {
          state.currentCompany.addresses = action.payload;
        }
      })
      .addCase(createAddressThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateAddressThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAddressThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && state.currentCompany) {
          state.currentCompany.addresses = action.payload;
        }
      })
      .addCase(updateAddressThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteAddressThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAddressThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentCompany) {
          state.currentCompany.addresses = undefined;
        }
      })
      .addCase(deleteAddressThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const {
  clearError,
  setCurrentCompany,
  setCurrentService,
  addCompanyPhotos,
  removeCompanyPhoto,
  clearCompanyPhotos,
} = companiesSlice.actions;

// Selectors
export const selectCompaniesState = (state: RootState) =>
  (state as any).companies;

export const selectCompanies = createSelector(
  [selectCompaniesState],
  (companiesState) => companiesState.companies
);

export const selectCompaniesLoading = createSelector(
  [selectCompaniesState],
  (companiesState) => companiesState.loading
);

export const selectCompaniesError = createSelector(
  [selectCompaniesState],
  (companiesState) => companiesState.error
);

export const selectCurrentCompany = createSelector(
  [selectCompaniesState],
  (companiesState) => companiesState.currentCompany
);

export const selectCompaniesByCategory = createSelector(
  [selectCompaniesState],
  (companiesState) => companiesState.companiesByCategory
);

export const selectServices = createSelector(
  [selectCompaniesState],
  (companiesState) => companiesState.services
);

export const selectCurrentService = createSelector(
  [selectCompaniesState],
  (companiesState) => companiesState.currentService
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

// Additional selectors for photos
export const selectCompanyPhotos = createSelector(
  [selectCompaniesState, (_, companyId: string) => companyId],
  (companiesState, companyId) => companiesState.photos[companyId] || []
);

export const selectAllPhotos = createSelector(
  [selectCompaniesState],
  (companiesState) => companiesState.photos
);

export default companiesSlice.reducer;
