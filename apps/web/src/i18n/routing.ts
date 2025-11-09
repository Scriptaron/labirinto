import {defineRouting} from 'next-intl/routing';
import { locales, defaultLocale, LOCALE_COOKIE_NAME } from '@labirinto/i18n-config';
 
export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  localePrefix: 'always',
  localeCookie: {
    name: LOCALE_COOKIE_NAME
  }
});