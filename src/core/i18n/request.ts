/**
 * i18n Request Configuration
 * Handles loading of translation messages
 */

import { getRequestConfig } from 'next-intl/server';
import { locales } from './config';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  const validLocale: string = locale && locales.includes(locale as any) ? locale : 'tr';

  return {
    locale: validLocale,
    messages: {
      // Generic framework translations only
      common: (await import(`./locales/${validLocale}/common.json`)).default,
      errors: (await import(`./locales/${validLocale}/errors.json`)).default,
      navigation: (await import(`./locales/${validLocale}/navigation.json`)).default,
      workflow: (await import(`./locales/${validLocale}/workflow.json`)).default,
      teams: (await import(`./locales/${validLocale}/teams.json`)).default,
      groups: (await import(`./locales/${validLocale}/groups.json`)).default,
      notifications: (await import(`./locales/${validLocale}/notifications.json`)).default,
    },
  };
});
