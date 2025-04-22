import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { stripe } from "@/lib/services/stripe";

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { data: userData } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: company } = await supabase
      .from("companies")
      .select("stripe_customer_id")
      .eq("id", userData.company_id)
      .single();

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case "createCheckoutSession":
        const { planId, companyId, successUrl, cancelUrl } = data;
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
            companyId: companyId,
          },
        });
        return NextResponse.json({ sessionId: session.id });

      case "createSubscription":
        const { paymentMethodId } = data;
        const subscription = await stripe.subscriptions.create({
          customer: company.stripe_customer_id,
          items: [{ price: planId }],
          payment_behavior: "default_incomplete",
          payment_settings: {
            payment_method_types: ["card"],
            save_default_payment_method: "on_subscription",
          },
          expand: ["latest_invoice.payment_intent"],
        });
        return NextResponse.json({ subscription });

      case "cancelSubscription":
        const { subscriptionId, cancelImmediately } = data;
        if (cancelImmediately) {
          await stripe.subscriptions.cancel(subscriptionId);
        } else {
          await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
          });
        }
        return NextResponse.json({ success: true });

      case "resumeSubscription":
        const { resumeSubscriptionId } = data;
        await stripe.subscriptions.update(resumeSubscriptionId, {
          cancel_at_period_end: false,
        });
        return NextResponse.json({ success: true });

      case "changePlan":
        const { currentSubscriptionId, newPlanId } = data;
        const updatedSubscription = await stripe.subscriptions.update(
          currentSubscriptionId,
          {
            items: [
              {
                id: currentSubscriptionId,
                price: newPlanId,
              },
            ],
          }
        );
        return NextResponse.json({ subscription: updatedSubscription });

      case "getPaymentMethods":
        const paymentMethods = await stripe.paymentMethods.list({
          customer: company.stripe_customer_id,
          type: "card",
        });
        return NextResponse.json({ paymentMethods });

      case "addPaymentMethod":
        const { newPaymentMethodId, setAsDefault } = data;
        const paymentMethod = await stripe.paymentMethods.attach(
          newPaymentMethodId,
          {
            customer: company.stripe_customer_id,
          }
        );

        if (setAsDefault) {
          await stripe.customers.update(company.stripe_customer_id, {
            invoice_settings: {
              default_payment_method: newPaymentMethodId,
            },
          });
        }
        return NextResponse.json({ paymentMethod });

      case "removePaymentMethod":
        const { paymentMethodToRemove } = data;
        await stripe.paymentMethods.detach(paymentMethodToRemove);
        return NextResponse.json({ success: true });

      case "setDefaultPaymentMethod":
        const { defaultPaymentMethodId } = data;
        await stripe.customers.update(company.stripe_customer_id, {
          invoice_settings: {
            default_payment_method: defaultPaymentMethodId,
          },
        });
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Stripe API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
