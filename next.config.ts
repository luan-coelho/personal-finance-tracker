import type { NextConfig } from 'next'

import { routes } from '@/lib/routes'

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

export default nextConfig
