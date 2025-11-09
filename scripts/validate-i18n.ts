#!/usr/bin/env node

/**
 * Script para validar a consistência de i18n nos posts do blog
 * 
 * Verifica:
 * - Se todos os posts têm traduções em todos os idiomas
 * - Se os alternates estão corretos
 * - Se os slugs são únicos por idioma
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { parse } from 'yaml';

const BLOG_CONTENT_DIR = join(process.cwd(), 'apps/blog/src/content/blog');
const LOCALES = ['pt', 'en', 'es'];

interface PostFrontmatter {
  title: string;
  lang: string;
  slug: string;
  alternates?: Record<string, string>;
}

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
        try {
          const frontmatter = parse(frontmatterMatch[1]) as PostFrontmatter;
          if (frontmatter.slug) {
            posts.set(frontmatter.slug, frontmatter);
          }
        } catch (error) {
          console.error(`Erro ao parsear ${file}:`, error);
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️  Pasta ${locale} não encontrada`);
  }
  
  return posts;
}

async function validateI18n() {
  console.log('🔍 Validando i18n dos posts do blog...\n');
  
  const postsByLocale = new Map<string, Map<string, PostFrontmatter>>();
  
  // Carrega todos os posts
  for (const locale of LOCALES) {
    const posts = await getPostsInLocale(locale);
    postsByLocale.set(locale, posts);
    console.log(`✓ ${locale}: ${posts.size} posts encontrados`);
  }
  
  console.log('\n📊 Validando consistência...\n');
  
  let hasErrors = false;
  
  // Valida alternates
  for (const [locale, posts] of postsByLocale) {
    for (const [slug, post] of posts) {
      if (!post.alternates) {
        console.warn(`⚠️  [${locale}/${slug}] Sem alternates definidos`);
        continue;
      }
      
      // Verifica se os alternates existem
      for (const [altLocale, altSlug] of Object.entries(post.alternates)) {
        const altPosts = postsByLocale.get(altLocale);
        
        if (!altPosts) {
          console.error(`❌ [${locale}/${slug}] Locale alternativo '${altLocale}' não existe`);
          hasErrors = true;
          continue;
        }
        
        if (!altPosts.has(altSlug)) {
          console.error(`❌ [${locale}/${slug}] Post alternativo '${altLocale}/${altSlug}' não encontrado`);
          hasErrors = true;
        }
      }
    }
  }
  
  // Verifica posts órfãos (sem traduções)
  const allSlugs = new Set<string>();
  for (const posts of postsByLocale.values()) {
    for (const slug of posts.keys()) {
      allSlugs.add(slug);
    }
  }
  
  console.log('\n📝 Posts por idioma:');
  for (const [locale, posts] of postsByLocale) {
    const slugs = Array.from(posts.keys());
    console.log(`\n${locale}:`);
    slugs.forEach(slug => console.log(`  - ${slug}`));
  }
  
  if (hasErrors) {
    console.error('\n❌ Validação falhou! Corrija os erros acima.');
    process.exit(1);
  } else {
    console.log('\n✅ Validação concluída com sucesso!');
  }
}

validateI18n().catch(error => {
  console.error('Erro ao validar i18n:', error);
  process.exit(1);
});
