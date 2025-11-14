import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Habilitar output standalone para Docker
  output: "standalone",

  async rewrites() {
    const locales = ['pt', 'en', 'es'];
    const rewrites = [];

    // PostHog rewrites (without locale prefix)
    rewrites.push(
      {
        source: '/ingest/static/:path*',
        destination: 'https://eu-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://eu.i.posthog.com/:path*',
      }
    );

    // PostHog rewrites (with locale prefix)
    for (const locale of locales) {
      rewrites.push(
        {
          source: `/${locale}/ingest/static/:path*`,
          destination: 'https://eu-assets.i.posthog.com/static/:path*',
        },
        {
          source: `/${locale}/ingest/:path*`,
          destination: 'https://eu.i.posthog.com/:path*',
        }
      );
    }

    return rewrites;
  },

  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
