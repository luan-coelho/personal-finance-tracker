import type { NextConfig } from 'next'

import { routes } from '@/lib/routes'

const nextConfig: NextConfig = {
  redirects: async () => [
    {
      source: routes.frontend.home,
      destination: routes.frontend.admin.index,
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
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    TZ: 'America/Sao_Paulo',
  },
}

export default nextConfig
