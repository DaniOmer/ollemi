// Define the available locales
export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];

// This is the default locale to use
export const defaultLocale: Locale = "en";

// Mapping of full names for each locale
export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};
