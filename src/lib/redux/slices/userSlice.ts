"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { createSelector } from "@reduxjs/toolkit";
import { User, Review } from "@/types";
import { RootState } from "../store";

import {
  getUserProfile,
  updateUserProfile as updateUserProfileService,
  getUserPreferences,
  updateUserPreferences as updateUserPreferencesService,
  getUserFavorites,
  addUserFavorite,
  removeUserFavorite,
  checkUserFavorite,
  getUserPoints,
  getUserAppointmentHistory,
  UserPreferences,
  FavoriteProfessional,
  UserPoints,
} from "@/lib/services/user";
import { addReview } from "@/lib/services/companies";

// Define the state type
interface UserState {
  isAuthenticated: boolean;
  profile: User | null;
  preferences: UserPreferences;
  favorites: FavoriteProfessional[];
  points: UserPoints;
  appointmentHistory: string[];
  review: Pick<Review, "comment" | "rating" | "company_id"> | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Initial state
const initialState: UserState = {
  isAuthenticated: false,
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
  review: null,
  status: "idle",
  error: null,
};

// We'll use the imported service functions instead of defining them here

// Async thunks for user actions
export const fetchUserProfile = createAsyncThunk(
  "users/fetchProfile",
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
  "users/updateProfile",
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
  "users/fetchPreferences",
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
  "users/updatePreferences",
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

export const fetchUserFavoritesThunk = createAsyncThunk(
  "users/fetchFavorites",
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

export const addUserFavoriteThunk = createAsyncThunk(
  "users/addFavorite",
  async (professionalId: string, { rejectWithValue }) => {
    try {
      const response = await addUserFavorite(professionalId);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to add favorite");
    }
  }
);

export const removeUserFavoriteThunk = createAsyncThunk(
  "users/removeFavorite",
  async (professionalId: string, { rejectWithValue }) => {
    try {
      const response = await removeUserFavorite(professionalId);
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
  "users/fetchPoints",
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
  "users/fetchAppointmentHistory",
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

export const checkUserFavoriteThunk = createAsyncThunk(
  "users/checkFavorite",
  async (professionalId: string, { rejectWithValue }) => {
    try {
      const response = await checkUserFavorite(professionalId);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to check user favorite");
    }
  }
);

export const addReviewThunk = createAsyncThunk(
  "users/addReview",
  async (
    review: Pick<Review, "comment" | "rating" | "company_id">,
    { rejectWithValue }
  ) => {
    try {
      const response = await addReview(review);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to add review");
    }
  }
);

// Create the user slice
const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.profile = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setReview: (
      state,
      action: PayloadAction<Pick<
        Review,
        "comment" | "rating" | "company_id"
      > | null>
    ) => {
      state.review = action.payload;
    },
    resetReview: (state) => {
      state.review = null;
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
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload) {
          state.profile = action.payload;
        }
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // Update user profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload) {
          state.profile = action.payload;
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // Fetch user preferences
    builder
      .addCase(fetchUserPreferences.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserPreferences.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload) {
          state.preferences = action.payload;
        }
      })
      .addCase(fetchUserPreferences.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // Update user preferences
    builder
      .addCase(updateUserPreferences.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload) {
          state.preferences = action.payload;
        }
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // Fetch user favorites
    builder
      .addCase(fetchUserFavoritesThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserFavoritesThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload) {
          state.favorites = action.payload;
        } else {
          state.favorites = [];
        }
      })
      .addCase(fetchUserFavoritesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // Add user favorite
    builder
      .addCase(addUserFavoriteThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addUserFavoriteThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload) {
          state.favorites.push(action.payload);
        }
      })
      .addCase(addUserFavoriteThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // Remove user favorite
    builder
      .addCase(removeUserFavoriteThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(removeUserFavoriteThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload) {
          state.favorites = state.favorites.filter(
            (favorite) => favorite.id !== action.payload
          );
        }
      })
      .addCase(removeUserFavoriteThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // Fetch user points
    builder
      .addCase(fetchUserPoints.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserPoints.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload) {
          state.points = action.payload;
        }
      })
      .addCase(fetchUserPoints.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // Fetch user appointment history
    builder
      .addCase(fetchUserAppointmentHistory.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserAppointmentHistory.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload) {
          state.appointmentHistory = action.payload;
        } else {
          state.appointmentHistory = [];
        }
      })
      .addCase(fetchUserAppointmentHistory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // Add review
    builder
      .addCase(addReviewThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addReviewThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        // if (action.payload) {
        //   state. = action.payload;
        // }
      })
      .addCase(addReviewThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const {
  clearError,
  setTheme,
  setLanguage,
  resetState,
  setReview,
  resetReview,
  setIsAuthenticated,
  setUser,
} = userSlice.actions;

// Base selector
const selectUserState = (state: RootState) => (state as any).user;

// Memoized selectors
export const selectUserIsAuthenticated = createSelector(
  [selectUserState],
  (state) => state.isAuthenticated
);

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
  (state) => state.status == "loading"
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

export const selectUserReview = createSelector(
  [selectUserState],
  (state) => state.review
);

export const selectUserReviewStatus = createSelector(
  [selectUserState],
  (state) => state.status
);

export const selectUserReviewError = createSelector(
  [selectUserState],
  (state) => state.error
);

export const selectUserReviewLoading = createSelector(
  [selectUserState],
  (state) => state.status === "loading"
);

export default userSlice.reducer;
