import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";

export default createMiddleware({
  // A list of all locales that are supported
  locales,
  // The default locale to be used when visiting a non-localized route
  defaultLocale,
  // Use "as-needed" to only add the locale prefix when needed
  localePrefix: "as-needed",
  // Enable locale detection
  localeDetection: true,
});

export const config = {
  // Match all pathnames except for
  // - /api, /_next, /_vercel, /favicon.ico, /robots.txt, etc.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
