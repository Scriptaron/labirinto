import { describe, it, expect } from 'vitest';
import {
  detectBrowserLocale,
  parseCookie,
  getLocaleFromRequest,
  LOCALE_COOKIE_NAME,
  defaultLocale,
  locales,
  localeNames
} from './index';

describe('i18n-config', () => {
  describe('detectBrowserLocale', () => {
    it('deve retornar o locale padrão quando não há accept-language', () => {
      expect(detectBrowserLocale()).toBe(defaultLocale);
    });

    it('deve detectar português', () => {
      expect(detectBrowserLocale('pt-BR,pt;q=0.9,en;q=0.8')).toBe('pt');
    });

    it('deve detectar inglês', () => {
      expect(detectBrowserLocale('en-US,en;q=0.9')).toBe('en');
    });

    it('deve detectar espanhol', () => {
      expect(detectBrowserLocale('es-ES,es;q=0.9')).toBe('es');
    });

    it('deve retornar o locale padrão para idioma não suportado', () => {
      expect(detectBrowserLocale('fr-FR,fr;q=0.9')).toBe(defaultLocale);
    });

    it('deve respeitar a qualidade (q) do accept-language', () => {
      expect(detectBrowserLocale('fr;q=0.9,en;q=0.8,pt;q=0.7')).toBe('en');
    });
  });

  describe('parseCookie', () => {
    it('deve retornar objeto vazio quando não há cookie', () => {
      expect(parseCookie()).toEqual({});
    });

    it('deve parsear um único cookie', () => {
      expect(parseCookie('name=value')).toEqual({ name: 'value' });
    });

    it('deve parsear múltiplos cookies', () => {
      expect(parseCookie('name1=value1; name2=value2')).toEqual({
        name1: 'value1',
        name2: 'value2'
      });
    });

    it('deve decodificar valores de cookie', () => {
      expect(parseCookie('name=hello%20world')).toEqual({ name: 'hello world' });
    });
  });

  describe('getLocaleFromRequest', () => {
    it('deve priorizar o cookie sobre o accept-language', () => {
      const cookie = `${LOCALE_COOKIE_NAME}=en`;
      const acceptLanguage = 'pt-BR,pt;q=0.9';
      expect(getLocaleFromRequest(cookie, acceptLanguage)).toBe('en');
    });

    it('deve usar accept-language quando não há cookie', () => {
      expect(getLocaleFromRequest(undefined, 'es-ES,es;q=0.9')).toBe('es');
    });

    it('deve retornar locale padrão quando cookie tem valor inválido', () => {
      const cookie = `${LOCALE_COOKIE_NAME}=invalid`;
      expect(getLocaleFromRequest(cookie)).toBe(defaultLocale);
    });

    it('deve retornar locale padrão quando não há cookie nem accept-language', () => {
      expect(getLocaleFromRequest()).toBe(defaultLocale);
    });
  });

  describe('locales', () => {
    it('deve conter todos os locales esperados', () => {
      expect(locales).toEqual(['pt', 'en', 'es']);
    });
  });

  describe('localeNames', () => {
    it('deve ter nomes para todos os locales', () => {
      locales.forEach(locale => {
        expect(localeNames[locale]).toBeDefined();
        expect(typeof localeNames[locale]).toBe('string');
      });
    });

    it('deve ter nomes no idioma nativo', () => {
      expect(localeNames.pt).toBe('Português');
      expect(localeNames.en).toBe('English');
      expect(localeNames.es).toBe('Español');
    });
  });
});
