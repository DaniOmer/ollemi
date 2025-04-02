import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/client";

// Garde un registre des refresh tokens utilisés récemment pour éviter la réutilisation
// Dans une application de production, cela devrait être stocké dans une base de données ou un cache Redis
const usedRefreshTokens = new Set<string>();
// Limite la taille du set pour éviter les fuites de mémoire
const MAX_USED_TOKENS = 1000;

export async function POST(request: NextRequest) {
  try {
    const refreshTokenCookie = request.cookies.get("refresh_token")?.value;

    if (!refreshTokenCookie) {
      return NextResponse.json(
        { error: "Refresh token is missing" },
        { status: 401 }
      );
    }

    // Utiliser une variable typée explicitement comme string
    const refreshToken: string = refreshTokenCookie;

    // Vérifier si le token a déjà été utilisé (protection contre la réutilisation)
    if (usedRefreshTokens.has(refreshToken)) {
      console.warn("Attempted reuse of refresh token detected");

      // Nettoyer tous les cookies d'authentification
      const response = NextResponse.json(
        { error: "Invalid refresh token. Please login again." },
        { status: 401 }
      );

      response.cookies.delete("access_token");
      response.cookies.delete("refresh_token");
      response.cookies.delete("user");
      response.cookies.delete("auth_state");

      return response;
    }

    // Rafraîchir la session avec Supabase
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      console.error("Token refresh error:", error);

      // Nettoyer les cookies en cas d'échec du rafraîchissement
      const response = NextResponse.json(
        { error: "Authentication expired. Please login again." },
        { status: 401 }
      );

      response.cookies.delete("access_token");
      response.cookies.delete("refresh_token");
      response.cookies.delete("user");
      response.cookies.delete("auth_state");

      return response;
    }

    // S'assurer que nous avons une session valide
    if (!data.session?.access_token || !data.session?.refresh_token) {
      return NextResponse.json(
        { error: "Failed to refresh session" },
        { status: 401 }
      );
    }

    // Ajouter l'ancien token à la liste des tokens utilisés
    usedRefreshTokens.add(refreshToken);

    // Limiter la taille du set pour éviter les fuites de mémoire
    if (usedRefreshTokens.size > MAX_USED_TOKENS) {
      // Supprimer le plus ancien token (premier élément du set)
      const oldestToken = usedRefreshTokens.values().next().value;
      if (oldestToken) {
        usedRefreshTokens.delete(oldestToken);
      }
    }

    // Récupérer les données utilisateur pour mettre à jour les cookies
    let userData = null;
    let userError = null;

    if (data.user?.id) {
      const result = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      userData = result.data;
      userError = result.error;
    }

    if (userError) {
      console.error("User data fetch error during refresh:", userError);
    }

    // Définir les nouveaux tokens dans les cookies
    const newAccessToken = data.session.access_token;
    const newRefreshToken = data.session.refresh_token;
    const response = NextResponse.json({
      success: true,
      user: data.user,
    });

    // Définir les nouveaux cookies
    response.cookies.set({
      name: "access_token",
      value: newAccessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 15, // 15 minutes
      sameSite: "lax",
      path: "/",
    });

    response.cookies.set({
      name: "refresh_token",
      value: newRefreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semaine
      sameSite: "lax",
      path: "/",
    });

    // Mettre à jour le cookie user si les données utilisateur sont disponibles
    if (data.user) {
      const userInfo = userData || {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || "client",
        onboarding_completed:
          data.user.user_metadata?.onboarding_completed || false,
      };

      // Stocker les données utilisateur complètes dans un cookie HTTP-only
      response.cookies.set({
        name: "user",
        value: JSON.stringify({
          ...userInfo,
          metadata: data.user.user_metadata,
        }),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 semaine
        sameSite: "lax",
        path: "/",
      });

      // Ajouter un cookie séparé pour le middleware avec des informations minimales
      response.cookies.set({
        name: "auth_state",
        value: JSON.stringify({
          authenticated: true,
          id: userInfo.id,
          role: userInfo.role || data.user.user_metadata?.role || "client",
          onboarding_completed:
            userInfo.onboarding_completed ||
            data.user.user_metadata?.onboarding_completed ||
            false,
        }),
        httpOnly: false, // Nécessaire pour l'accès par le middleware
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 semaine
        sameSite: "lax",
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
