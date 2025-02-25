import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['@repo/ui'],
  images: {
    domains: ['picsum.photos'],
  },
}

export default nextConfig
