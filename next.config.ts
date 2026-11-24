import withSerwistInit from '@serwist/next'
import type { NextConfig } from 'next'

import { routes } from '@/lib/routes'

// Muda a cada build: a página de fallback offline é buscada de novo quando o app é atualizado.
const buildRevision = process.env.VERCEL_GIT_COMMIT_SHA ?? Date.now().toString()

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  // Recarregar ao reconectar apagaria um formulário pela metade; o React Query já refaz as consultas.
  reloadOnOnline: false,
  // O registro é feito por `ServiceWorkerRegister`; sem isto o worker seria registrado duas vezes.
  register: false,
  // Sem esta entrada `/~offline` nunca entra no precache e o fallback offline do `sw.ts` não acha a página.
  // Definir a lista substitui o precache automático de `public/` (só ícones, que o cache de imagens cobre).
  additionalPrecacheEntries: [{ url: '/~offline', revision: buildRevision }],
  disable: process.env.NODE_ENV === 'development',
})

const nextConfig: NextConfig = {
  serverExternalPackages: ['ws'],
  experimental: {
    // Rotas ainda dinâmicas (ex.: `[id]`) reaproveitam o cache do roteador por 30s ao voltar a elas,
    // em vez de pedir de novo ao servidor e mostrar o `loading.tsx`. O padrão desde o Next 15 é 0.
    staleTimes: { dynamic: 30 },
  },
  redirects: async () => [
    {
      source: routes.frontend.home,
      destination: routes.frontend.admin.index,
      permanent: false,
    },
    {
      source: '/admin',
      destination: routes.frontend.admin.index,
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
