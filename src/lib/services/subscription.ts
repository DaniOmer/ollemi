import Stripe from "stripe";
import {
  PaymentMethod,
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
  SubscriptionInvoice,
  InvoiceStatus,
} from "@/types";
import { STRIPE_CONFIG, METADATA_KEYS } from "@/config/stripe";
import { createServiceClient } from "@/lib/supabase/service";
import {
  stripe,
  StripeSubscription,
  StripeInvoice,
  StripePaymentMethod,
  StripeEvent,
  formatAmountForStripe,
} from "@/lib/services/stripe";

// Helper function to get Supabase client
const getSupabaseClient = () => {
  return createServiceClient();
};

/**
 * Create a Stripe customer for a user
 */
export const createStripeCustomer = async (
  userId: string,
  email: string,
  name?: string
) => {
  try {
    // Check if customer already exists
    const supabase = await getSupabaseClient();
    const { data: userData } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    if (userData?.stripe_customer_id) {
      return userData.stripe_customer_id;
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name: name || email,
      metadata: {
        [METADATA_KEYS.userId]: userId,
      },
    });

    // Update user with Stripe customer ID
    await supabase
      .from("users")
      .update({ stripe_customer_id: customer.id })
      .eq("id", userId);

    return customer.id;
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    throw error;
  }
};

/**
 * Get or create a Stripe customer for a user
 */
export const getOrCreateStripeCustomer = async (userId: string) => {
  try {
    const supabase = await getSupabaseClient();
    const { data: user } = await supabase
      .from("users")
      .select("email, first_name, last_name, stripe_customer_id")
      .eq("id", userId)
      .single();

    if (!user) {
      throw new Error("User not found");
    }

    if (user.stripe_customer_id) {
      return user.stripe_customer_id;
    }

    const name =
      user.first_name && user.last_name
        ? `${user.first_name} ${user.last_name}`
        : undefined;

    return await createStripeCustomer(userId, user.email, name);
  } catch (error) {
    console.error("Error getting or creating Stripe customer:", error);
    throw error;
  }
};

/**
 * Create a Stripe checkout session for subscription
 */
export const createCheckoutSession = async (
  userId: string,
  planId: string,
  companyId?: string,
  successUrl?: string,
  cancelUrl?: string
) => {
  try {
    // Get customer ID
    const customerId = await getOrCreateStripeCustomer(userId);

    // Get subscription plan
    const supabase = await getSupabaseClient();
    const { data: plan } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (!plan) {
      throw new Error("Subscription plan not found");
    }

    // Create or get Stripe price
    let priceId = plan.stripe_price_id;
    if (!priceId) {
      const price = await stripe.prices.create({
        unit_amount: Math.round(plan.price * 100), // Convert to cents
        currency: plan.currency,
        recurring: {
          interval: plan.interval as Stripe.PriceRecurringInterval,
          interval_count: plan.interval_count,
        },
        product_data: {
          name: plan.name,
          description: plan.description || undefined,
          metadata: {
            [METADATA_KEYS.planId]: plan.id,
          },
        },
        metadata: {
          [METADATA_KEYS.planId]: plan.id,
        },
      });

      // Update plan with Stripe price ID
      await supabase
        .from("subscription_plans")
        .update({ stripe_price_id: price.id })
        .eq("id", planId);

      priceId = price.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types:
        STRIPE_CONFIG.paymentMethodTypes as Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl || STRIPE_CONFIG.successUrl,
      cancel_url: cancelUrl || STRIPE_CONFIG.cancelUrl,
      metadata: {
        [METADATA_KEYS.userId]: userId,
        [METADATA_KEYS.planId]: planId,
        ...(companyId && { [METADATA_KEYS.companyId]: companyId }),
      },
      subscription_data: {
        metadata: {
          [METADATA_KEYS.userId]: userId,
          [METADATA_KEYS.planId]: planId,
          ...(companyId && { [METADATA_KEYS.companyId]: companyId }),
        },
        trial_period_days: plan.trial_period_days,
      },
    });

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
};

/**
 * Create a Stripe payment intent for subscription
 */
export const createPaymentIntent = async (
  userId: string,
  planId: string,
  paymentMethodId: string,
  companyId?: string
) => {
  try {
    // Get customer ID
    const customerId = await getOrCreateStripeCustomer(userId);

    // Get subscription plan
    const supabase = await getSupabaseClient();
    const { data: plan } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (!plan) {
      throw new Error("Subscription plan not found");
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(plan.price * 100), // Convert to cents
      currency: plan.currency,
      customer: customerId,
      payment_method: paymentMethodId,
      confirm: true,
      metadata: {
        [METADATA_KEYS.userId]: userId,
        [METADATA_KEYS.planId]: planId,
        ...(companyId && { [METADATA_KEYS.companyId]: companyId }),
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};

/**
 * Create a subscription directly (without checkout)
 */
export const createSubscription = async (
  userId: string,
  planId: string,
  paymentMethodId: string,
  companyId?: string
) => {
  try {
    // Get customer ID
    const customerId = await getOrCreateStripeCustomer(userId);

    // Get subscription plan
    const supabase = await getSupabaseClient();
    const { data: plan } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (!plan) {
      throw new Error("Subscription plan not found");
    }

    // Create or get Stripe price
    let priceId = plan.stripe_price_id;
    if (!priceId) {
      const price = await stripe.prices.create({
        unit_amount: Math.round(plan.price * 100), // Convert to cents
        currency: plan.currency,
        recurring: {
          interval: plan.interval as Stripe.PriceRecurringInterval,
          interval_count: plan.interval_count,
        },
        product_data: {
          name: plan.name,
          description: plan.description || undefined,
          metadata: {
            [METADATA_KEYS.planId]: plan.id,
          },
        },
        metadata: {
          [METADATA_KEYS.planId]: plan.id,
        },
      });

      // Update plan with Stripe price ID
      await supabase
        .from("subscription_plans")
        .update({ stripe_price_id: price.id })
        .eq("id", planId);

      priceId = price.id;
    }

    // Set payment method as default for customer
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId,
        },
      ],
      default_payment_method: paymentMethodId,
      metadata: {
        [METADATA_KEYS.userId]: userId,
        [METADATA_KEYS.planId]: planId,
        ...(companyId && { [METADATA_KEYS.companyId]: companyId }),
      },
      trial_period_days: plan.trial_period_days,
      expand: ["latest_invoice.payment_intent"],
    });

    // Save subscription to database
    const { data: paymentProvider } = await supabase
      .from("payment_providers")
      .select("id")
      .eq("name", "stripe")
      .single();

    if (!paymentProvider) {
      throw new Error("Payment provider not found");
    }

    // Get payment method details
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    // Save payment method to database
    const { data: savedPaymentMethod } = await supabase
      .from("payment_methods")
      .insert({
        user_id: userId,
        provider_id: paymentProvider.id,
        provider_payment_method_id: paymentMethod.id,
        is_default: true,
        type: paymentMethod.type,
        last_four: paymentMethod.card?.last4,
        expiry_month: paymentMethod.card?.exp_month,
        expiry_year: paymentMethod.card?.exp_year,
        billing_details: paymentMethod.billing_details,
      })
      .select()
      .single();

    // Save subscription to database
    const { data: savedSubscription } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        company_id: companyId,
        plan_id: planId,
        payment_method_id: savedPaymentMethod?.id,
        provider_id: paymentProvider.id,
        provider_subscription_id: subscription.id,
        status: subscription.status as SubscriptionStatus,
        current_period_start: new Date(
          subscription.current_period_start * 1000
        ).toISOString(),
        current_period_end: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        trial_start: subscription.trial_start
          ? new Date(subscription.trial_start * 1000).toISOString()
          : null,
        trial_end: subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null,
      })
      .select()
      .single();

    // Update company with subscription ID if company ID is provided
    if (companyId && savedSubscription) {
      await supabase
        .from("companies")
        .update({ subscription_id: savedSubscription.id })
        .eq("id", companyId);
    }

    return {
      subscription: savedSubscription,
      stripeSubscription: subscription,
    };
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
};

/**
 * Cancel a subscription
 */
export const cancelSubscription = async (
  subscriptionId: string,
  cancelImmediately = false
) => {
  try {
    const supabase = await getSupabaseClient();
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("provider_subscription_id")
      .eq("id", subscriptionId)
      .single();

    if (!subscription?.provider_subscription_id) {
      throw new Error("Subscription not found");
    }

    let stripeSubscription;
    if (cancelImmediately) {
      // Cancel immediately
      stripeSubscription = await stripe.subscriptions.cancel(
        subscription.provider_subscription_id
      );
    } else {
      // Cancel at period end
      stripeSubscription = await stripe.subscriptions.update(
        subscription.provider_subscription_id,
        { cancel_at_period_end: true }
      );
    }

    // Update subscription in database
    await supabase
      .from("subscriptions")
      .update({
        status: stripeSubscription.status as SubscriptionStatus,
        cancel_at_period_end: stripeSubscription.cancel_at_period_end,
        canceled_at: stripeSubscription.canceled_at
          ? new Date(stripeSubscription.canceled_at * 1000).toISOString()
          : null,
      })
      .eq("id", subscriptionId);

    return stripeSubscription;
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }
};

/**
 * Resume a canceled subscription
 */
export const resumeSubscription = async (subscriptionId: string) => {
  try {
    const supabase = await getSupabaseClient();
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("provider_subscription_id")
      .eq("id", subscriptionId)
      .single();

    if (!subscription?.provider_subscription_id) {
      throw new Error("Subscription not found");
    }

    // Resume subscription by removing cancel_at_period_end
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.provider_subscription_id,
      { cancel_at_period_end: false }
    );

    // Update subscription in database
    await supabase
      .from("subscriptions")
      .update({
        status: stripeSubscription.status as SubscriptionStatus,
        cancel_at_period_end: stripeSubscription.cancel_at_period_end,
        canceled_at: null,
      })
      .eq("id", subscriptionId);

    return stripeSubscription;
  } catch (error) {
    console.error("Error resuming subscription:", error);
    throw error;
  }
};

/**
 * Change subscription plan
 */
export const changeSubscriptionPlan = async (
  subscriptionId: string,
  newPlanId: string
) => {
  try {
    const supabase = await getSupabaseClient();

    // Get current subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("provider_subscription_id")
      .eq("id", subscriptionId)
      .single();

    if (!subscription?.provider_subscription_id) {
      throw new Error("Subscription not found");
    }

    // Get new plan
    const { data: plan } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", newPlanId)
      .single();

    if (!plan) {
      throw new Error("Subscription plan not found");
    }

    // Create or get Stripe price
    let priceId = plan.stripe_price_id;
    if (!priceId) {
      const price = await stripe.prices.create({
        unit_amount: Math.round(plan.price * 100), // Convert to cents
        currency: plan.currency,
        recurring: {
          interval: plan.interval as Stripe.PriceRecurringInterval,
          interval_count: plan.interval_count,
        },
        product_data: {
          name: plan.name,
          description: plan.description || undefined,
          metadata: {
            [METADATA_KEYS.planId]: plan.id,
          },
        },
        metadata: {
          [METADATA_KEYS.planId]: plan.id,
        },
      });

      // Update plan with Stripe price ID
      await supabase
        .from("subscription_plans")
        .update({ stripe_price_id: price.id })
        .eq("id", newPlanId);

      priceId = price.id;
    }

    // Get current subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.provider_subscription_id
    );

    // Update subscription with new price
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.provider_subscription_id,
      {
        items: [
          {
            id: stripeSubscription.items.data[0].id,
            price: priceId,
          },
        ],
        metadata: {
          ...stripeSubscription.metadata,
          [METADATA_KEYS.planId]: newPlanId,
        },
        proration_behavior: "create_prorations",
      }
    );

    // Update subscription in database
    await supabase
      .from("subscriptions")
      .update({
        plan_id: newPlanId,
        status: updatedSubscription.status as SubscriptionStatus,
        current_period_start: new Date(
          updatedSubscription.current_period_start * 1000
        ).toISOString(),
        current_period_end: new Date(
          updatedSubscription.current_period_end * 1000
        ).toISOString(),
      })
      .eq("id", subscriptionId);

    return updatedSubscription;
  } catch (error) {
    console.error("Error changing subscription plan:", error);
    throw error;
  }
};

/**
 * Get user subscriptions
 */
export const getUserSubscriptions = async (userId: string) => {
  try {
    const supabase = await getSupabaseClient();
    const { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select(
        `
        *,
        plan:plan_id(*)
      `
      )
      .eq("user_id", userId);

    if (error) throw error;
    return subscriptions;
  } catch (error) {
    console.error("Error getting user subscriptions:", error);
    throw error;
  }
};

/**
 * Get company subscription
 */
export const getCompanySubscription = async (companyId: string) => {
  try {
    const supabase = await getSupabaseClient();
    const { data: company } = await supabase
      .from("companies")
      .select("subscription_id")
      .eq("id", companyId)
      .single();

    if (!company?.subscription_id) {
      return null;
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select(
        `
        *,
        plan:plan_id(*),
        payment_method:payment_method_id(*)
      `
      )
      .eq("id", company.subscription_id)
      .single();

    return subscription;
  } catch (error) {
    console.error("Error getting company subscription:", error);
    throw error;
  }
};

/**
 * Get subscription invoices
 */
export const getSubscriptionInvoices = async (subscriptionId: string) => {
  try {
    const supabase = await getSupabaseClient();
    const { data: invoices, error } = await supabase
      .from("subscription_invoices")
      .select("*")
      .eq("subscription_id", subscriptionId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return invoices;
  } catch (error) {
    console.error("Error getting subscription invoices:", error);
    throw error;
  }
};

/**
 * Get subscription plans
 */
export const getSubscriptionPlans = async () => {
  try {
    const supabase = await getSupabaseClient();
    const { data: plans, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true });

    if (error) throw error;
    return plans;
  } catch (error) {
    console.error("Error getting subscription plans:", error);
    throw error;
  }
};

/**
 * Get payment methods for a user
 */
export const getUserPaymentMethods = async (userId: string) => {
  try {
    const supabase = await getSupabaseClient();
    const { data: paymentMethods, error } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false });

    if (error) throw error;
    return paymentMethods;
  } catch (error) {
    console.error("Error getting user payment methods:", error);
    throw error;
  }
};

/**
 * Add a payment method for a user
 */
export const addPaymentMethod = async (
  userId: string,
  paymentMethodId: string,
  setAsDefault = false
) => {
  try {
    // Get customer ID
    const customerId = await getOrCreateStripeCustomer(userId);

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default if requested
    if (setAsDefault) {
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Get payment method details
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    // Save payment method to database
    const supabase = await getSupabaseClient();
    const { data: paymentProvider } = await supabase
      .from("payment_providers")
      .select("id")
      .eq("name", "stripe")
      .single();

    if (!paymentProvider) {
      throw new Error("Payment provider not found");
    }

    // If setting as default, update all existing payment methods to not be default
    if (setAsDefault) {
      await supabase
        .from("payment_methods")
        .update({ is_default: false })
        .eq("user_id", userId);
    }

    // Save payment method to database
    const { data: savedPaymentMethod } = await supabase
      .from("payment_methods")
      .insert({
        user_id: userId,
        provider_id: paymentProvider.id,
        provider_payment_method_id: paymentMethod.id,
        is_default: setAsDefault,
        type: paymentMethod.type,
        last_four: paymentMethod.card?.last4,
        expiry_month: paymentMethod.card?.exp_month,
        expiry_year: paymentMethod.card?.exp_year,
        billing_details: paymentMethod.billing_details,
      })
      .select()
      .single();

    return savedPaymentMethod;
  } catch (error) {
    console.error("Error adding payment method:", error);
    throw error;
  }
};

/**
 * Remove a payment method
 */
export const removePaymentMethod = async (paymentMethodId: string) => {
  try {
    const supabase = await getSupabaseClient();
    const { data: paymentMethod } = await supabase
      .from("payment_methods")
      .select("provider_payment_method_id, user_id, is_default")
      .eq("id", paymentMethodId)
      .single();

    if (!paymentMethod) {
      throw new Error("Payment method not found");
    }

    // Check if payment method is being used by any active subscriptions
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("payment_method_id", paymentMethodId)
      .eq("status", "active")
      .limit(1);

    if (subscriptions && subscriptions.length > 0) {
      throw new Error("Payment method is being used by an active subscription");
    }

    // Detach payment method from Stripe
    await stripe.paymentMethods.detach(
      paymentMethod.provider_payment_method_id
    );

    // Delete payment method from database
    await supabase.from("payment_methods").delete().eq("id", paymentMethodId);

    // If this was the default payment method, set another one as default
    if (paymentMethod.is_default) {
      const { data: otherPaymentMethods } = await supabase
        .from("payment_methods")
        .select("id")
        .eq("user_id", paymentMethod.user_id)
        .limit(1);

      if (otherPaymentMethods && otherPaymentMethods.length > 0) {
        await supabase
          .from("payment_methods")
          .update({ is_default: true })
          .eq("id", otherPaymentMethods[0].id);

        // Update Stripe customer default payment method
        const { data: user } = await supabase
          .from("users")
          .select("stripe_customer_id")
          .eq("id", paymentMethod.user_id)
          .single();

        if (user?.stripe_customer_id) {
          const { data: updatedPaymentMethod } = await supabase
            .from("payment_methods")
            .select("provider_payment_method_id")
            .eq("id", otherPaymentMethods[0].id)
            .single();

          if (updatedPaymentMethod) {
            await stripe.customers.update(user.stripe_customer_id, {
              invoice_settings: {
                default_payment_method:
                  updatedPaymentMethod.provider_payment_method_id,
              },
            });
          }
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error removing payment method:", error);
    throw error;
  }
};

/**
 * Set a payment method as default
 */
export const setDefaultPaymentMethod = async (paymentMethodId: string) => {
  try {
    const supabase = await getSupabaseClient();
    const { data: paymentMethod } = await supabase
      .from("payment_methods")
      .select("provider_payment_method_id, user_id")
      .eq("id", paymentMethodId)
      .single();

    if (!paymentMethod) {
      throw new Error("Payment method not found");
    }

    // Update Stripe customer default payment method
    const { data: user } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", paymentMethod.user_id)
      .single();

    if (user?.stripe_customer_id) {
      await stripe.customers.update(user.stripe_customer_id, {
        invoice_settings: {
          default_payment_method: paymentMethod.provider_payment_method_id,
        },
      });
    }

    // Update all payment methods to not be default
    await supabase
      .from("payment_methods")
      .update({ is_default: false })
      .eq("user_id", paymentMethod.user_id);

    // Set this payment method as default
    await supabase
      .from("payment_methods")
      .update({ is_default: true })
      .eq("id", paymentMethodId);

    return { success: true };
  } catch (error) {
    console.error("Error setting default payment method:", error);
    throw error;
  }
};

/**
 * Handle Stripe webhook events
 */
export const handleStripeWebhook = async (event: Stripe.Event) => {
  try {
    const supabase = await getSupabaseClient();

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        // Get user ID from metadata
        const userId = subscription.metadata?.[METADATA_KEYS.userId];
        const planId = subscription.metadata?.[METADATA_KEYS.planId];
        const companyId = subscription.metadata?.[METADATA_KEYS.companyId];

        if (!userId || !planId) {
          console.error("Missing metadata in subscription:", subscription.id);
          return { success: false, error: "Missing metadata" };
        }

        // Get payment provider ID
        const { data: paymentProvider } = await supabase
          .from("payment_providers")
          .select("id")
          .eq("name", "stripe")
          .single();

        if (!paymentProvider) {
          console.error("Payment provider not found");
          return { success: false, error: "Payment provider not found" };
        }

        // Check if subscription exists in database
        const { data: existingSubscription } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("provider_subscription_id", subscription.id)
          .single();

        // Get default payment method
        let paymentMethodId = null;
        if (subscription.default_payment_method) {
          const pmId =
            typeof subscription.default_payment_method === "string"
              ? subscription.default_payment_method
              : subscription.default_payment_method.id;

          const { data: paymentMethod } = await supabase
            .from("payment_methods")
            .select("id")
            .eq("provider_payment_method_id", pmId)
            .single();

          paymentMethodId = paymentMethod?.id;
        }

        if (existingSubscription) {
          // Update existing subscription
          await supabase
            .from("subscriptions")
            .update({
              status: subscription.status as SubscriptionStatus,
              current_period_start: new Date(
                subscription.current_period_start * 1000
              ).toISOString(),
              current_period_end: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              canceled_at: subscription.canceled_at
                ? new Date(subscription.canceled_at * 1000).toISOString()
                : null,
              trial_start: subscription.trial_start
                ? new Date(subscription.trial_start * 1000).toISOString()
                : null,
              trial_end: subscription.trial_end
                ? new Date(subscription.trial_end * 1000).toISOString()
                : null,
              payment_method_id: paymentMethodId,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingSubscription.id);
        } else {
          // Create new subscription record
          const { data: newSubscription } = await supabase
            .from("subscriptions")
            .insert({
              user_id: userId,
              company_id: companyId || null,
              plan_id: planId,
              payment_method_id: paymentMethodId,
              provider_id: paymentProvider.id,
              provider_subscription_id: subscription.id,
              status: subscription.status as SubscriptionStatus,
              current_period_start: new Date(
                subscription.current_period_start * 1000
              ).toISOString(),
              current_period_end: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              trial_start: subscription.trial_start
                ? new Date(subscription.trial_start * 1000).toISOString()
                : null,
              trial_end: subscription.trial_end
                ? new Date(subscription.trial_end * 1000).toISOString()
                : null,
            })
            .select()
            .single();

          // Update company with subscription ID if company ID is provided
          if (companyId && newSubscription) {
            await supabase
              .from("companies")
              .update({ subscription_id: newSubscription.id })
              .eq("id", companyId);
          }
        }

        return { success: true };
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Update subscription status in database
        await supabase
          .from("subscriptions")
          .update({
            status: subscription.status as SubscriptionStatus,
            canceled_at: subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq("provider_subscription_id", subscription.id);

        return { success: true };
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;

        if (!invoice.subscription) {
          return { success: true }; // Not a subscription invoice
        }

        // Get subscription from database
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("provider_subscription_id", invoice.subscription)
          .single();

        if (!subscription) {
          console.error("Subscription not found for invoice:", invoice.id);
          return { success: false, error: "Subscription not found" };
        }

        // Save invoice to database
        await supabase.from("subscription_invoices").insert({
          subscription_id: subscription.id,
          provider_invoice_id: invoice.id,
          amount: invoice.total / 100, // Convert from cents
          currency: invoice.currency,
          status: invoice.status as InvoiceStatus,
          invoice_url: invoice.hosted_invoice_url,
          invoice_pdf: invoice.invoice_pdf,
          billing_reason: invoice.billing_reason,
        });

        return { success: true };
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        if (!invoice.subscription) {
          return { success: true }; // Not a subscription invoice
        }

        // Get subscription from database
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("provider_subscription_id", invoice.subscription)
          .single();

        if (!subscription) {
          console.error("Subscription not found for invoice:", invoice.id);
          return { success: false, error: "Subscription not found" };
        }

        // Save invoice to database
        await supabase.from("subscription_invoices").insert({
          subscription_id: subscription.id,
          provider_invoice_id: invoice.id,
          amount: invoice.total / 100, // Convert from cents
          currency: invoice.currency,
          status: invoice.status as InvoiceStatus,
          invoice_url: invoice.hosted_invoice_url,
          invoice_pdf: invoice.invoice_pdf,
          billing_reason: invoice.billing_reason,
        });

        return { success: true };
      }

      case "payment_method.attached": {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;

        // Get customer
        if (!paymentMethod.customer) {
          return { success: true }; // Not attached to a customer
        }

        // Get user from customer ID
        const { data: user } = await supabase
          .from("users")
          .select("id")
          .eq("stripe_customer_id", paymentMethod.customer)
          .single();

        if (!user) {
          console.error("User not found for customer:", paymentMethod.customer);
          return { success: false, error: "User not found" };
        }

        // Check if payment method already exists
        const { data: existingPaymentMethod } = await supabase
          .from("payment_methods")
          .select("id")
          .eq("provider_payment_method_id", paymentMethod.id)
          .single();

        if (existingPaymentMethod) {
          return { success: true }; // Already exists
        }

        // Get payment provider ID
        const { data: paymentProvider } = await supabase
          .from("payment_providers")
          .select("id")
          .eq("name", "stripe")
          .single();

        if (!paymentProvider) {
          console.error("Payment provider not found");
          return { success: false, error: "Payment provider not found" };
        }

        // Save payment method to database
        await supabase.from("payment_methods").insert({
          user_id: user.id,
          provider_id: paymentProvider.id,
          provider_payment_method_id: paymentMethod.id,
          is_default: false,
          type: paymentMethod.type,
          last_four: paymentMethod.card?.last4,
          expiry_month: paymentMethod.card?.exp_month,
          expiry_year: paymentMethod.card?.exp_year,
          billing_details: paymentMethod.billing_details,
        });

        return { success: true };
      }

      case "payment_method.detached": {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;

        // Delete payment method from database
        await supabase
          .from("payment_methods")
          .delete()
          .eq("provider_payment_method_id", paymentMethod.id);

        return { success: true };
      }

      default:
        return { success: true }; // Ignore other events
    }
  } catch (error) {
    console.error("Error handling Stripe webhook:", error);
    throw error;
  }
};
