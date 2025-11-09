// Configuração compartilhada de i18n entre Next.js e Astro

export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

export const locales = ['pt', 'en', 'es'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'pt';

// Nomes dos idiomas no próprio idioma (não traduzidos)
export const localeNames: Record<Locale, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español'
};

// Detecta o idioma preferido do navegador
export function detectBrowserLocale(acceptLanguage?: string): Locale {
  if (!acceptLanguage) return defaultLocale;
  
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, q = '1'] = lang.trim().split(';q=');
      return { code: code.split('-')[0].toLowerCase(), quality: parseFloat(q) };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { code } of languages) {
    const locale = locales.find(l => l === code);
    if (locale) return locale;
  }

  return defaultLocale;
}

// Parse cookie string
export function parseCookie(cookieString?: string): Record<string, string> {
  if (!cookieString) return {};
  
  return cookieString.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) acc[key] = decodeURIComponent(value);
    return acc;
  }, {} as Record<string, string>);
}

// Obtém o locale do cookie ou detecta do navegador
export function getLocaleFromRequest(
  cookieString?: string,
  acceptLanguage?: string
): Locale {
  const cookies = parseCookie(cookieString);
  const cookieLocale = cookies[LOCALE_COOKIE_NAME];
  
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }
  
  return detectBrowserLocale(acceptLanguage);
}
