import { NextResponse } from "next/server";

import { stripe } from "@/lib/services/stripe";
import { supabase } from "@/lib/supabase/client";
import { subscriptionPlans } from "@/data/subscription_plans";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const interval = searchParams.get("interval");

    const { data: plans, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .eq("interval", interval);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Create subscription plans in Supabase
  const { data, error } = await supabase
    .from("subscription_plans")
    .insert(subscriptionPlans)
    .select();

  if (error) {
    console.error("Error creating subscription plans:", error);
    return NextResponse.json(
      { error: "Error creating subscription plans" },
      { status: 500 }
    );
  } else {
    console.log("Subscription plans created successfully");

    // Create Stripe products and prices
    const updatedPlans = [];
    for (const plan of data) {
      console.log("Creating Stripe product and price for:", plan.name);
      const stripeProduct = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: {
          subscription_plan_id: plan.id,
          subscription_plan_name: plan.name,
        },
      });
      console.log("Stripe product created successfully:");

      // Create Stripe price
      console.log("Creating Stripe price for:", plan.name);
      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: plan.price,
        currency: "xof",
        metadata: {
          subscription_plan_id: plan.id,
          subscription_plan_name: plan.name,
          stripe_product_id: stripeProduct.id,
        },
      });
      console.log("Stripe price created successfully:");

      // Update the subscription plan with the stripe product and price ids
      console.log(
        "Updating subscription plan with Stripe product and price ids...",
        plan.id
      );
      const { data: updatedPlan, error: updateError } = await supabase
        .from("subscription_plans")
        .update({
          stripe_product_id: stripeProduct.id,
          stripe_price_id: stripePrice.id,
        })
        .eq("id", plan.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating subscription plan:", updateError);
        return NextResponse.json(
          { error: "Error updating subscription plan" },
          { status: 500 }
        );
      }
      updatedPlans.push(updatedPlan);
    }
    return NextResponse.json(updatedPlans);
  }
}
