// i18n.ts
import { getRequestConfig } from 'next-intl/server';

export const supportedLocales = [
  'en', 'ko', 'es', 'ja', 'de', 'fr', 'pt', 'ru', 'zh-CN', 'it',
  'ar', 'hi', 'id', 'tr', 'vi', 'pl', 'nl', 'th', 'sv', 'ms'
] as const;

const fallbackLocale = 'en';

export default getRequestConfig(async ({ locale }) => {
  const safeLocale = supportedLocales.includes(locale as any) ? locale! : fallbackLocale;

  return {
    locale: safeLocale,
    messages: {}, // layout.tsx에서 따로 불러옴
  };
});
