/**
 * i18n Configuration
 * Supported locales and settings
 */

export const locales = ['tr', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'tr';

export const localeNames: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English',
};

export const localeFlags: Record<Locale, string> = {
  tr: '🇹🇷',
  en: '🇬🇧',
};

export const localeConfig = {
  locales,
  defaultLocale,
  localePrefix: 'as-needed' as const, // /tr not shown, /en shown
  localeDetection: true,
} as const;
