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

    // Récupérer les informations complètes de l'utilisateur, y compris le rôle
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user?.id)
      .single();

    if (userError) {
      console.error(
        "Erreur lors de la récupération du profil utilisateur:",
        userError
      );
    }

    // Stocker le token dans un cookie pour le middleware
    const response = NextResponse.json(data);

    if (data.session?.access_token) {
      // Cookie pour le token d'accès
      response.cookies.set({
        name: "access_token",
        value: data.session.access_token,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 semaine
        sameSite: "lax",
      });

      // Cookie pour les informations utilisateur (pour le middleware)
      const userInfo = {
        id: data.user?.id,
        email: data.user?.email,
        role: userData?.role,
      };

      response.cookies.set({
        name: "user",
        value: JSON.stringify(userInfo),
        httpOnly: false, // Doit être false pour que le middleware puisse y accéder
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
