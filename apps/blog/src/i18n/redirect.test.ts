import { describe, it, expect } from 'vitest';
import { getRedirectLocale, getCookie, getBrowserLang } from './redirect';

/**
 * Testes para validar a lógica de redirecionamento client-side (index.astro)
 * 
 * Estes testes validam:
 * 1. Redirecionamento baseado em cookie NEXT_LOCALE
 * 2. Redirecionamento baseado em preferências do navegador
 * 3. Fallback para idioma padrão
 * 4. Prioridade: cookie > browser > default
 */

describe('Redirecionamento client-side', () => {
  describe('getCookie', () => {
    it('deve extrair cookie NEXT_LOCALE corretamente', () => {
      expect(getCookie('NEXT_LOCALE', 'NEXT_LOCALE=en')).toBe('en');
      expect(getCookie('NEXT_LOCALE', 'NEXT_LOCALE=pt')).toBe('pt');
      expect(getCookie('NEXT_LOCALE', 'NEXT_LOCALE=es')).toBe('es');
    });

    it('deve lidar com múltiplos cookies', () => {
      expect(getCookie('NEXT_LOCALE', 'other=value; NEXT_LOCALE=en; another=test')).toBe('en');
    });

    it('deve retornar null quando cookie não existe', () => {
      expect(getCookie('NEXT_LOCALE', 'other=value')).toBeNull();
      expect(getCookie('NEXT_LOCALE', '')).toBeNull();
    });

    it('deve extrair cookie mesmo com espaços', () => {
      expect(getCookie('NEXT_LOCALE', 'other=value;NEXT_LOCALE=en;another=test')).toBe('en');
    });
  });

  describe('getBrowserLang', () => {
    it('deve detectar português', () => {
      expect(getBrowserLang(['pt-BR', 'en'])).toBe('pt');
      expect(getBrowserLang(['pt'])).toBe('pt');
    });

    it('deve detectar inglês', () => {
      expect(getBrowserLang(['en-US', 'pt'])).toBe('en');
      expect(getBrowserLang(['en'])).toBe('en');
    });

    it('deve detectar espanhol', () => {
      expect(getBrowserLang(['es-ES', 'en'])).toBe('es');
      expect(getBrowserLang(['es'])).toBe('es');
    });

    it('deve usar default quando idioma não é suportado', () => {
      expect(getBrowserLang(['fr-FR', 'de-DE'])).toBe('pt');
      expect(getBrowserLang([])).toBe('pt');
    });

    it('deve escolher o primeiro idioma suportado', () => {
      expect(getBrowserLang(['fr-FR', 'en-US', 'pt-BR'])).toBe('en');
      expect(getBrowserLang(['de-DE', 'es', 'en'])).toBe('es');
    });

    it('deve ignorar case no código de região', () => {
      expect(getBrowserLang(['PT-br'])).toBe('pt');
      expect(getBrowserLang(['EN-us'])).toBe('en');
    });
  });

  describe('getRedirectLocale', () => {
    describe('Prioridade: cookie > browser > default', () => {
      it('deve priorizar cookie sobre preferências do navegador', () => {
        expect(getRedirectLocale('NEXT_LOCALE=en', ['pt-BR'])).toBe('en');
        expect(getRedirectLocale('NEXT_LOCALE=es', ['en-US'])).toBe('es');
        expect(getRedirectLocale('NEXT_LOCALE=pt', ['es-ES'])).toBe('pt');
      });

      it('deve usar preferências do navegador quando não há cookie', () => {
        expect(getRedirectLocale('', ['en-US', 'pt'])).toBe('en');
        expect(getRedirectLocale('', ['es-ES'])).toBe('es');
        expect(getRedirectLocale('', ['pt-BR'])).toBe('pt');
      });

      it('deve usar default quando nenhuma opção é válida', () => {
        expect(getRedirectLocale('', ['fr-FR', 'de-DE'])).toBe('pt');
        expect(getRedirectLocale('', [])).toBe('pt');
      });
    });

    describe('Validação de cookie', () => {
      it('deve ignorar cookie inválido e usar navegador', () => {
        expect(getRedirectLocale('NEXT_LOCALE=invalid', ['en-US'])).toBe('en');
        expect(getRedirectLocale('NEXT_LOCALE=fr', ['es-ES'])).toBe('es');
      });

      it('deve lidar com múltiplos cookies corretamente', () => {
        expect(getRedirectLocale('session=abc; NEXT_LOCALE=en; other=123', ['pt-BR'])).toBe('en');
      });

      it('deve ignorar cookie vazio', () => {
        expect(getRedirectLocale('NEXT_LOCALE=', ['en-US'])).toBe('en');
      });

      it('deve ser case-sensitive para códigos de idioma', () => {
        expect(getRedirectLocale('NEXT_LOCALE=EN', [])).toBe('pt'); // Invalid: deve ser 'en' minúsculo
        expect(getRedirectLocale('NEXT_LOCALE=PT', [])).toBe('pt'); // Invalid: deve ser 'pt' minúsculo
      });
    });

    describe('Casos extremos', () => {
      it('deve lidar com cookies e languages vazios', () => {
        expect(getRedirectLocale('', [])).toBe('pt');
      });

      it('deve lidar com cookie válido e languages vazio', () => {
        expect(getRedirectLocale('NEXT_LOCALE=en', [])).toBe('en');
      });

      it('deve lidar com strings com caracteres especiais', () => {
        expect(getRedirectLocale('key=value%20with%20spaces; NEXT_LOCALE=es', ['en'])).toBe('es');
      });
    });

    describe('Cenários reais de uso', () => {
      it('usuário brasileiro com preferência em inglês', () => {
        expect(getRedirectLocale('NEXT_LOCALE=en', ['pt-BR', 'pt'])).toBe('en');
      });

      it('usuário americano sem preferência salva', () => {
        expect(getRedirectLocale('', ['en-US', 'en'])).toBe('en');
      });

      it('usuário espanhol sem preferência salva', () => {
        expect(getRedirectLocale('', ['es-ES', 'es', 'en'])).toBe('es');
      });

      it('usuário francês deve usar default', () => {
        expect(getRedirectLocale('', ['fr-FR', 'fr'])).toBe('pt');
      });

      it('primeira visita sem cookie e sem navegador configurado', () => {
        expect(getRedirectLocale('', [])).toBe('pt');
      });
    });
  });
});
