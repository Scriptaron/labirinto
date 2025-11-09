import { describe, it, expect } from 'vitest';
import { getLangFromUrl, useTranslations, getLocalizedPath } from './utils';
import type { Locale } from '@labirinto/i18n-config';

describe('i18n utils', () => {
  describe('getLangFromUrl', () => {
    it('deve extrair o locale da URL', () => {
      const url = new URL('http://localhost:4321/pt/blog');
      expect(getLangFromUrl(url)).toBe('pt');
    });

    it('deve extrair locale de URL com path mais longo', () => {
      const url = new URL('http://localhost:4321/en/blog/first-post');
      expect(getLangFromUrl(url)).toBe('en');
    });

    it('deve retornar locale padrão para URL sem locale', () => {
      const url = new URL('http://localhost:4321/blog');
      expect(getLangFromUrl(url)).toBe('pt');
    });

    it('deve retornar locale padrão para locale inválido', () => {
      const url = new URL('http://localhost:4321/invalid/blog');
      expect(getLangFromUrl(url)).toBe('pt');
    });
  });

  describe('useTranslations', () => {
    it('deve retornar traduções para português', () => {
      const t = useTranslations('pt');
      expect(t('site.title')).toBe('Blog Labirinto');
    });

    it('deve retornar traduções para inglês', () => {
      const t = useTranslations('en');
      expect(t('site.title')).toBe('Labirinto Blog');
    });

    it('deve retornar traduções para espanhol', () => {
      const t = useTranslations('es');
      expect(t('site.title')).toBe('Blog Labirinto');
    });



    it('deve retornar tradução padrão para chave inexistente', () => {
      const t = useTranslations('pt');
      expect(t('site.title')).toBeDefined();
    });
  });

  describe('getLocalizedPath', () => {
    it('deve adicionar locale ao path', () => {
      expect(getLocalizedPath('/blog', 'en')).toBe('/en/blog');
    });

    it('deve substituir locale existente', () => {
      expect(getLocalizedPath('/pt/blog', 'en')).toBe('/en/blog');
    });

    it('deve lidar com paths complexos', () => {
      expect(getLocalizedPath('/pt/blog/first-post', 'es')).toBe('/es/blog/first-post');
    });
  });
});
