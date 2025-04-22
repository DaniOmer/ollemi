import { NextResponse } from "next/server";
import { stripe } from "@/lib/services/stripe";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (companyError) {
    return NextResponse.json({ error: companyError.message }, { status: 500 });
  }

  const { planId, successUrl, cancelUrl } = await request.json();
  const session = await stripe.checkout.sessions.create({
    customer: company.stripe_customer_id,
    payment_method_types: ["card"],
    line_items: [
      {
        price: planId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: user.id,
      companyId: company.id,
    },
  });
  return NextResponse.json({ sessionId: session.id });
}
