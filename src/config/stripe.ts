// Stripe configuration

export const STRIPE_CONFIG = {
  // API keys
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  secretKey: process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY || "",
  webhookSecret: process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET || "",

  // Currency configuration
  defaultCurrency: "eur",

  // URLs
  successUrl: `${
    process.env.NEXT_PUBLIC_BASE_URL || ""
  }/dashboard/pro/subscription/success`,
  cancelUrl: `${
    process.env.NEXT_PUBLIC_BASE_URL || ""
  }/dashboard/pro/subscription/cancel`,

  // Payment method types supported
  paymentMethodTypes: ["card"],

  // Webhook events to handle
  webhookEvents: [
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.payment_succeeded",
    "invoice.payment_failed",
    "payment_method.attached",
    "payment_method.detached",
  ],
};

// Stripe API version
export const STRIPE_API_VERSION = "2023-10-16";

// Subscription status mapping
export const STRIPE_SUBSCRIPTION_STATUS_MAP = {
  incomplete: "incomplete",
  incomplete_expired: "incomplete_expired",
  trialing: "trialing",
  active: "active",
  past_due: "past_due",
  canceled: "canceled",
  unpaid: "unpaid",
};

// Invoice status mapping
export const STRIPE_INVOICE_STATUS_MAP = {
  draft: "draft",
  open: "open",
  paid: "paid",
  uncollectible: "uncollectible",
  void: "void",
};

// Default trial period in days
export const DEFAULT_TRIAL_PERIOD_DAYS = 14;

// Metadata keys
export const METADATA_KEYS = {
  userId: "user_id",
  companyId: "company_id",
  planId: "plan_id",
};
