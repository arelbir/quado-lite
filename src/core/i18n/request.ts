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
      common: (await import(`./locales/${validLocale}/common.json`)).default,
      errors: (await import(`./locales/${validLocale}/errors.json`)).default,
      navigation: (await import(`./locales/${validLocale}/navigation.json`)).default,
      status: (await import(`./locales/${validLocale}/status.json`)).default,
      audit: (await import(`./locales/${validLocale}/audit.json`)).default,
      action: (await import(`./locales/${validLocale}/action.json`)).default,
      finding: (await import(`./locales/${validLocale}/finding.json`)).default,
      dof: (await import(`./locales/${validLocale}/dof.json`)).default,
      reports: (await import(`./locales/${validLocale}/reports.json`)).default,
      dashboard: (await import(`./locales/${validLocale}/dashboard.json`)).default,
      myTasks: (await import(`./locales/${validLocale}/myTasks.json`)).default,
      templates: (await import(`./locales/${validLocale}/templates.json`)).default,
      questionBanks: (await import(`./locales/${validLocale}/questionBanks.json`)).default,
      questions: (await import(`./locales/${validLocale}/questions.json`)).default,
      plans: (await import(`./locales/${validLocale}/plans.json`)).default,
    },
  };
});
