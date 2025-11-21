import { describe, it, expect } from 'vitest';

// Mock dos dados de categoria para teste
const mockCategories = {
  'tech': { id: 'tech', name: { pt: 'Tecnologia', en: 'Technology', es: 'Tecnología' }, slug: 'tech', color: '#3b82f6' },
  'life': { id: 'life', name: { pt: 'Vida', en: 'Life', es: 'Vida' }, slug: 'life', color: '#10b981' }
};

// Função auxiliar que simula a lógica do componente CategoryBadge
function getCategoryData(category: string, locale: 'pt' | 'en' | 'es') {
  const categoryKey = category.toLowerCase().replace(/\s+/g, '-');
  const categoryData = Object.values(mockCategories).find(
    cat => cat.slug === categoryKey || cat.id === categoryKey
  );

  return {
    displayName: categoryData?.name[locale] || category,
    url: `/${locale}/blog/category/${categoryKey}`,
    color: categoryData?.color || 'var(--accent)'
  };
}

describe('CategoryBadge Logic', () => {
  it('deve gerar URL correta para categoria existente', () => {
    const data = getCategoryData('tech', 'pt');
    expect(data.url).toBe('/pt/blog/category/tech');
  });

  it('deve gerar URL correta para diferentes locales', () => {
    expect(getCategoryData('tech', 'en').url).toBe('/en/blog/category/tech');
    expect(getCategoryData('tech', 'es').url).toBe('/es/blog/category/tech');
  });

  it('deve retornar nome traduzido correto', () => {
    expect(getCategoryData('tech', 'pt').displayName).toBe('Tecnologia');
    expect(getCategoryData('tech', 'en').displayName).toBe('Technology');
    expect(getCategoryData('tech', 'es').displayName).toBe('Tecnología');
  });

  it('deve lidar com categorias desconhecidas (fallback)', () => {
    const data = getCategoryData('unknown', 'pt');
    expect(data.displayName).toBe('unknown');
    expect(data.url).toBe('/pt/blog/category/unknown');
    expect(data.color).toBe('var(--accent)');
  });

  it('deve normalizar slugs de categoria', () => {
    const data = getCategoryData('My Category', 'pt');
    expect(data.url).toBe('/pt/blog/category/my-category');
  });
});
