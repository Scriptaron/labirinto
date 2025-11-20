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
	integrations: [
		mdx(), 
		sitemap({
			i18n: {
				defaultLocale: 'pt',
				locales: {
					pt: 'pt-BR',
					en: 'en-US',
					es: 'es-ES'
				}
			},
			changefreq: 'weekly',
			priority: 0.7,
			lastmod: new Date()
		})
	],
	server: {
		port: 4321,
		open: '/pt/blog',
	},
	// Otimizações de build
	build: {
		inlineStylesheets: 'auto',
		assets: '_astro'
	},
	// Otimizações de imagem
	image: {
		service: {
			entrypoint: 'astro/assets/services/sharp'
		},
		domains: ['labirinto.tech'],
		remotePatterns: [{ protocol: 'https' }]
	},
	// Compressão e otimização
	compressHTML: true,
	// Prefetch para melhor navegação
	prefetch: {
		prefetchAll: true,
		defaultStrategy: 'viewport'
	},
	// Otimizações experimentais
	experimental: {
		clientPrerender: true,
		contentIntellisense: true
	},
	vite: {
		build: {
			cssMinify: 'lightningcss',
			rollupOptions: {
				output: {
					manualChunks: (id) => {
						// Separar vendor chunks para melhor cache
						if (id.includes('node_modules')) {
							return 'vendor';
						}
					}
				}
			}
		},
		ssr: {
			noExternal: ['@astrojs/mdx']
		}
	}
});
