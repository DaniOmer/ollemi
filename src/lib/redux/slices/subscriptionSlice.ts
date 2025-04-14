import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { SubscriptionPlan } from "@/types";

interface SubscriptionState {
  plans: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  plans: [],
  loading: false,
  error: null,
};

export const fetchSubscriptionPlans = createAsyncThunk(
  "subscription/fetchPlans",
  async (interval: string) => {
    const response = await fetch(
      `/api/subscription/plans?interval=${interval}`
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch subscription plans");
    }
    return data.plans;
  }
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchSubscriptionPlans.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch subscription plans";
      });
  },
});

export default subscriptionSlice.reducer;
