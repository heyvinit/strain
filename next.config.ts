import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  outputFileTracingIncludes: {
    '/api/scrape': ['./node_modules/@sparticuz/chromium/**/*'],
  },
}

export default nextConfig
