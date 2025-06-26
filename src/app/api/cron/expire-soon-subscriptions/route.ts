import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { subscriptionEmailService } from "@/lib/brevo/subscription-service";

export async function GET() {
  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("*, user:users(*), plan:subscription_plans(*)")
    .eq("status", "active")
    .eq("cancel_at_period_end", false)
    .lte("current_period_end", new Date(Date.now() + 1000 * 60 * 60 * 24 * 10));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const emailResults: {
    userId: string;
    email: string;
    success: boolean;
    daysLeft: number;
  }[] = [];
  const emailErrors: {
    userId: string;
    email: string;
    error: string;
    daysLeft: number;
  }[] = [];

  for (const subscription of subscriptions) {
    const { data: updatedSubscription, error: updateError } = await supabase
      .from("subscriptions")
      .update({ status: "expiring_soon" })
      .eq("id", subscription.id);

    if (updateError) {
      console.error("Error updating subscription", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const currentPeriodEnd = new Date(subscription.current_period_end);
    const today = new Date();
    const daysLeft = Math.ceil(
      (currentPeriodEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    try {
      await subscriptionEmailService.sendExpiryWarning({
        userEmail: subscription.user.email,
        userName:
          subscription.user.first_name + " " + subscription.user.last_name,
        planName: subscription.plan.name,
        expirationDate: currentPeriodEnd.toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        renewalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
        daysLeft: daysLeft,
        supportUrl: `${process.env.NEXT_PUBLIC_APP_URL}/support`,
      });

      emailResults.push({
        userId: subscription.user_id,
        email: subscription.user.email,
        success: true,
        daysLeft: daysLeft,
      });

      console.log(
        `Eamil sent for subscription ${subscription.id} to ${subscription.user.email} (${daysLeft} days left)`
      );
    } catch (emailError) {
      console.error(
        `Error sending email to ${subscription.user.email}:`,
        emailError
      );

      emailErrors.push({
        userId: subscription.user_id,
        email: subscription.user.email,
        error:
          emailError instanceof Error ? emailError.message : String(emailError),
        daysLeft: daysLeft,
      });
    }

    console.log(
      `Subscription ${subscription.id} expiring soon for user ${subscription.user.email} (${daysLeft} days left)`
    );
  }

  return NextResponse.json({
    message: "Subscriptions expiring soon processed",
    subscriptionsProcessed: subscriptions.length,
    emailsSent: emailResults.length,
    emailErrors: emailErrors.length,
    results: {
      emailResults,
      emailErrors,
    },
  });
}
