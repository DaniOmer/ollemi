"use client";

import { cookies } from "next/headers";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { createSelector } from "@reduxjs/toolkit";
import { User } from "@/types";
import { signIn, signOut, signUp, getCurrentUser } from "@/lib/services/auth";
import { RootState } from "../store";

// Define the state type
interface AuthState {
  user: User | null;
  refreshToken: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  refreshToken: null,
  status: "idle",
  error: null,
};

// Async thunks for authentication actions
export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await signIn(email, password);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to login");
    }
  }
);

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (
    {
      email,
      password,
      firstName,
      lastName,
      phone,
      role,
      acceptTerms,
      discount_code,
    }: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      role?: string;
      acceptTerms?: boolean;
      discount_code?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await signUp(
        email,
        password,
        firstName,
        lastName,
        phone,
        role || "client",
        acceptTerms || false,
        discount_code || null
      );
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to register");
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await signOut();
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to logout");
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCurrentUser();
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch user");
    }
  }
);

// Create the auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = "succeeded";
          state.user = action.payload.user_data;
          state.refreshToken = action.payload.session.refresh_token || null;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(registerThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload) {
          state.user = action.payload.user;
        }
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = "succeeded";
        state.user = null;
        state.refreshToken = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // Fetch current user
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload) {
          state.user = action.payload.user;
        }
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { clearError, setUser } = authSlice.actions;

// Base selector
const selectAuthState = (state: RootState) => (state as any).auth;

// Memoized selectors
export const selectAuth = createSelector([selectAuthState], (state) => state);

export const selectRefreshToken = createSelector(
  [selectAuthState],
  (state) => state.refreshToken
);

export const selectUser = createSelector(
  [selectAuthState],
  (state) => state.user
);

export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (state) => {
    // Check both token and user existence for a more reliable authentication check
    // In practice, this will also check HTTP-only cookies through the useAuth hook
    return !!state.refreshToken && !!state.user;
  }
);

export const selectAuthLoading = createSelector(
  [selectAuthState],
  (state) => state.status === "loading"
);

export const selectAuthError = createSelector(
  [selectAuthState],
  (state) => state.error
);

// Derived selectors
export const selectUserRole = createSelector(
  [selectUser],
  (user) => user?.role || null
);

export const selectUserName = createSelector([selectUser], (user) =>
  user ? `${user.first_name} ${user.last_name}` : null
);

export default authSlice.reducer;
