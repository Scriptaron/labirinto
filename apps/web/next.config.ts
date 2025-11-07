import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/blog',
        destination: 'http://localhost:4321/blog',
      },
      {
        source: '/blog/:path*',
        destination: 'http://localhost:4321/blog/:path*',
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
