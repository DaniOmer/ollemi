// Define the available locales
export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];

// This is the default locale to use
export const defaultLocale: Locale = "en";
