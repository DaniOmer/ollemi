import { stripe } from "@/lib/services/stripe";
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const { planId } = await request.json();

  const supabase = createRouteHandlerClient({ cookies });

  // Get the current user's company_id
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const { data: company } = await supabase
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

  const { data: updatedCompany } = await supabase
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
