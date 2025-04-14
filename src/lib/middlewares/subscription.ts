import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Check if a user's subscription allows access to a feature
 */
export async function checkSubscriptionFeature(
  userId: string,
  feature: string,
  value?: number
): Promise<boolean> {
  try {
    const supabase = createServiceClient();

    // Get the user's active subscription
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select(
        `
        subscription_plans:plan_id (
          features
        )
      `
      )
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (error || !subscription) {
      // No active subscription
      return false;
    }

    const features = subscription.subscription_plans?.features;

    if (!features || !features[feature]) {
      // Feature not defined in the subscription plan
      return false;
    }

    // If value is provided, check if the subscription allows that value
    if (value !== undefined) {
      const featureValue = features[feature];

      // -1 means unlimited
      if (featureValue === -1) {
        return true;
      }

      // Check if the value is within the limit
      return value <= featureValue;
    }

    // Feature exists and no value check needed
    return true;
  } catch (error) {
    console.error("Error checking subscription feature:", error);
    return false;
  }
}

/**
 * Count the current usage of a feature for a user
 */
export async function countFeatureUsage(
  userId: string,
  feature: string
): Promise<number> {
  try {
    const supabase = createServiceClient();

    // Get count based on the feature
    switch (feature) {
      case "appointments": {
        // Count appointments in the current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const { count, error } = await supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("professional_id", userId)
          .gte("start_time", startOfMonth.toISOString())
          .lte("start_time", endOfMonth.toISOString());

        if (error) throw error;

        return count || 0;
      }

      case "services": {
        // Count active services
        const { count, error } = await supabase
          .from("services")
          .select("*", { count: "exact", head: true })
          .eq("professional_id", userId)
          .eq("is_active", true);

        if (error) throw error;

        return count || 0;
      }

      default:
        return 0;
    }
  } catch (error) {
    console.error("Error counting feature usage:", error);
    return 0;
  }
}

/**
 * Check if a user can use a feature based on their subscription
 */
export async function canUseFeature(
  userId: string,
  feature: string
): Promise<boolean> {
  try {
    // Check if the subscription includes this feature
    const hasFeature = await checkSubscriptionFeature(userId, feature);

    if (!hasFeature) {
      return false;
    }

    // For boolean features like "featured", no need to check usage
    if (["featured"].includes(feature)) {
      return true;
    }

    // For countable features, check if the user has reached their limit
    const currentUsage = await countFeatureUsage(userId, feature);
    return await checkSubscriptionFeature(userId, feature, currentUsage + 1);
  } catch (error) {
    console.error("Error checking if user can use feature:", error);
    return false;
  }
}

/**
 * Middleware to check subscription status before allowing access to certain routes
 */
export async function subscriptionMiddleware(
  req: NextRequest,
  feature?: string
) {
  try {
    const supabase = createServiceClient();

    // Extract user ID from session
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If no specific feature is required, just check if user has an active subscription
    if (!feature) {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: "Subscription required" },
          { status: 403 }
        );
      }

      return NextResponse.next();
    }

    // Check if the user can use the specific feature
    const canUse = await canUseFeature(user.id, feature);

    if (!canUse) {
      return NextResponse.json(
        {
          error: "Subscription limit reached",
          feature: feature,
        },
        { status: 403 }
      );
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Error in subscription middleware:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
