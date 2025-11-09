import { describe, it, expect } from 'vitest';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { parse } from 'yaml';

/**
 * Testes para validar que não há conflitos de rotas no blog
 * 
 * Este teste detecta quando:
 * 1. Dois posts em idiomas diferentes têm o mesmo slug
 * 2. Arquivos com mesmo nome em pastas diferentes causam conflito
 * 3. Rotas geradas pelo Astro colidem
 */

interface PostFrontmatter {
  title: string;
  lang: string;
  slug: string;
  alternates?: Record<string, string>;
}

interface PostInfo {
  locale: string;
  fileName: string;
  slug: string;
  frontmatter: PostFrontmatter;
}

const BLOG_CONTENT_DIR = join(__dirname, 'blog');
const LOCALES = ['pt', 'en', 'es'];

async function getAllPosts(): Promise<PostInfo[]> {
  const allPosts: PostInfo[] = [];
  
  for (const locale of LOCALES) {
    const localeDir = join(BLOG_CONTENT_DIR, locale);
    
    try {
      const files = await readdir(localeDir);
      
      for (const file of files) {
        if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;
        
        const content = await readFile(join(localeDir, file), 'utf-8');
        const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        
        if (frontmatterMatch) {
          const frontmatter = parse(frontmatterMatch[1]) as PostFrontmatter;
          allPosts.push({
            locale,
            fileName: file,
            slug: frontmatter.slug,
            frontmatter
          });
        }
      }
    } catch (error) {
      // Locale não existe
    }
  }
  
  return allPosts;
}

describe('Blog routes validation', () => {
  describe('Conflitos de slug entre idiomas', () => {
    it('não deve ter posts com mesmo slug em idiomas diferentes', async () => {
      const allPosts = await getAllPosts();
      const slugsByLocale = new Map<string, Set<string>>();
      
      // Agrupa slugs por locale
      for (const post of allPosts) {
        if (!slugsByLocale.has(post.locale)) {
          slugsByLocale.set(post.locale, new Set());
        }
        slugsByLocale.get(post.locale)!.add(post.slug);
      }
      
      // Verifica conflitos entre locales
      const conflicts: string[] = [];
      const locales = Array.from(slugsByLocale.keys());
      
      for (let i = 0; i < locales.length; i++) {
        for (let j = i + 1; j < locales.length; j++) {
          const locale1 = locales[i];
          const locale2 = locales[j];
          const slugs1 = slugsByLocale.get(locale1)!;
          const slugs2 = slugsByLocale.get(locale2)!;
          
          for (const slug of slugs1) {
            if (slugs2.has(slug)) {
              // Verifica se são traduções do mesmo post
              const post1 = allPosts.find(p => p.locale === locale1 && p.slug === slug);
              const post2 = allPosts.find(p => p.locale === locale2 && p.slug === slug);
              
              const isTranslation = 
                post1?.frontmatter.alternates?.[locale2] === slug ||
                post2?.frontmatter.alternates?.[locale1] === slug;
              
              if (!isTranslation) {
                conflicts.push(
                  `Conflito: slug "${slug}" existe em ${locale1} e ${locale2} mas não são traduções do mesmo post`
                );
              }
            }
          }
        }
      }
      
      if (conflicts.length > 0) {
        console.error('\n❌ Conflitos de slug detectados:');
        conflicts.forEach(c => console.error(`  - ${c}`));
      }
      
      expect(conflicts).toHaveLength(0);
    });

    it('posts com mesmo slug devem ser traduções entre si', async () => {
      const allPosts = await getAllPosts();
      const postsBySlug = new Map<string, PostInfo[]>();
      
      // Agrupa posts por slug
      for (const post of allPosts) {
        if (!postsBySlug.has(post.slug)) {
          postsBySlug.set(post.slug, []);
        }
        postsBySlug.get(post.slug)!.push(post);
      }
      
      const errors: string[] = [];
      
      // Para cada slug que aparece em múltiplos locales
      for (const [slug, posts] of postsBySlug) {
        if (posts.length > 1) {
          // Verifica se todos se referenciam mutuamente
          for (const post of posts) {
            const otherPosts = posts.filter(p => p.locale !== post.locale);
            
            for (const otherPost of otherPosts) {
              const hasAlternate = post.frontmatter.alternates?.[otherPost.locale] === otherPost.slug;
              
              if (!hasAlternate) {
                errors.push(
                  `Post ${post.locale}/${post.slug} (${post.fileName}) não referencia ${otherPost.locale}/${otherPost.slug} nos alternates`
                );
              }
            }
          }
        }
      }
      
      if (errors.length > 0) {
        console.error('\n❌ Erros de referência entre posts com mesmo slug:');
        errors.forEach(e => console.error(`  - ${e}`));
      }
      
      expect(errors).toHaveLength(0);
    });
  });

  describe('Conflitos de nome de arquivo', () => {
    it('deve detectar arquivos com mesmo nome em locales diferentes', async () => {
      const allPosts = await getAllPosts();
      const filesByName = new Map<string, PostInfo[]>();
      
      // Agrupa posts por nome de arquivo
      for (const post of allPosts) {
        if (!filesByName.has(post.fileName)) {
          filesByName.set(post.fileName, []);
        }
        filesByName.get(post.fileName)!.push(post);
      }
      
      const warnings: string[] = [];
      const errors: string[] = [];
      
      // Verifica arquivos duplicados
      for (const [fileName, posts] of filesByName) {
        if (posts.length > 1) {
          const slugs = posts.map(p => p.slug);
          const uniqueSlugs = new Set(slugs);
          
          if (uniqueSlugs.size === 1) {
            // Mesmo arquivo, mesmo slug - OK se forem traduções
            const allAreTranslations = posts.every(post => {
              const otherPosts = posts.filter(p => p.locale !== post.locale);
              return otherPosts.every(other => 
                post.frontmatter.alternates?.[other.locale] === other.slug
              );
            });
            
            if (allAreTranslations) {
              warnings.push(
                `⚠️  Arquivo "${fileName}" existe em múltiplos locales: ${posts.map(p => p.locale).join(', ')}`
              );
            } else {
              errors.push(
                `❌ Arquivo "${fileName}" existe em múltiplos locales mas não são traduções corretas: ${posts.map(p => `${p.locale}/${p.slug}`).join(', ')}`
              );
            }
          } else {
            errors.push(
              `❌ Arquivo "${fileName}" existe em múltiplos locales com slugs diferentes: ${posts.map(p => `${p.locale}/${p.slug}`).join(', ')}`
            );
          }
        }
      }
      
      if (warnings.length > 0) {
        console.warn('\n⚠️  Avisos de arquivos duplicados:');
        warnings.forEach(w => console.warn(`  ${w}`));
        console.warn('\n  Recomendação: Use nomes de arquivo diferentes para cada idioma para evitar confusão.');
        console.warn('  Exemplo: guia-javascript-pt.md, javascript-guide-en.md, guia-javascript-es.md\n');
      }
      
      if (errors.length > 0) {
        console.error('\n❌ Erros críticos de arquivos duplicados:');
        errors.forEach(e => console.error(`  ${e}`));
      }
      
      expect(errors).toHaveLength(0);
    });
  });

  describe('Validação de rotas geradas', () => {
    it('deve gerar rotas únicas para cada post', async () => {
      const allPosts = await getAllPosts();
      const routes = new Map<string, PostInfo[]>();
      
      // Gera as rotas que o Astro criaria
      for (const post of allPosts) {
        const route = `/${post.locale}/blog/${post.slug}`;
        
        if (!routes.has(route)) {
          routes.set(route, []);
        }
        routes.get(route)!.push(post);
      }
      
      const conflicts: string[] = [];
      
      // Verifica se há rotas duplicadas
      for (const [route, posts] of routes) {
        if (posts.length > 1) {
          conflicts.push(
            `Rota "${route}" seria gerada por múltiplos arquivos: ${posts.map(p => `${p.locale}/${p.fileName}`).join(', ')}`
          );
        }
      }
      
      if (conflicts.length > 0) {
        console.error('\n❌ Conflitos de rota detectados:');
        conflicts.forEach(c => console.error(`  - ${c}`));
        console.error('\n  Isso causará erro 404 ao navegar entre idiomas!');
      }
      
      expect(conflicts).toHaveLength(0);
    });
  });

  describe('Casos específicos - guia-javascript', () => {
    it('deve ter slugs diferentes para PT e ES após correção', async () => {
      const allPosts = await getAllPosts();
      
      const ptPost = allPosts.find(p => p.locale === 'pt' && p.slug === 'guia-javascript');
      const esPost = allPosts.find(p => p.locale === 'es' && p.slug === 'guia-de-javascript');
      const enPost = allPosts.find(p => p.locale === 'en' && p.slug === 'javascript-guide');
      
      // Verifica que os posts existem
      expect(ptPost).toBeDefined();
      expect(esPost).toBeDefined();
      expect(enPost).toBeDefined();
      
      // Verifica que têm slugs diferentes
      expect(ptPost!.slug).toBe('guia-javascript');
      expect(esPost!.slug).toBe('guia-de-javascript');
      expect(enPost!.slug).toBe('javascript-guide');
      
      // Verifica que os alternates estão corretos
      expect(ptPost!.frontmatter.alternates?.en).toBe('javascript-guide');
      expect(ptPost!.frontmatter.alternates?.es).toBe('guia-de-javascript');
      
      expect(enPost!.frontmatter.alternates?.pt).toBe('guia-javascript');
      expect(enPost!.frontmatter.alternates?.es).toBe('guia-de-javascript');
      
      expect(esPost!.frontmatter.alternates?.pt).toBe('guia-javascript');
      expect(esPost!.frontmatter.alternates?.en).toBe('javascript-guide');
      
      // Verifica que geram rotas únicas
      const ptRoute = `/${ptPost!.locale}/blog/${ptPost!.slug}`;
      const esRoute = `/${esPost!.locale}/blog/${esPost!.slug}`;
      const enRoute = `/${enPost!.locale}/blog/${enPost!.slug}`;
      
      expect(ptRoute).toBe('/pt/blog/guia-javascript');
      expect(esRoute).toBe('/es/blog/guia-de-javascript');
      expect(enRoute).toBe('/en/blog/javascript-guide');
      
      // Todas as rotas devem ser diferentes
      const routes = [ptRoute, esRoute, enRoute];
      const uniqueRoutes = new Set(routes);
      expect(uniqueRoutes.size).toBe(3);
    });
  });
});
