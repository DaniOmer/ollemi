/**
 * Custom hook for handling translations in client components
 *
 * This file provides two functions:
 * 1. useTranslations - retrieves translations from the common namespace
 * 2. useTranslationsFrom - allows fetching translations from a specified namespace
 */

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
 * @example
 * const t = useTranslations();
 * return <h1>{t('header.title')}</h1>;
 *
 * // For array translations
 * const features = t<string[]>('pricing.basic.features');
 * return (
 *   <ul>
 *     {features.map((feature, index) => (
 *       <li key={index}>{feature}</li>
 *     ))}
 *   </ul>
 * );
 */
export function useTranslations(): TranslationFunction {
  return useNextIntlTranslations("common") as TranslationFunction;
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
