import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Finanças Pessoais',
    short_name: 'Finanças',
    description: 'Aplicativo pessoal de controle financeiro',
    start_url: '/admin/transactions',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#10B981',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
