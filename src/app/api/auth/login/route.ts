import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // This will be replaced with FastAPI in v2
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 401 });
    }

    const response = NextResponse.json({
      ...data,
      user_data: userData,
    });

    if (data.session?.access_token && data.session?.refresh_token) {
      // Cookie pour le token d'accès - Durée de vie plus courte
      response.cookies.set({
        name: "access_token",
        value: data.session.access_token,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60, // 60 minutes
        sameSite: "lax",
      });

      // Cookie pour le refresh token - Durée de vie plus longue
      response.cookies.set({
        name: "refresh_token",
        value: data.session.refresh_token,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 semaine
        sameSite: "lax",
      });

      // Stocker les données utilisateur complètes dans un cookie HTTP-only
      response.cookies.set({
        name: "user",
        value: JSON.stringify({
          ...userData,
          metadata: data.user.user_metadata,
        }),
        httpOnly: true, // Passer à true pour plus de sécurité
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 semaine
        sameSite: "lax",
      });

      // Ajouter un cookie séparé pour le middleware avec des informations minimales
      response.cookies.set({
        name: "auth_state",
        value: JSON.stringify({
          authenticated: true,
          id: userData.id,
          role: userData.role || data.user.user_metadata?.role || "client",
          onboarding_completed:
            userData.onboarding_completed ||
            data.user.user_metadata?.onboarding_completed ||
            false,
        }),
        httpOnly: false, // Nécessaire pour l'accès par le middleware
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 semaine
        sameSite: "lax",
      });
    }

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
