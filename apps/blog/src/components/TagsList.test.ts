import { describe, it, expect } from 'vitest';

// Mock dos dados de tags
const mockTags = {
  'astro': { name: 'Astro Framework', slug: 'astro' },
  'react': { name: 'React.js', slug: 'react' }
};

// Função auxiliar que simula a lógica do componente TagsList
function processTags(tags: string[], locale: string) {
  return tags.map(tagId => {
    // @ts-ignore - Mocking data access
    const tagData = mockTags[tagId];
    const slug = tagData?.slug || tagId.toLowerCase().replace(/\s+/g, '-');
    return {
      id: tagId,
      name: tagData?.name || tagId,
      slug,
      url: `/${locale}/blog/tag/${slug}`
    };
  });
}

describe('TagsList Logic', () => {
  it('deve processar lista de tags corretamente', () => {
    const tags = ['astro', 'react'];
    const processed = processTags(tags, 'pt');

    expect(processed).toHaveLength(2);
    expect(processed[0].name).toBe('Astro Framework');
    expect(processed[1].name).toBe('React.js');
  });

  it('deve gerar URLs corretas com locale', () => {
    const tags = ['astro'];
    
    expect(processTags(tags, 'pt')[0].url).toBe('/pt/blog/tag/astro');
    expect(processTags(tags, 'en')[0].url).toBe('/en/blog/tag/astro');
  });

  it('deve lidar com tags desconhecidas (fallback)', () => {
    const tags = ['unknown-tag'];
    const processed = processTags(tags, 'pt');

    expect(processed[0].name).toBe('unknown-tag');
    expect(processed[0].slug).toBe('unknown-tag');
    expect(processed[0].url).toBe('/pt/blog/tag/unknown-tag');
  });

  it('deve normalizar slugs de tags desconhecidas', () => {
    const tags = ['My Tag'];
    const processed = processTags(tags, 'pt');

    expect(processed[0].slug).toBe('my-tag');
    expect(processed[0].url).toBe('/pt/blog/tag/my-tag');
  });
});
