// Define supported locales
export const locales = ["en", "fr"] as const;

// Define the default locale
export const defaultLocale = "en" as const;

// Type for locales
export type Locale = (typeof locales)[number];

// Mapping of full names for each locale
export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};
