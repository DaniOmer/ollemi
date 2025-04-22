import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { StripeSubscription, StripePaymentMethod } from "@/lib/services/stripe";
import { createCheckoutSession } from "@/lib/services/subscriptions";
import { fetchPrivateApi } from "@/lib/services/api";

interface StripeState {
  subscription: StripeSubscription | null;
  paymentMethods: StripePaymentMethod[];
  loading: boolean;
  error: string | null;
}

const initialState: StripeState = {
  subscription: null,
  paymentMethods: [],
  loading: false,
  error: null,
};

export const createCheckoutSessionThunk = createAsyncThunk(
  "stripe/createCheckoutSession",
  async (payload: {
    planId: string;
    successUrl: string;
    cancelUrl: string;
  }) => {
    const response = await createCheckoutSession(
      payload.planId,
      payload.successUrl,
      payload.cancelUrl
    );
    return response.data;
  }
);

export const createSubscription = createAsyncThunk(
  "stripe/createSubscription",
  async (payload: {
    planId: string;
    paymentMethodId: string;
    companyId?: string;
  }) => {
    const data = await fetchPrivateApi("/api/stripe/subscriptions", {
      method: "POST",
      data: {
        action: "createSubscription",
        data: payload,
      },
    });
    return data;
  }
);

export const cancelSubscription = createAsyncThunk(
  "stripe/cancelSubscription",
  async (payload: { subscriptionId: string; cancelImmediately?: boolean }) => {
    return await fetchPrivateApi("/api/stripe", {
      method: "POST",
      data: {
        action: "cancelSubscription",
        data: payload,
      },
    });
  }
);

export const resumeSubscription = createAsyncThunk(
  "stripe/resumeSubscription",
  async (payload: { subscriptionId: string }) => {
    return await fetchPrivateApi("/api/stripe", {
      method: "POST",
      data: {
        action: "resumeSubscription",
        data: { resumeSubscriptionId: payload.subscriptionId },
      },
    });
  }
);

export const changePlan = createAsyncThunk(
  "stripe/changePlan",
  async (payload: { currentSubscriptionId: string; newPlanId: string }) => {
    return await fetchPrivateApi("/api/stripe", {
      method: "POST",
      data: {
        action: "changePlan",
        data: payload,
      },
    });
  }
);

export const getPaymentMethods = createAsyncThunk(
  "stripe/getPaymentMethods",
  async () => {
    return await fetchPrivateApi("/api/stripe", {
      method: "POST",
      data: {
        action: "getPaymentMethods",
        data: {},
      },
    });
  }
);

export const addPaymentMethod = createAsyncThunk(
  "stripe/addPaymentMethod",
  async (payload: { paymentMethodId: string; setAsDefault?: boolean }) => {
    return await fetchPrivateApi("/api/stripe", {
      method: "POST",
      data: {
        action: "addPaymentMethod",
        data: {
          newPaymentMethodId: payload.paymentMethodId,
          setAsDefault: payload.setAsDefault,
        },
      },
    });
  }
);

export const removePaymentMethod = createAsyncThunk(
  "stripe/removePaymentMethod",
  async (payload: { paymentMethodId: string }) => {
    return await fetchPrivateApi("/api/stripe", {
      method: "POST",
      data: {
        action: "removePaymentMethod",
        data: { paymentMethodToRemove: payload.paymentMethodId },
      },
    });
  }
);

export const setDefaultPaymentMethod = createAsyncThunk(
  "stripe/setDefaultPaymentMethod",
  async (payload: { paymentMethodId: string }) => {
    return await fetchPrivateApi("/api/stripe", {
      method: "POST",
      data: {
        action: "setDefaultPaymentMethod",
        data: { defaultPaymentMethodId: payload.paymentMethodId },
      },
    });
  }
);

const stripeSlice = createSlice({
  name: "stripe",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Create Checkout Session
    // builder
    //   .addCase(createCheckoutSession.pending, (state) => {
    //     state.loading = true;
    //     state.error = null;
    //   })
    //   .addCase(createCheckoutSession.fulfilled, (state) => {
    //     state.loading = false;
    //   })
    //   .addCase(createCheckoutSession.rejected, (state, action) => {
    //     state.loading = false;
    //     state.error =
    //       action.error.message || "Failed to create checkout session";
    //   });

    // Create Subscription
    builder
      .addCase(createSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // .addCase(createSubscription.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.subscription = action.payload;
      // })
      .addCase(createSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create subscription";
      });

    // Cancel Subscription
    builder
      .addCase(cancelSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state) => {
        state.loading = false;
        if (state.subscription) {
          state.subscription.cancel_at_period_end = true;
        }
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to cancel subscription";
      });

    // Resume Subscription
    builder
      .addCase(resumeSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resumeSubscription.fulfilled, (state) => {
        state.loading = false;
        if (state.subscription) {
          state.subscription.cancel_at_period_end = false;
        }
      })
      .addCase(resumeSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to resume subscription";
      });

    // Change Plan
    builder
      .addCase(changePlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // .addCase(changePlan.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.subscription = action.payload.subscription;
      // })
      .addCase(changePlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to change plan";
      });

    // Get Payment Methods
    builder
      .addCase(getPaymentMethods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // .addCase(getPaymentMethods.fulfilled, (state, action) => {
      //   if (action.payload) {
      //     state.loading = false;
      //     state.paymentMethods = action.payload.paymentMethods;
      //   }
      // })
      .addCase(getPaymentMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to get payment methods";
      });

    // Add Payment Method
    builder
      .addCase(addPaymentMethod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // .addCase(addPaymentMethod.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.paymentMethods.push(action.payload.paymentMethod);
      // })
      .addCase(addPaymentMethod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to add payment method";
      });

    // Remove Payment Method
    builder
      .addCase(removePaymentMethod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removePaymentMethod.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentMethods = state.paymentMethods.filter(
          (pm) => pm.id !== action.meta.arg.paymentMethodId
        );
      })
      .addCase(removePaymentMethod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to remove payment method";
      });

    // Set Default Payment Method
    builder
      .addCase(setDefaultPaymentMethod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setDefaultPaymentMethod.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentMethods = state.paymentMethods.map((pm) => ({
          ...pm,
          is_default: pm.id === action.meta.arg.paymentMethodId,
        }));
      })
      .addCase(setDefaultPaymentMethod.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to set default payment method";
      });
  },
});

export default stripeSlice.reducer;
