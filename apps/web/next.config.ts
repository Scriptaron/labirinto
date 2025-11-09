import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  async rewrites() {
    const locales = ['pt', 'en', 'es'];
    const rewrites = [];
    
    // Rewrites para cada locale
    for (const locale of locales) {
      rewrites.push(
        {
          source: `/${locale}/blog`,
          destination: `http://localhost:4321/${locale}/blog`,
        },
        {
          source: `/${locale}/blog/:path*`,
          destination: `http://localhost:4321/${locale}/blog/:path*`,
        }
      );
    }
    
    return rewrites;
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
