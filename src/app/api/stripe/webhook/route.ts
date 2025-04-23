import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { STRIPE_CONFIG } from "@/config/stripe";
import { supabase } from "@/lib/supabase/client";
import { addMonths, addYears } from "date-fns";

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
      console.error("Missing stripe-signature header");
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
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("checkout.session.completed", session);

        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("id")
          .eq("user_id", session.metadata?.userId)
          .single();

        if (companyError) {
          console.error("Company not found for checkout session:", session.id);
          return NextResponse.json(
            { error: "Company not found for checkout session" },
            { status: 400 }
          );
        }

        const { data: subscriptionData } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("company_id", companyData.id)
          .eq("status", "active")
          .single();

        if (subscriptionData) {
          console.error(
            "Subscription already exists the current user",
            session.id
          );
          return NextResponse.json(
            { error: "Subscription already exists for the current user" },
            { status: 400 }
          );
        }

        const now = new Date();
        const endDate =
          session.metadata?.interval === "month"
            ? addMonths(now, parseInt(session.metadata?.interval_count || "0"))
            : addYears(now, parseInt(session.metadata?.interval_count || "0"));

        // Format dates as ISO strings for PostgreSQL compatibility
        const current_period_start = now.toISOString();
        const current_period_end = endDate.toISOString();

        const {
          data: createdSubscriptionData,
          error: createdSubscriptionError,
        } = await supabase
          .from("subscriptions")
          .insert({
            user_id: session.metadata?.userId,
            company_id: companyData.id,
            plan_id: session.metadata?.planId,
            status: "active",
            current_period_start,
            current_period_end,
          })
          .select();

        if (createdSubscriptionError) {
          console.error(
            "Error creating subscription:",
            createdSubscriptionError
          );
          return NextResponse.json(
            { error: "Error creating subscription" },
            { status: 400 }
          );
        }

        console.log(
          "Subscription created successfully for the user : ",
          createdSubscriptionData
        );

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
