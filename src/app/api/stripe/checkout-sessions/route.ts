import { NextResponse } from "next/server";
import { stripe } from "@/lib/services/stripe";
import { extractToken, createAuthClient } from "@/lib/supabase/client";

export async function POST(request: Request) {
  const { planId, successUrl, cancelUrl } = await request.json();

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

  // Get the company
  const { data: companyData, error: companyError } = await supabaseWithAuth
    .from("companies")
    .select("id, name, stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  let company = companyData;

  if (companyError) {
    return NextResponse.json({ error: companyError.message }, { status: 500 });
  } else if (!company?.stripe_customer_id) {
    const customer = await stripe.customers.create({
      name: company?.name,
      email: user.email,
      metadata: {
        userId: user.id,
        companyId: company?.id,
      },
    });
    const { data: updatedCompany, error: updateError } = await supabaseWithAuth
      .from("companies")
      .update({
        stripe_customer_id: customer.id,
      })
      .eq("id", company?.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    company = updatedCompany;
  }

  // Get the subscription plan
  const { data: plan, error: planError } = await supabaseWithAuth
    .from("subscription_plans")
    .select("id, stripe_price_id, interval, interval_count")
    .eq("id", planId)
    .single();

  if (planError) {
    return NextResponse.json({ error: planError.message }, { status: 500 });
  }

  // Create the checkout session
  const session = await stripe.checkout.sessions.create({
    customer: company?.stripe_customer_id,
    payment_method_types: ["card"],
    line_items: [
      {
        price: plan?.stripe_price_id,
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: user.id,
      companyId: company?.id,
      planId: plan?.id,
      interval: plan?.interval,
      interval_count: plan?.interval_count,
    },
  });
  return NextResponse.json({
    ...session,
  });
}
