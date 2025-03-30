import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { extractToken, extractUserFromCookie } from "./lib/supabase/client";
import { locales, defaultLocale } from "./i18n";

const protectedRoutes = ["/dashboard"];
const authRoutes = ["/login", "/signup"];
const onboardingRoutes = ["/onboarding"];
const proRoutes = ["/dashboard/pro"];
const clientRoutes = ["/dashboard/client"];

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
  localeDetection: true,
});

function normalizePath(path: string): string {
  const segments = path.split("/");
  return locales.includes(segments[1] as any)
    ? `/${segments.slice(2).join("/")}` || "/"
    : path;
}

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const normalizedPath = normalizePath(path);

  // 1. Gestion des routes protégées
  const isProtected = protectedRoutes.some((route) =>
    normalizedPath.startsWith(route)
  );

  const isAuthRoute = authRoutes.some((route) =>
    normalizedPath.startsWith(route)
  );

  const token = extractToken(req);
  const isAuthenticated = token !== null;
  const user = extractUserFromCookie(req);

  // Redirection vers la page de connexion si l'utilisateur n'est pas authentifié
  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL(`/${defaultLocale}/login`, req.url));
  }

  // Vérifier si l'utilisateur est authentifié mais non autorisé pour les routes spécifiques
  if (isAuthenticated && user) {
    const hasProPermission = user.role === "admin" || user.role === "pro";
    const hasClientPermission = user.role === "admin" || user.role === "client";
    const onboardingCompleted = user.onboarding_completed === true;

    // Redirection vers l'onboarding si l'utilisateur n'a pas complété son onboarding
    // et essaie d'accéder au dashboard
    if (
      hasProPermission &&
      !onboardingCompleted &&
      normalizedPath.startsWith("/dashboard")
    ) {
      return NextResponse.redirect(
        new URL(`/${defaultLocale}/onboarding/business-name`, req.url)
      );
    }

    // Redirection si l'utilisateur n'a pas les permissions pour accéder à une route pro
    if (!hasProPermission && normalizedPath.startsWith("/dashboard/pro")) {
      return NextResponse.redirect(new URL(`/${defaultLocale}`, req.url));
    }

    // Redirection si l'utilisateur n'a pas les permissions pour accéder à une route client
    if (
      !hasClientPermission &&
      normalizedPath.startsWith("/dashboard/client")
    ) {
      return NextResponse.redirect(new URL(`/${defaultLocale}`, req.url));
    }
  }

  // Redirection après connexion vers le dashboard approprié ou l'onboarding si nécessaire
  // if (isAuthRoute && isAuthenticated && user?.role) {
  //   if (user.role === "pro" && !user.onboarding_completed) {
  //     return NextResponse.redirect(
  //       new URL(`/${defaultLocale}/onboarding/business-name`, req.url)
  //     );
  //   } else if (user.role === "pro") {
  //     return NextResponse.redirect(
  //       new URL(`/${defaultLocale}/dashboard/pro`, req.url)
  //     );
  //   } else if (user.role === "client") {
  //     return NextResponse.redirect(
  //       new URL(`/${defaultLocale}/dashboard/client`, req.url)
  //     );
  //   } else {
  //     return NextResponse.redirect(new URL(`/${defaultLocale}`, req.url));
  //   }
  // }

  // 2. Gestion i18n
  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
