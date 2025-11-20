import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Schema para categorias
const categorySchema = z.object({
	id: z.string(),
	name: z.record(z.string()), // { pt: 'Desenvolvimento', en: 'Development', es: 'Desarrollo' }
	slug: z.string(),
	description: z.record(z.string()).optional(),
	color: z.string().optional(), // Cor hexadecimal para o badge
});

// Schema para tags
const tagSchema = z.object({
	id: z.string(),
	name: z.string(),
	slug: z.string(),
	description: z.string().optional(),
});

// Categorias predefinidas
export const categories = {
	development: {
		id: 'development',
		name: { pt: 'Desenvolvimento', en: 'Development', es: 'Desarrollo' },
		slug: 'development',
		color: '#6366f1',
	},
	general: {
		id: 'general',
		name: { pt: 'Geral', en: 'General', es: 'General' },
		slug: 'general',
		color: '#8b5cf6',
	},
	tutorial: {
		id: 'tutorial',
		name: { pt: 'Tutorial', en: 'Tutorial', es: 'Tutorial' },
		slug: 'tutorial',
		color: '#ec4899',
	},
	news: {
		id: 'news',
		name: { pt: 'Notícias', en: 'News', es: 'Noticias' },
		slug: 'news',
		color: '#10b981',
	},
} as const;

// Tags predefinidas
export const tags = {
	javascript: { id: 'javascript', name: 'JavaScript', slug: 'javascript' },
	typescript: { id: 'typescript', name: 'TypeScript', slug: 'typescript' },
	react: { id: 'react', name: 'React', slug: 'react' },
	vue: { id: 'vue', name: 'Vue', slug: 'vue' },
	angular: { id: 'angular', name: 'Angular', slug: 'angular' },
	nodejs: { id: 'nodejs', name: 'Node.js', slug: 'nodejs' },
	python: { id: 'python', name: 'Python', slug: 'python' },
	frontend: { id: 'frontend', name: 'Frontend', slug: 'frontend' },
	backend: { id: 'backend', name: 'Backend', slug: 'backend' },
	tutorial: { id: 'tutorial', name: 'Tutorial', slug: 'tutorial' },
	web: { id: 'web', name: 'Web', slug: 'web' },
	programming: { id: 'programming', name: 'Programming', slug: 'programming' },
	hooks: { id: 'hooks', name: 'Hooks', slug: 'hooks' },
	introduction: { id: 'introduction', name: 'Introduction', slug: 'introduction' },
	blog: { id: 'blog', name: 'Blog', slug: 'blog' },
} as const;

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			// Idioma do post
			lang: z.enum(['pt', 'en', 'es']),
			// Slug descritivo no idioma do post
			slug: z.string(),
			// Referências para o mesmo post em outros idiomas
			alternates: z.record(z.string()).optional(),
			// Categoria do post (deve corresponder a uma categoria predefinida)
			category: z.string().optional(),
			// Tags do post (array de strings)
			tags: z.array(z.string()).optional(),
		}),
});

export const collections = { blog };
