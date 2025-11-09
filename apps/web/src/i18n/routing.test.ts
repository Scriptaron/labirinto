import { describe, it, expect } from 'vitest';
import { locales, defaultLocale, LOCALE_COOKIE_NAME } from '@labirinto/i18n-config';

/**
 * Testes para validar a configuração de roteamento do Next.js
 * 
 * Estes testes validam:
 * 1. Configuração de locales
 * 2. Nome do cookie compartilhado
 * 3. Locale padrão
 */

describe('Next.js routing configuration', () => {
  describe('Locales configuration', () => {
    it('deve ter os locales corretos configurados', () => {
      expect(locales).toEqual(['pt', 'en', 'es']);
    });

    it('deve ter pelo menos um locale', () => {
      expect(locales.length).toBeGreaterThan(0);
    });

    it('todos os locales devem ser strings de 2 caracteres', () => {
      locales.forEach(locale => {
        expect(typeof locale).toBe('string');
        expect(locale.length).toBe(2);
      });
    });
  });

  describe('Default locale', () => {
    it('deve ter português como locale padrão', () => {
      expect(defaultLocale).toBe('pt');
    });

    it('locale padrão deve estar na lista de locales', () => {
      expect(locales).toContain(defaultLocale);
    });
  });

  describe('Cookie configuration', () => {
    it('deve usar NEXT_LOCALE como nome do cookie', () => {
      expect(LOCALE_COOKIE_NAME).toBe('NEXT_LOCALE');
    });

    it('nome do cookie deve ser uma string não vazia', () => {
      expect(typeof LOCALE_COOKIE_NAME).toBe('string');
      expect(LOCALE_COOKIE_NAME.length).toBeGreaterThan(0);
    });
  });

  describe('Integração Next.js e Astro', () => {
    it('deve usar o mesmo nome de cookie em ambas as aplicações', () => {
      // Este cookie é compartilhado entre Next.js e Astro
      expect(LOCALE_COOKIE_NAME).toBe('NEXT_LOCALE');
    });

    it('deve ter os mesmos locales em ambas as aplicações', () => {
      const expectedLocales = ['pt', 'en', 'es'];
      expect(locales).toEqual(expectedLocales);
    });

    it('deve ter o mesmo locale padrão em ambas as aplicações', () => {
      expect(defaultLocale).toBe('pt');
    });
  });
});
