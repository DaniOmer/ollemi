import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("*, user:users(*), plan:subscription_plans(*)")
    .eq("status", "expiring_soon")
    .eq("cancel_at_period_end", false)
    .lte("current_period_end", new Date());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  for (const subscription of subscriptions) {
    const { data: updatedSubscription, error: updateError } = await supabase
      .from("subscriptions")
      .update({ status: "expired" })
      .eq("id", subscription.id);

    if (updateError) {
      console.error("Error updating subscription", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log(`Subscription ${subscription.id} expired`);
  }

  return NextResponse.json({ message: "Subscriptions expired" });
}
