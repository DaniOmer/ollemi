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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      phone,
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

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 400 }
      );
    }

    // Créer la réponse
    const response = NextResponse.json(data);

    // Stocker le token dans un cookie pour le middleware si disponible
    if (data.session?.access_token) {
      response.cookies.set({
        name: "access_token",
        value: data.session.access_token,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 semaine
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
