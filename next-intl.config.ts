import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, defaultLocale } from "./src/i18n";

export default getRequestConfig(async ({ locale }) => {
  // Validate that the locale is supported
  if (!locales.includes(locale as any)) {
    notFound();
  }

  try {
    // Load messages for the requested locale
    const messages = (await import(`./src/messages/${locale}/common.json`))
      .default;

    return {
      locale,
      messages,
      defaultNamespace: "common",
      timeZone: "Europe/Paris",
    };
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    // Fallback to English if there's an error
    return {
      locale: defaultLocale,
      messages: (await import("./src/messages/en/common.json")).default,
      defaultNamespace: "common",
      timeZone: "Europe/Paris",
    };
  }
});
