import { stripe } from "@/lib/services/stripe";
import { NextRequest, NextResponse } from "next/server";
import { createAuthClient, extractToken } from "@/lib/supabase/client";

export async function POST(request: NextRequest) {
  const { planId } = await request.json();

  const token = extractToken(request);
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabaseWithAuth = createAuthClient(token);

  // Get the current user's company_id
  const {
    data: { user },
  } = await supabaseWithAuth.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const { data: company } = await supabaseWithAuth
    .from("companies")
    .select("id, stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  let stripeCustomerId = company.stripe_customer_id;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user?.email,
    });
    stripeCustomerId = customer.id;
  }

  const { data: updatedCompany } = await supabaseWithAuth
    .from("companies")
    .update({ stripe_customer_id: stripeCustomerId })
    .eq("id", company.id)
    .single();

  if (!updatedCompany) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const subscription = await stripe.subscriptions.create({
    customer: stripeCustomerId,
    items: [{ price: planId }],
  });

  return NextResponse.json({ subscription });
}

// Get all subscriptions for a user or active subscription if status provided
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const token = extractToken(request);
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabaseWithAuth = createAuthClient(token);

  const {
    data: { user },
  } = await supabaseWithAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  let data = null;
  if (status) {
    const { data: subscriptions, error: subscriptionError } =
      await supabaseWithAuth
        .from("subscriptions")
        .select("*, subscription_plans(*)")
        .eq("user_id", user.id)
        .eq("status", status)
        .single();

    if (subscriptionError) {
      return NextResponse.json(
        { error: subscriptionError.message },
        { status: 500 }
      );
    }
    data = subscriptions;
  } else {
    const { data: subscriptions, error: subscriptionError } =
      await supabaseWithAuth
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (subscriptionError) {
      return NextResponse.json(
        { error: subscriptionError.message },
        { status: 500 }
      );
    }
    data = subscriptions;
  }

  return NextResponse.json(data);
}
