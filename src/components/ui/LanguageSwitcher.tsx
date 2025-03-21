"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { locales, Locale, localeNames } from "@/i18n";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale() as Locale;

  // Function to change the locale
  const handleLocaleChange = useCallback(
    (newLocale: Locale) => {
      // If already on the selected locale, do nothing
      if (newLocale === currentLocale) return;

      // Get the path without the locale prefix
      const currentPathname = pathname;
      const pathnameWithoutLocale = currentPathname.replace(
        new RegExp(`^/${currentLocale}`),
        ""
      );

      // Construct the new path
      const newPath = `/${newLocale}${pathnameWithoutLocale || ""}`;

      // Navigate to the new path
      router.push(newPath);
    },
    [currentLocale, pathname, router]
  );

  return (
    <div className="flex items-center space-x-2">
      <Globe className="w-4 h-4 text-gray-500 mr-1" />
      {locales.map((locale) => (
        <Button
          key={locale}
          variant={locale === currentLocale ? "default" : "outline"}
          size="sm"
          onClick={() => handleLocaleChange(locale)}
          aria-label={`Switch language to ${localeNames[locale]}`}
          className="px-2 py-1 h-8"
        >
          {locale.toUpperCase()}
        </Button>
      ))}
    </div>
  );
}
