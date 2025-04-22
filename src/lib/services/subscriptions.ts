import { fetchApi, fetchPrivateApi, ApiResponse } from "./api";
import {
  PaymentMethod,
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
  SubscriptionInvoice,
  InvoiceStatus,
} from "@/types";
import {
  stripe,
  StripeSubscription,
  StripeInvoice,
  StripePaymentMethod,
  StripeEvent,
  formatAmountForStripe,
  StripeCheckoutSession,
  StripePaymentIntent,
} from "@/lib/services/stripe";

/**
 * Create a Stripe checkout session via API
 */
export const createCheckoutSession = async (
  userId: string,
  planId: string,
  successUrl?: string,
  cancelUrl?: string
): Promise<ApiResponse<StripeCheckoutSession>> => {
  // Assuming API returns the session object or relevant part
  return await fetchPrivateApi<StripeCheckoutSession>(
    "/stripe/checkout-sessions",
    {
      method: "POST",
      data: {
        userId,
        planId,
        successUrl,
        cancelUrl,
      },
    }
  );
};

/**
 * Create a Stripe payment intent via API
 */
export const createPaymentIntent = async (
  userId: string,
  planId: string,
  paymentMethodId: string,
  companyId?: string
): Promise<ApiResponse<StripePaymentIntent>> => {
  // Assuming API returns the payment intent
  return await fetchPrivateApi<StripePaymentIntent>("/stripe/payment-intents", {
    method: "POST",
    data: { userId, planId, paymentMethodId, companyId },
  });
};

/**
 * Create a subscription directly via API
 */
export const createSubscription = async (
  userId: string,
  planId: string,
  paymentMethodId: string,
  companyId?: string
): Promise<
  ApiResponse<{
    subscription: Subscription;
    stripeSubscription: StripeSubscription;
  }>
> => {
  // Adjust return type based on actual API response
  return await fetchPrivateApi<{
    subscription: Subscription;
    stripeSubscription: StripeSubscription;
  }>("/subscriptions", {
    method: "POST",
    data: { userId, planId, paymentMethodId, companyId },
  });
};

/**
 * Cancel a subscription via API
 */
export const cancelSubscription = async (
  subscriptionId: string,
  cancelImmediately = false
): Promise<ApiResponse<{ stripeSubscription: StripeSubscription }>> => {
  // Adjust return type based on actual API response
  return await fetchPrivateApi<{
    stripeSubscription: StripeSubscription;
  }>(`/subscriptions/${subscriptionId}?immediately=${cancelImmediately}`, {
    method: "DELETE",
  });
};

/**
 * Resume a canceled subscription via API
 */
export const resumeSubscription = async (
  subscriptionId: string
): Promise<ApiResponse<{ stripeSubscription: StripeSubscription }>> => {
  // Adjust return type based on actual API response
  return await fetchPrivateApi<{
    stripeSubscription: StripeSubscription;
  }>(`/subscriptions/${subscriptionId}/resume`, {
    method: "POST",
  });
};

/**
 * Change subscription plan via API
 */
export const changeSubscriptionPlan = async (
  subscriptionId: string,
  newPlanId: string
): Promise<ApiResponse<{ stripeSubscription: StripeSubscription }>> => {
  // Adjust return type based on actual API response
  return await fetchPrivateApi<{
    stripeSubscription: StripeSubscription;
  }>(`/subscriptions/${subscriptionId}/plan`, {
    method: "PUT",
    data: { newPlanId },
  });
};

/**
 * Get user subscriptions via API
 */
export const getUserSubscriptions = async (
  userId: string
): Promise<ApiResponse<Subscription[]>> => {
  return await fetchPrivateApi<Subscription[]>(
    `/subscriptions?userId=${userId}`
  );
};

/**
 * Get company subscription via API
 */
export const getCompanySubscription = async (
  companyId: string
): Promise<ApiResponse<Subscription>> => {
  return await fetchPrivateApi<Subscription>(
    `/subscriptions?companyId=${companyId}`
  );
};

/**
 * Get subscription invoices via API
 */
export const getSubscriptionInvoices = async (
  subscriptionId: string
): Promise<ApiResponse<SubscriptionInvoice[]>> => {
  return await fetchPrivateApi<SubscriptionInvoice[]>(
    `/subscriptions/${subscriptionId}/invoices`
  );
};

/**
 * Get subscription plans via API (using public fetchAPI)
 */
export const getSubscriptionPlans = async (
  interval: string
): Promise<ApiResponse<SubscriptionPlan[]>> => {
  return await fetchApi<SubscriptionPlan[]>(
    `/subscriptions/plans?interval=${interval}`
  );
};

/**
 * Get payment methods for a user via API
 */
export const getUserPaymentMethods = async (
  userId: string
): Promise<ApiResponse<PaymentMethod[]>> => {
  return await fetchPrivateApi<PaymentMethod[]>(
    `/payment-methods?userId=${userId}`
  );
};

/**
 * Add a payment method for a user via API
 */
export const addPaymentMethod = async (
  userId: string,
  paymentMethodId: string,
  setAsDefault = false
): Promise<ApiResponse<PaymentMethod>> => {
  return await fetchPrivateApi<PaymentMethod>("/payment-methods", {
    method: "POST",
    data: { userId, paymentMethodId, setAsDefault },
  });
};

/**
 * Remove a payment method via API
 */
export const removePaymentMethod = async (
  paymentMethodId: string
): Promise<ApiResponse<boolean>> => {
  return await fetchPrivateApi<boolean>(`/payment-methods/${paymentMethodId}`, {
    method: "DELETE",
  });
};

/**
 * Set a payment method as default via API
 */
export const setDefaultPaymentMethod = async (
  paymentMethodId: string
): Promise<ApiResponse<boolean>> => {
  return await fetchPrivateApi<boolean>(
    `/payment-methods/${paymentMethodId}/set-default`,
    {
      method: "POST",
    }
  );
};
