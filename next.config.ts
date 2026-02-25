import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow the scraper API route to take up to 30s (some race sites are slow)
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default nextConfig
