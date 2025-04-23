import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { SubscriptionPlan, Subscription } from "@/types";
import {
  getSubscriptionPlans,
  createCheckoutSession,
  getActiveSubscription,
} from "@/lib/services/subscriptions";
import { StripeCheckoutSession } from "@/lib/services/stripe";
import { RootState } from "../store";

interface SubscriptionState {
  plans: SubscriptionPlan[];
  subscriptions: Subscription[];
  activeSubscription: Subscription | null;
  checkoutSession: StripeCheckoutSession | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: SubscriptionState = {
  plans: [],
  subscriptions: [],
  activeSubscription: null,
  status: "idle",
  error: null,
  checkoutSession: null,
};

export const fetchSubscriptionPlansThunk = createAsyncThunk(
  "subscriptions/fetchPlans",
  async (interval: string) => {
    const data = await getSubscriptionPlans(interval);
    if (!data || !data.data) {
      throw new Error("Invalid response format for subscription plans");
    }
    return data.data;
  }
);

export const createCheckoutSessionThunk = createAsyncThunk(
  "subscriptions/createCheckoutSession",
  async (
    {
      planId,
      successUrl,
      cancelUrl,
    }: { planId: string; successUrl: string; cancelUrl: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await createCheckoutSession(planId, successUrl, cancelUrl);
      return data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchActiveSubscriptionThunk = createAsyncThunk(
  "subscriptions/fetchActiveSubscription",
  async () => {
    const data = await getActiveSubscription();
    if (!data || !data.data) {
      throw new Error("Invalid response format for user subscriptions");
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
      .addCase(fetchSubscriptionPlansThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSubscriptionPlansThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.plans = action.payload;
      })
      .addCase(fetchSubscriptionPlansThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.error.message || "Failed to fetch subscription plans";
      })
      .addCase(createCheckoutSessionThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createCheckoutSessionThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.checkoutSession = action.payload;
      })
      .addCase(createCheckoutSessionThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.error.message || "Failed to create checkout session";
      })
      .addCase(fetchActiveSubscriptionThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchActiveSubscriptionThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.activeSubscription = action.payload;
      })
      .addCase(fetchActiveSubscriptionThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.error.message || "Failed to fetch active subscription";
      });
  },
});

// Selectors
export const selectSubscriptionState = (state: RootState) =>
  (state as any).subscriptions;

export const selectSubscriptionPlans = createSelector(
  [selectSubscriptionState],
  (state) => state.plans
);

export const selectCheckoutSession = createSelector(
  [selectSubscriptionState],
  (state) => state.checkoutSession
);

export const selectSubscriptionStatus = createSelector(
  [selectSubscriptionState],
  (state) => state.status
);

export const selectSubscriptionError = createSelector(
  [selectSubscriptionState],
  (state) => state.error
);

export default subscriptionSlice.reducer;
