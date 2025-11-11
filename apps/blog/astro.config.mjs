// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://labirinto.tech',
	// Modo estático para máximo desempenho (não precisa de adapter/SSR)
	output: 'static',
	i18n: {
		defaultLocale: 'pt',
		locales: ['pt', 'en', 'es'],
		routing: {
			prefixDefaultLocale: true
		}
	},
	integrations: [mdx(), sitemap()],
	server: {
		port: 4321,
		open: '/pt/blog',
	}
});
