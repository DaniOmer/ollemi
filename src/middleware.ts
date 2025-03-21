import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { extractToken, extractUserFromCookie } from "./lib/supabase/client";
import { locales, defaultLocale } from "./i18n";

const protectedRoutes = ["/dashboard/pro", "/dashboard/client"];
const authRoutes = ["/login", "/signup"];

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

  // Vérifier si l'utilisateur est authentifié mais non autorisé pour les routes admin/pro
  if (isAuthenticated && user) {
    const hasProPermission = user.role === "admin" || user.role === "pro";
    const hasClientPermission = user.role === "admin" || user.role === "client";

    if (!hasProPermission && normalizedPath.startsWith("/dashboard/pro")) {
      return NextResponse.redirect(new URL(`/${defaultLocale}`, req.url));
    }

    if (
      !hasClientPermission &&
      normalizedPath.startsWith("/dashboard/client")
    ) {
      return NextResponse.redirect(new URL(`/${defaultLocale}`, req.url));
    }
  }

  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL(`/${defaultLocale}/login`, req.url));
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, req.url));
  }

  // 2. Gestion i18n
  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
