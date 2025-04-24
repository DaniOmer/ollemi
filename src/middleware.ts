import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import {
  extractToken,
  extractAuthStateFromCookie,
} from "./lib/supabase/client";
import { locales, defaultLocale } from "./i18n";

/**
 * Ajoute des en-têtes de sécurité à la réponse
 * @param response - La réponse à laquelle ajouter les en-têtes
 */
function addSecurityHeaders(response: NextResponse): void {
  // Protection contre le sniffing de type MIME
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Protection contre le clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // Protection XSS pour les navigateurs anciens
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Contrôle de la référence HTTP
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Restrictions des fonctionnalités du navigateur
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // En production, ajouter Content-Security-Policy
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://knbrbqjkgxwvopnqvonn.supabase.co; font-src 'self' data:;"
    );
  }
}

// Define route configurations for better organization
const ROUTE_CONFIG = {
  public: [
    "/",
    "/login",
    "/signup",
    "/about",
    "/contact",
    "/pricing",
    "/services",
  ],
  auth: ["/login", "/signup", "/reset-password", "/forgot-password"],
  protected: ["/dashboard"],
  onboarding: ["/onboarding"],
  proRoutes: ["/dashboard/pro"],
  clientRoutes: ["/dashboard/client"],
  api: ["/api"],
};

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

  // Skip auth checks for public assets
  if (
    normalizedPath.includes("/_next") ||
    normalizedPath.includes("/favicon.ico") ||
    normalizedPath.includes("/images/") ||
    normalizedPath.includes("/fonts/")
  ) {
    const response = intlMiddleware(req);
    addSecurityHeaders(response);
    return response;
  }

  // Skip authentication for API routes except those requiring auth
  if (normalizedPath.startsWith("/api")) {
    // Allow public API endpoints without auth
    if (
      normalizedPath === "/api/auth/login" ||
      normalizedPath === "/api/auth/signup" ||
      normalizedPath === "/api/auth/refresh"
    ) {
      return NextResponse.next();
    }

    // For all other API routes, check for authentication token
    const token = extractToken(req);
    if (!token && !normalizedPath.startsWith("/api/public")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  // 1. Extract authentication information
  const token = extractToken(req);
  const isAuthenticated = token !== null;
  const authState = extractAuthStateFromCookie(req);

  // 2. Check for protected routes access
  const isProtectedRoute = ROUTE_CONFIG.protected.some((route) =>
    normalizedPath.startsWith(route)
  );

  const isAuthRoute = ROUTE_CONFIG.auth.some((route) =>
    normalizedPath.startsWith(route)
  );

  const isOnboardingRoute = ROUTE_CONFIG.onboarding.some((route) =>
    normalizedPath.startsWith(route)
  );

  // 3. Handle unauthenticated access to protected routes
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL(`/${defaultLocale}/login`, req.url));
  }

  // 4. Handle authenticated users trying to access auth routes (login/signup)
  if (isAuthRoute && isAuthenticated && authState) {
    const targetRoute =
      authState.role === "pro" ? "/dashboard/pro" : "/dashboard/client";

    return NextResponse.redirect(
      new URL(`/${defaultLocale}${targetRoute}`, req.url)
    );
  }

  // 5. Handle role-based authorization for authenticated users
  if (isAuthenticated && authState) {
    const hasProPermission =
      authState.role === "admin" || authState.role === "pro";
    const hasClientPermission =
      authState.role === "admin" || authState.role === "client";
    const onboardingCompleted = authState.onboarding_completed === true;
    console.log("onboardingCompleted", onboardingCompleted);

    // Redirect to onboarding for pros that haven't completed it
    if (
      hasProPermission &&
      !onboardingCompleted &&
      normalizedPath.startsWith("/dashboard") &&
      !isOnboardingRoute
    ) {
      return NextResponse.redirect(
        new URL(`/${defaultLocale}/onboarding/business-name`, req.url)
      );
    }

    // Prevent unauthorized access to pro routes
    if (!hasProPermission && normalizedPath.startsWith("/dashboard/pro")) {
      return NextResponse.redirect(new URL(`/${defaultLocale}`, req.url));
    }

    // Prevent unauthorized access to client routes
    if (
      !hasClientPermission &&
      normalizedPath.startsWith("/dashboard/client")
    ) {
      return NextResponse.redirect(new URL(`/${defaultLocale}`, req.url));
    }
  }

  // 6. Handle internationalization
  const response = intlMiddleware(req);
  addSecurityHeaders(response);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
