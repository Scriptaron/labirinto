/**
 * Lógica de detecção de idioma preferido para redirect client-side
 * Prioridade: cookie > browser > default
 */

export type Locale = 'pt' | 'en' | 'es';

export const defaultLang: Locale = 'pt';
export const supportedLangs: Locale[] = ['pt', 'en', 'es'];

/**
 * Extrai o valor de um cookie pelo nome
 */
export function getCookie(name: string, cookieString: string): string | null {
  // Normaliza cookies sem espaço após ";"
  const normalizedCookies = cookieString.replace(/;\s*/g, '; ');
  const value = `; ${normalizedCookies}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

/**
 * Detecta o idioma preferido do navegador
 */
export function getBrowserLang(languages: readonly string[]): Locale {
  for (const lang of languages) {
    const code = lang.split('-')[0].toLowerCase() as Locale;
    if (supportedLangs.indexOf(code) !== -1) return code;
  }
  return defaultLang;
}

/**
 * Determina o idioma para redirect baseado em cookie e preferências do navegador
 */
export function getRedirectLocale(
  cookieString: string,
  browserLanguages: readonly string[]
): Locale {
  // Prioridade 1: Cookie NEXT_LOCALE
  const localeCookie = getCookie('NEXT_LOCALE', cookieString);
  if (localeCookie && supportedLangs.indexOf(localeCookie as Locale) !== -1) {
    return localeCookie as Locale;
  }

  // Prioridade 2: Idioma do navegador
  return getBrowserLang(browserLanguages);
}
