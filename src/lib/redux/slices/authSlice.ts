"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { createSelector } from "@reduxjs/toolkit";
import { User } from "@/types";
import {
  signIn,
  signOut,
  signUp,
  getCurrentUser,
  AuthResponse,
} from "@/lib/services/auth";
import { RootState } from "../store";

// Define the state type
interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
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

export const register = createAsyncThunk(
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
    }: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      role?: string;
      acceptTerms?: boolean;
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
        acceptTerms || false
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
      state.token = action.payload ? "valid-session" : null; // Just a marker, not a real token
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        if (action.payload) {
          state.loading = false;
          state.user = action.payload.user_data;
          state.token = action.payload.session.access_token;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        if (action.payload) {
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.session.access_token;
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch current user
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        if (action.payload) {
          state.loading = false;
          state.user = action.payload.user;
        }
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
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

export const selectUser = createSelector(
  [selectAuthState],
  (state) => state.user
);

export const selectIsAuthenticated = createSelector(
  [selectUser],
  (user) => !!user
);

export const selectAuthLoading = createSelector(
  [selectAuthState],
  (state) => state.loading
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
