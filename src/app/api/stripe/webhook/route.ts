import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { STRIPE_CONFIG, METADATA_KEYS } from "@/config/stripe";
import { createServiceClient } from "@/lib/supabase/service";
import { SubscriptionStatus, InvoiceStatus } from "@/types";

// Initialize Stripe
const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: "2025-03-31.basil",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature") as string;

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_CONFIG.webhookSecret
      );
    } catch (err: any) {
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    const supabase = createServiceClient();

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
          return NextResponse.json(
            { error: "Missing metadata in subscription" },
            { status: 400 }
          );
        }

        // Get payment provider ID
        const { data: paymentProvider } = await supabase
          .from("payment_providers")
          .select("id")
          .eq("name", "stripe")
          .single();

        if (!paymentProvider) {
          console.error("Payment provider not found");
          return NextResponse.json(
            { error: "Payment provider not found" },
            { status: 400 }
          );
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

        break;
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

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;

        if (!invoice.subscription) {
          break; // Not a subscription invoice
        }

        // Get subscription from database
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("provider_subscription_id", invoice.subscription)
          .single();

        if (!subscription) {
          console.error("Subscription not found for invoice:", invoice.id);
          return NextResponse.json(
            { error: "Subscription not found for invoice" },
            { status: 400 }
          );
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

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        if (!invoice.subscription) {
          break; // Not a subscription invoice
        }

        // Get subscription from database
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("provider_subscription_id", invoice.subscription)
          .single();

        if (!subscription) {
          console.error("Subscription not found for invoice:", invoice.id);
          return NextResponse.json(
            { error: "Subscription not found for invoice" },
            { status: 400 }
          );
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

        break;
      }

      default:
        // Unhandled event type
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
