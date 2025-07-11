import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(request: Request) {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      role,
      accept_terms,
      discount_code,
    } = await request.json();

    if (!email || !password || !first_name || !last_name || !accept_terms) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Try to sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
          phone,
          role,
          accept_terms,
          onboarding_completed: role === "professional" ? false : true,
        },
      },
    });

    // Check for "Email already registered" error message
    if (authError) {
      console.error("Auth signup error:", authError);

      // Check if the error is related to an existing user
      if (
        authError.message.includes("already registered") ||
        authError.message.includes("already in use") ||
        authError.message.toLowerCase().includes("email already")
      ) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: authError.message },
        { status: authError.status || 400 }
      );
    }

    // Check if user has the identities property (indicates a new user vs existing one)
    if (
      authData.user &&
      (!authData.user.identities || authData.user.identities.length === 0)
    ) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    if (!authData.user) {
      console.error("No user data returned from signup");
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Create a user in the database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        first_name: authData.user.user_metadata.first_name,
        last_name: authData.user.user_metadata.last_name,
        phone: authData.user.user_metadata.phone,
        role: authData.user.user_metadata.role,
        accept_terms: authData.user.user_metadata.accept_terms,
        onboarding_completed: authData.user.user_metadata.onboarding_completed,
      });

    if (userError) {
      console.error("User creation error:", userError, authData);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Check if the user is a professional and has a discount code
    if (discount_code && authData.user.user_metadata.role === "pro") {
      const { data: discountData, error: discountError } = await supabase
        .from("discounts")
        .select("*")
        .eq("code", discount_code)
        .single();

      if (discountError) {
        console.error("Discount code error:", discountError);
        return NextResponse.json(
          { error: "Invalid discount code" },
          { status: 400 }
        );
      }

      if (discountData.discount_expiration_date < new Date()) {
        return NextResponse.json(
          { error: "Discount code expired" },
          { status: 400 }
        );
      }

      if (discount_code === "WELCOME") {
        //  First get Basic subscription plan
        const { data: subscriptionPlanData, error: subscriptionPlanError } =
          await supabase
            .from("subscription_plans")
            .select("*")
            .eq("name", "Basic")
            .single();

        if (subscriptionPlanError) {
          console.error("Subscription plan error:", subscriptionPlanError);
          return NextResponse.json(
            { error: "Failed to get subscription plan" },
            { status: 500 }
          );
        }

        // Then create a subscription
        const { data: subscriptionData, error: subscriptionError } =
          await supabase.from("subscriptions").insert({
            user_id: authData?.user?.id,
            plan_id: subscriptionPlanData.id,
            discount_id: discountData.id,
            status: "active",
            current_period_start: new Date(),
            current_period_end: new Date(
              new Date().setFullYear(new Date().getFullYear() + 1)
            ),
            trial_start: new Date(),
            trial_end: new Date(
              new Date().setFullYear(new Date().getFullYear() + 1)
            ),
          });

        if (subscriptionError) {
          console.error("Subscription error:", subscriptionError);
          return NextResponse.json(
            { error: "Failed to create subscription" },
            { status: 500 }
          );
        }
      }
    }

    // Create a response with the user data
    const response = NextResponse.json({
      user: authData.user,
      session: authData.session,
      redirectUrl:
        role === "professional"
          ? "/auth/onboarding/business-name"
          : "/dashboard",
    });

    // Set the access token cookie if available
    if (authData.session?.access_token) {
      // Cookie pour le token d'accès - Durée de vie plus courte
      response.cookies.set({
        name: "access_token",
        value: authData.session.access_token,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 15, // 15 minutes
        sameSite: "lax",
      });

      // Cookie pour le refresh token si disponible
      if (authData.session?.refresh_token) {
        response.cookies.set({
          name: "refresh_token",
          value: authData.session.refresh_token,
          httpOnly: true,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7, // 1 week
          sameSite: "lax",
        });
      }

      // Cookie pour les informations utilisateur (pour le middleware)
      const userInfo = {
        id: authData.user.id,
        email: authData.user.email,
        role: role || "client", // Par défaut, rôle client si non défini
        onboarding_completed: role === "professional" ? false : true,
      };

      response.cookies.set({
        name: "user",
        value: JSON.stringify(userInfo),
        httpOnly: false, // Doit être false pour que le middleware puisse y accéder
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: "lax",
      });
    }

    return response;
  } catch (error) {
    console.error(
      "Signup error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "An error occurred during signup" },
      { status: 500 }
    );
  }
}

function validateEmail(email: string) {
  return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email);
}
