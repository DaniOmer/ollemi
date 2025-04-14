import Stripe from "stripe";
import { STRIPE_CONFIG, STRIPE_API_VERSION } from "@/config/stripe";

// Initialize Stripe with proper typing
export const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: "2025-03-31.basil", // Use the latest API version
  typescript: true,
});

// Type definitions for Stripe objects
export type StripeSubscription = Stripe.Subscription;
export type StripePrice = Stripe.Price;
export type StripeCustomer = Stripe.Customer;
export type StripePaymentMethod = Stripe.PaymentMethod;
export type StripeInvoice = Stripe.Invoice;
export type StripeEvent = Stripe.Event;
export type StripeCheckoutSession = Stripe.Checkout.Session;
export type StripePaymentIntent = Stripe.PaymentIntent;

// Helper functions for Stripe
export const formatAmountForStripe = (
  amount: number,
  currency: string
): number => {
  const numberFormat = new Intl.NumberFormat(["en-US"], {
    style: "currency",
    currency: currency,
    currencyDisplay: "symbol",
  });
  const parts = numberFormat.formatToParts(amount);
  let zeroDecimalCurrency = true;
  for (const part of parts) {
    if (part.type === "decimal") {
      zeroDecimalCurrency = false;
    }
  }
  return zeroDecimalCurrency ? amount : Math.round(amount * 100);
};

export const formatAmountFromStripe = (
  amount: number,
  currency: string
): number => {
  const zeroDecimalCurrencies = [
    "bif",
    "clp",
    "djf",
    "gnf",
    "jpy",
    "kmf",
    "krw",
    "mga",
    "pyg",
    "rwf",
    "vnd",
    "vuv",
    "xaf",
    "xof",
    "xpf",
  ];
  return zeroDecimalCurrencies.includes(currency.toLowerCase())
    ? amount
    : amount / 100;
};
