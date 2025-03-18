/**
 * Custom hook for handling translations in client components
 *
 * This file provides two functions:
 * 1. useTranslations - retrieves translations from the common namespace
 * 2. useTranslationsFrom - allows fetching translations from a specified namespace
 */

import { useMessages, useLocale } from "next-intl";
import { useTranslations as useNextIntlTranslations } from "next-intl";

/**
 * TranslationFunction type that supports both string and array translations
 */
type TranslationFunction = {
  (key: string): string;
  <T extends unknown[]>(key: string): T;
};

/**
 * Hook for retrieving translations from the common namespace in client components
 *
 */
export function useTranslations(): {
  t: TranslationFunction;
} {
  const messages = useMessages();

  // Create a translation function that accesses nested properties
  const t = (key: string) => {
    const keys = key.split(".");
    let value: any = messages;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return key; // Return the key if the path doesn't exist
      }
    }

    return value;
  };
  return { t };
}

/**
 * Hook for retrieving translations from a specified namespace in client components
 *
 * @param namespace The translation namespace to use
 *
 * @example
 * const t = useTranslationsFrom('dashboard');
 * return <h1>{t('welcome')}</h1>;
 *
 * // For array translations
 * const items = t<string[]>('menu.items');
 * return (
 *   <ul>
 *     {items.map((item, index) => (
 *       <li key={index}>{item}</li>
 *     ))}
 *   </ul>
 * );
 */
export function useTranslationsFrom(namespace: string): TranslationFunction {
  return useNextIntlTranslations(namespace) as TranslationFunction;
}
