import withSerwistInit from '@serwist/next'
import type { NextConfig } from 'next'

import { routes } from '@/lib/routes'

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
})

const nextConfig: NextConfig = {
  redirects: async () => [
    {
      source: routes.frontend.home,
      destination: routes.frontend.admin.index,
      permanent: false,
    },
    {
      source: '/admin',
      destination: routes.frontend.admin.transactions.index,
      permanent: false,
    },
  ],
  headers: async () => [
    {
      source: '/sw.js',
      headers: [
        { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
        { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        { key: 'Service-Worker-Allowed', value: '/' },
      ],
    },
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    TZ: 'America/Sao_Paulo',
  },
}

export default withSerwist(nextConfig)
