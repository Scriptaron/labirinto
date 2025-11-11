import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Habilitar output standalone para Docker
  output: "standalone",

  async rewrites() {
    const locales = ['pt', 'en', 'es'];
    const rewrites = [];

    // URL do blog (usar variável de ambiente em produção)
    const blogUrl = process.env.BLOG_URL || 'http://localhost:4321';

    // Rewrites para cada locale
    for (const locale of locales) {
      rewrites.push(
        {
          source: `/${locale}/blog`,
          destination: `${blogUrl}/${locale}/blog`,
        },
        {
          source: `/${locale}/blog/:path*`,
          destination: `${blogUrl}/${locale}/blog/:path*`,
        }
      );
    }

    return rewrites;
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
