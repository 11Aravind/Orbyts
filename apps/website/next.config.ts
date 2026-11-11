import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@orbyt/ui', '@orbyt/shared'],
  async rewrites() {
    return [
      {
        source: '/security.html',
        destination: '/security',
      },
    ];
  },
};

export default nextConfig;
