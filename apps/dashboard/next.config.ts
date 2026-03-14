import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@assist/ui', '@assist/shared-types'],
  experimental: {
    optimizePackageImports: ['@assist/ui', 'lucide-react'],
  },
};

export default nextConfig;
