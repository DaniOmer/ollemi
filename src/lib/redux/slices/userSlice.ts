"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { createSelector } from "@reduxjs/toolkit";
import { User } from "@/types";
import { RootState } from "../store";

import {
  getUserProfile,
  updateUserProfile as updateUserProfileService,
  getUserPreferences,
  updateUserPreferences as updateUserPreferencesService,
  getUserFavorites,
  addUserFavorite as addUserFavoriteService,
  removeUserFavorite as removeUserFavoriteService,
  getUserPoints,
  getUserAppointmentHistory,
  UserPreferences,
  FavoriteProfessional,
  UserPoints,
} from "@/lib/services/user";

// Define the state type
interface UserState {
  profile: User | null;
  preferences: UserPreferences;
  favorites: FavoriteProfessional[];
  points: UserPoints;
  appointmentHistory: string[]; // IDs of past appointments
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: UserState = {
  profile: null,
  preferences: {
    notifications: true,
    theme: "system",
    language: "fr",
  },
  favorites: [],
  points: {
    total: 0,
    history: [],
  },
  appointmentHistory: [],
  loading: false,
  error: null,
};

// We'll use the imported service functions instead of defining them here

// Async thunks for user actions
export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserProfile();
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch user profile");
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async (profile: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await updateUserProfileService(profile);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update user profile");
    }
  }
);

export const fetchUserPreferences = createAsyncThunk(
  "user/fetchPreferences",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserPreferences();
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to fetch user preferences"
      );
    }
  }
);

export const updateUserPreferences = createAsyncThunk(
  "user/updatePreferences",
  async (preferences: Partial<UserPreferences>, { rejectWithValue }) => {
    try {
      const response = await updateUserPreferencesService(preferences);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to update user preferences"
      );
    }
  }
);

export const fetchUserFavorites = createAsyncThunk(
  "user/fetchFavorites",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserFavorites();
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch user favorites");
    }
  }
);

export const addUserFavorite = createAsyncThunk(
  "user/addFavorite",
  async (professionalId: string, { rejectWithValue }) => {
    try {
      const response = await addUserFavoriteService(professionalId);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to add favorite");
    }
  }
);

export const removeUserFavorite = createAsyncThunk(
  "user/removeFavorite",
  async (professionalId: string, { rejectWithValue }) => {
    try {
      const response = await removeUserFavoriteService(professionalId);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return professionalId;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to remove favorite");
    }
  }
);

export const fetchUserPoints = createAsyncThunk(
  "user/fetchPoints",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserPoints();
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch user points");
    }
  }
);

export const fetchUserAppointmentHistory = createAsyncThunk(
  "user/fetchAppointmentHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserAppointmentHistory();
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to fetch appointment history"
      );
    }
  }
);

// Create the user slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setTheme: (state, action: PayloadAction<"light" | "dark" | "system">) => {
      state.preferences.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.preferences.language = action.payload;
    },
    resetState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch user profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.profile = action.payload;
        }
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update user profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.profile = action.payload;
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch user preferences
    builder
      .addCase(fetchUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.preferences = action.payload;
        }
      })
      .addCase(fetchUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update user preferences
    builder
      .addCase(updateUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.preferences = action.payload;
        }
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch user favorites
    builder
      .addCase(fetchUserFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserFavorites.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.favorites = action.payload;
        } else {
          state.favorites = [];
        }
      })
      .addCase(fetchUserFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add user favorite
    builder
      .addCase(addUserFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUserFavorite.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.favorites.push(action.payload);
        }
      })
      .addCase(addUserFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Remove user favorite
    builder
      .addCase(removeUserFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeUserFavorite.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.favorites = state.favorites.filter(
            (favorite) => favorite.id !== action.payload
          );
        }
      })
      .addCase(removeUserFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch user points
    builder
      .addCase(fetchUserPoints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPoints.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.points = action.payload;
        }
      })
      .addCase(fetchUserPoints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch user appointment history
    builder
      .addCase(fetchUserAppointmentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAppointmentHistory.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.appointmentHistory = action.payload;
        } else {
          state.appointmentHistory = [];
        }
      })
      .addCase(fetchUserAppointmentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { clearError, setTheme, setLanguage, resetState } =
  userSlice.actions;

// Base selector
const selectUserState = (state: RootState) => (state as any).user;

// Memoized selectors
export const selectUserProfile = createSelector(
  [selectUserState],
  (state) => state.profile
);

export const selectUserPreferences = createSelector(
  [selectUserState],
  (state) => state.preferences
);

export const selectUserFavorites = createSelector(
  [selectUserState],
  (state) => state.favorites
);

export const selectUserPoints = createSelector(
  [selectUserState],
  (state) => state.points
);

export const selectUserAppointmentHistory = createSelector(
  [selectUserState],
  (state) => state.appointmentHistory
);

export const selectUserLoading = createSelector(
  [selectUserState],
  (state) => state.loading
);

export const selectUserError = createSelector(
  [selectUserState],
  (state) => state.error
);

// Derived selectors
export const selectUserFullName = createSelector(
  [selectUserProfile],
  (profile) => (profile ? `${profile.first_name} ${profile.last_name}` : null)
);

export const selectUserTheme = createSelector(
  [selectUserPreferences],
  (preferences) => preferences.theme
);

export const selectUserLanguage = createSelector(
  [selectUserPreferences],
  (preferences) => preferences.language
);

export const selectUserNotifications = createSelector(
  [selectUserPreferences],
  (preferences) => preferences.notifications
);

export const selectUserPointsTotal = createSelector(
  [selectUserPoints],
  (points) => points.total
);

export const selectUserPointsHistory = createSelector(
  [selectUserPoints],
  (points) => points.history
);

export default userSlice.reducer;
