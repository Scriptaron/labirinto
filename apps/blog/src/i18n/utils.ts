import { ui, defaultLang, type UIKey } from './ui';
import type { Locale } from '@labirinto/i18n-config';

export function getLangFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split('/');
  if (lang && lang in ui) return lang as Locale;
  return defaultLang as Locale;
}

export function useTranslations(lang: Locale) {
  return function t(key: UIKey) {
    return ui[lang][key] || ui[defaultLang][key];
  }
}

export function getLocalizedPath(path: string, locale: Locale): string {
  // Remove leading slash and locale if present
  const cleanPath = path.replace(/^\/[a-z]{2}\//, '/').replace(/^\//, '');
  return `/${locale}/${cleanPath}`;
}
