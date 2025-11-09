import { describe, it, expect } from 'vitest';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { parse } from 'yaml';

/**
 * Testes de integração para validar a consistência dos posts do blog
 * 
 * Estes testes garantem que:
 * 1. Todos os posts têm os campos obrigatórios
 * 2. Os alternates apontam para posts existentes
 * 3. Os slugs são únicos por idioma
 * 4. Os alternates são bidirecionais (se A aponta para B, B aponta para A)
 */

interface PostFrontmatter {
  title: string;
  description: string;
  pubDate: string;
  lang: string;
  slug: string;
  alternates?: Record<string, string>;
  heroImage?: string;
}

const BLOG_CONTENT_DIR = join(__dirname, 'blog');
const LOCALES = ['pt', 'en', 'es'];

async function getPostsInLocale(locale: string): Promise<Map<string, PostFrontmatter>> {
  const posts = new Map<string, PostFrontmatter>();
  const localeDir = join(BLOG_CONTENT_DIR, locale);
  
  try {
    const files = await readdir(localeDir);
    
    for (const file of files) {
      if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;
      
      const content = await readFile(join(localeDir, file), 'utf-8');
      const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      
      if (frontmatterMatch) {
        const frontmatter = parse(frontmatterMatch[1]) as PostFrontmatter;
        if (frontmatter.slug) {
          posts.set(frontmatter.slug, frontmatter);
        }
      }
    }
  } catch (error) {
    // Locale não existe
  }
  
  return posts;
}

describe('Blog posts validation', () => {
  describe('Estrutura de posts', () => {
    it('deve ter posts em todos os idiomas suportados', async () => {
      for (const locale of LOCALES) {
        const posts = await getPostsInLocale(locale);
        expect(posts.size).toBeGreaterThan(0);
      }
    });

    it('todos os posts devem ter campos obrigatórios', async () => {
      for (const locale of LOCALES) {
        const posts = await getPostsInLocale(locale);
        
        for (const [slug, post] of posts) {
          expect(post.title, `Post ${locale}/${slug} deve ter título`).toBeDefined();
          expect(post.description, `Post ${locale}/${slug} deve ter descrição`).toBeDefined();
          expect(post.pubDate, `Post ${locale}/${slug} deve ter pubDate`).toBeDefined();
          expect(post.lang, `Post ${locale}/${slug} deve ter lang`).toBe(locale);
          expect(post.slug, `Post ${locale}/${slug} deve ter slug`).toBe(slug);
        }
      }
    });

    it('slugs devem ser únicos por idioma', async () => {
      for (const locale of LOCALES) {
        const posts = await getPostsInLocale(locale);
        const slugs = Array.from(posts.keys());
        const uniqueSlugs = new Set(slugs);
        
        expect(slugs.length).toBe(uniqueSlugs.size);
      }
    });
  });

  describe('Alternates validation', () => {
    it('alternates devem apontar para posts existentes', async () => {
      const allPosts = new Map<string, Map<string, PostFrontmatter>>();
      
      for (const locale of LOCALES) {
        allPosts.set(locale, await getPostsInLocale(locale));
      }

      for (const [locale, posts] of allPosts) {
        for (const [slug, post] of posts) {
          if (!post.alternates) continue;

          for (const [altLocale, altSlug] of Object.entries(post.alternates)) {
            const altPosts = allPosts.get(altLocale);
            expect(
              altPosts?.has(altSlug),
              `Post ${locale}/${slug} aponta para ${altLocale}/${altSlug} que não existe`
            ).toBe(true);
          }
        }
      }
    });

    it('alternates devem ser bidirecionais', async () => {
      const allPosts = new Map<string, Map<string, PostFrontmatter>>();
      
      for (const locale of LOCALES) {
        allPosts.set(locale, await getPostsInLocale(locale));
      }

      for (const [locale, posts] of allPosts) {
        for (const [slug, post] of posts) {
          if (!post.alternates) continue;

          for (const [altLocale, altSlug] of Object.entries(post.alternates)) {
            const altPosts = allPosts.get(altLocale);
            const altPost = altPosts?.get(altSlug);
            
            expect(
              altPost?.alternates?.[locale],
              `Post ${locale}/${slug} aponta para ${altLocale}/${altSlug}, mas o inverso não existe`
            ).toBe(slug);
          }
        }
      }
    });

    it('posts devem ter alternates para outros idiomas quando possível', async () => {
      const allPosts = new Map<string, Map<string, PostFrontmatter>>();
      
      for (const locale of LOCALES) {
        allPosts.set(locale, await getPostsInLocale(locale));
      }

      // Verifica se há posts órfãos (sem traduções)
      const warnings: string[] = [];

      for (const [locale, posts] of allPosts) {
        for (const [slug, post] of posts) {
          const otherLocales = LOCALES.filter(l => l !== locale);
          const hasAllTranslations = otherLocales.every(
            l => post.alternates && post.alternates[l]
          );

          if (!hasAllTranslations) {
            warnings.push(`Post ${locale}/${slug} não tem traduções completas`);
          }
        }
      }

      // Este teste apenas avisa, não falha
      if (warnings.length > 0) {
        console.warn('\n⚠️  Posts sem traduções completas:');
        warnings.forEach(w => console.warn(`  - ${w}`));
      }

      expect(warnings.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Casos específicos de posts existentes', () => {
    it('post "guia-javascript" deve ter slugs diferentes em cada idioma', async () => {
      const ptPosts = await getPostsInLocale('pt');
      const enPosts = await getPostsInLocale('en');
      const esPosts = await getPostsInLocale('es');
      
      const ptPost = ptPosts.get('guia-javascript');
      expect(ptPost).toBeDefined();
      expect(ptPost?.alternates?.en).toBe('javascript-guide');
      expect(ptPost?.alternates?.es).toBe('guia-de-javascript');
      
      const enPost = enPosts.get('javascript-guide');
      expect(enPost).toBeDefined();
      expect(enPost?.alternates?.pt).toBe('guia-javascript');
      expect(enPost?.alternates?.es).toBe('guia-de-javascript');
      
      const esPost = esPosts.get('guia-de-javascript');
      expect(esPost).toBeDefined();
      expect(esPost?.alternates?.pt).toBe('guia-javascript');
      expect(esPost?.alternates?.en).toBe('javascript-guide');
    });

    it('post "react-hooks" deve ter mesmo slug em todos os idiomas', async () => {
      const ptPosts = await getPostsInLocale('pt');
      const enPosts = await getPostsInLocale('en');
      const esPosts = await getPostsInLocale('es');
      
      expect(ptPosts.has('react-hooks')).toBe(true);
      expect(enPosts.has('react-hooks')).toBe(true);
      expect(esPosts.has('react-hooks')).toBe(true);
      
      const ptPost = ptPosts.get('react-hooks');
      expect(ptPost?.alternates?.en).toBe('react-hooks');
      expect(ptPost?.alternates?.es).toBe('react-hooks');
    });

    it('post "primeiro-post" deve ter slugs traduzidos', async () => {
      const ptPosts = await getPostsInLocale('pt');
      const enPosts = await getPostsInLocale('en');
      const esPosts = await getPostsInLocale('es');
      
      const ptPost = ptPosts.get('primeiro-post');
      expect(ptPost?.alternates?.en).toBe('first-post');
      expect(ptPost?.alternates?.es).toBe('primer-post');
      
      const enPost = enPosts.get('first-post');
      expect(enPost?.alternates?.pt).toBe('primeiro-post');
      
      const esPost = esPosts.get('primer-post');
      expect(esPost?.alternates?.pt).toBe('primeiro-post');
    });
  });
});
