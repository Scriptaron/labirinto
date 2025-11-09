import { describe, it, expect } from 'vitest';

/**
 * Testes para a lógica de geração de URLs do LanguageSwitcher
 * 
 * Estes testes validam que:
 * 1. URLs com alternates usam os slugs corretos
 * 2. URLs sem alternates redirecionam para a lista de posts
 * 3. URLs de páginas normais mantêm o path com locale trocado
 */

type Locale = 'pt' | 'en' | 'es';

interface AlternatesTestCase {
  currentLocale: Locale;
  currentPath: string;
  alternates?: Record<string, string>;
  targetLocale: Locale;
  expectedHref: string;
  description: string;
}

/**
 * Função que replica a lógica do LanguageSwitcher.astro
 */
function generateHref(
  currentLocale: Locale,
  currentPath: string,
  targetLocale: Locale,
  alternates?: Record<string, string>
): string {
  let href = `/${targetLocale}${currentPath}`;
  
  // Se estamos em um post (tem alternates) e existe tradução para este locale
  if (alternates && alternates[targetLocale]) {
    href = `/${targetLocale}/blog/${alternates[targetLocale]}`;
  } else if (alternates && targetLocale === currentLocale) {
    // Se é o locale atual, mantém o path atual
    href = `/${currentLocale}${currentPath}`;
  } else if (currentPath.includes('/blog/')) {
    // Se é um post mas não tem alternate, vai para a lista de posts
    href = `/${targetLocale}/blog`;
  }
  
  return href;
}

describe('LanguageSwitcher URL generation', () => {
  describe('Posts com alternates (slugs diferentes)', () => {
    const testCases: AlternatesTestCase[] = [
      {
        currentLocale: 'pt',
        currentPath: '/blog/guia-javascript',
        alternates: { en: 'javascript-guide', es: 'guia-javascript' },
        targetLocale: 'en',
        expectedHref: '/en/blog/javascript-guide',
        description: 'deve usar slug em inglês quando trocar de PT para EN'
      },
      {
        currentLocale: 'en',
        currentPath: '/blog/javascript-guide',
        alternates: { pt: 'guia-javascript', es: 'guia-javascript' },
        targetLocale: 'pt',
        expectedHref: '/pt/blog/guia-javascript',
        description: 'deve usar slug em português quando trocar de EN para PT'
      },
      {
        currentLocale: 'pt',
        currentPath: '/blog/guia-javascript',
        alternates: { en: 'javascript-guide', es: 'guia-javascript' },
        targetLocale: 'es',
        expectedHref: '/es/blog/guia-javascript',
        description: 'deve usar slug em espanhol quando trocar de PT para ES'
      },
      {
        currentLocale: 'pt',
        currentPath: '/blog/guia-javascript',
        alternates: { en: 'javascript-guide', es: 'guia-javascript' },
        targetLocale: 'pt',
        expectedHref: '/pt/blog/guia-javascript',
        description: 'deve manter o path atual quando o locale é o mesmo'
      }
    ];

    testCases.forEach(({ currentLocale, currentPath, alternates, targetLocale, expectedHref, description }) => {
      it(description, () => {
        const href = generateHref(currentLocale, currentPath, targetLocale, alternates);
        expect(href).toBe(expectedHref);
      });
    });
  });

  describe('Posts com alternates (mesmo slug)', () => {
    const testCases: AlternatesTestCase[] = [
      {
        currentLocale: 'pt',
        currentPath: '/blog/react-hooks',
        alternates: { en: 'react-hooks', es: 'react-hooks' },
        targetLocale: 'en',
        expectedHref: '/en/blog/react-hooks',
        description: 'deve usar o mesmo slug quando disponível em todos os idiomas'
      },
      {
        currentLocale: 'en',
        currentPath: '/blog/react-hooks',
        alternates: { pt: 'react-hooks', es: 'react-hooks' },
        targetLocale: 'es',
        expectedHref: '/es/blog/react-hooks',
        description: 'deve trocar apenas o locale quando slug é igual'
      }
    ];

    testCases.forEach(({ currentLocale, currentPath, alternates, targetLocale, expectedHref, description }) => {
      it(description, () => {
        const href = generateHref(currentLocale, currentPath, targetLocale, alternates);
        expect(href).toBe(expectedHref);
      });
    });
  });

  describe('Posts sem alternates (tradução não disponível)', () => {
    const testCases: AlternatesTestCase[] = [
      {
        currentLocale: 'pt',
        currentPath: '/blog/post-exclusivo-pt',
        alternates: { en: 'exclusive-post-en' }, // Sem tradução para ES
        targetLocale: 'es',
        expectedHref: '/es/blog',
        description: 'deve redirecionar para lista de posts quando tradução não existe'
      },
      {
        currentLocale: 'en',
        currentPath: '/blog/exclusive-post-en',
        alternates: { pt: 'post-exclusivo-pt' }, // Sem tradução para ES
        targetLocale: 'es',
        expectedHref: '/es/blog',
        description: 'deve ir para /blog quando alternate não está definido'
      }
    ];

    testCases.forEach(({ currentLocale, currentPath, alternates, targetLocale, expectedHref, description }) => {
      it(description, () => {
        const href = generateHref(currentLocale, currentPath, targetLocale, alternates);
        expect(href).toBe(expectedHref);
      });
    });
  });

  describe('Páginas sem alternates (lista de posts, home)', () => {
    const testCases: AlternatesTestCase[] = [
      {
        currentLocale: 'pt',
        currentPath: '/blog',
        targetLocale: 'en',
        expectedHref: '/en/blog',
        description: 'deve trocar locale na lista de posts'
      },
      {
        currentLocale: 'en',
        currentPath: '/blog',
        targetLocale: 'es',
        expectedHref: '/es/blog',
        description: 'deve manter /blog com novo locale'
      },
      {
        currentLocale: 'pt',
        currentPath: '/about',
        targetLocale: 'en',
        expectedHref: '/en/about',
        description: 'deve trocar locale em páginas normais'
      }
    ];

    testCases.forEach(({ currentLocale, currentPath, targetLocale, expectedHref, description }) => {
      it(description, () => {
        const href = generateHref(currentLocale, currentPath, targetLocale);
        expect(href).toBe(expectedHref);
      });
    });
  });

  describe('Casos extremos', () => {
    it('deve lidar com path vazio', () => {
      const href = generateHref('pt', '', 'en');
      expect(href).toBe('/en');
    });

    it('deve lidar com path raiz', () => {
      const href = generateHref('pt', '/', 'en');
      expect(href).toBe('/en/');
    });

    it('deve lidar com alternates vazio', () => {
      const href = generateHref('pt', '/blog/post', 'en', {});
      expect(href).toBe('/en/blog');
    });

    it('deve priorizar alternate sobre path atual', () => {
      const href = generateHref('pt', '/blog/wrong-slug', 'en', { en: 'correct-slug' });
      expect(href).toBe('/en/blog/correct-slug');
    });
  });
});
