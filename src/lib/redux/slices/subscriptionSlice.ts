import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { SubscriptionPlan } from "@/types";
import { fetchApi } from "@/lib/services/api";
import { getSubscriptionPlans } from "@/lib/services/subscriptions";

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
  "subscriptions/fetchPlans",
  async (interval: string) => {
    const data = await getSubscriptionPlans(interval);
    if (!data || !data.data) {
      throw new Error("Invalid response format for subscription plans");
    }
    return data.data;
  }
);

const subscriptionSlice = createSlice({
  name: "subscriptions",
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
