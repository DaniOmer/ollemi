"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createSelector } from "@reduxjs/toolkit";
import { Category } from "@/types";
import { RootState } from "../store";
import { getCategories, getCategoryById } from "@/lib/services/categories";

// Define the state type
interface CategoriesState {
  categories: Category[];
  currentCategory: Category | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Initial state
const initialState: CategoriesState = {
  categories: [],
  currentCategory: null,
  status: "idle",
  error: null,
};

// Async thunk for fetching categories
export const fetchCategories = createAsyncThunk<Category[]>(
  "categories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCategories();
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch categories");
    }
  }
);

// Async thunk for fetching a single category
export const fetchCategoryById = createAsyncThunk<
  Category,
  { id: string; includeCompanies?: boolean }
>(
  "categories/fetchById",
  async ({ id, includeCompanies = false }, { rejectWithValue }) => {
    try {
      const response = await getCategoryById(id, includeCompanies);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data as Category;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch category");
    }
  }
);

// Create the categories slice
const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Fetch single category
      .addCase(fetchCategoryById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { clearError } = categoriesSlice.actions;

// Create selectors
const selectCategoriesState = (state: RootState) => (state as any).categories;

export const selectCategories = createSelector(
  [selectCategoriesState],
  (categoriesState) => categoriesState.categories
);

export const selectCurrentCategory = createSelector(
  [selectCategoriesState],
  (categoriesState) => categoriesState.currentCategory
);

export const selectCategoriesLoading = createSelector(
  [selectCategoriesState],
  (categoriesState) => categoriesState.status === "loading"
);

export const selectCategoriesError = createSelector(
  [selectCategoriesState],
  (categoriesState) => categoriesState.error
);

// Export reducer
export default categoriesSlice.reducer;
