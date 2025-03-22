import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, phone, role, acceptTerms } =
      await request.json();

    if (!email || !password || !firstName || !lastName || !acceptTerms) {
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

    // First, try to sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
          role,
          accept_terms: acceptTerms,
        },
      },
    });

    if (authError) {
      console.error("Auth signup error:", authError);
      return NextResponse.json(
        { error: authError.message },
        { status: authError.status || 400 }
      );
    }

    if (!authData.user) {
      console.error("No user data returned from signup");
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Create a response with the user data
    const response = NextResponse.json({
      user: authData.user,
      session: authData.session,
    });

    // Set the access token cookie if available
    if (authData.session?.access_token) {
      // Cookie pour le token d'accès
      response.cookies.set({
        name: "access_token",
        value: authData.session.access_token,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: "lax",
      });

      // Cookie pour les informations utilisateur (pour le middleware)
      const userInfo = {
        id: authData.user.id,
        email: authData.user.email,
        role: role || "client", // Par défaut, rôle client si non défini
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
