import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Finanças Pessoais',
    short_name: 'Finanças',
    description: 'Aplicativo pessoal de controle financeiro',
    start_url: '/admin/home',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fafaf9',
    // Mesma cor da AppBar (`card`), para a barra de status continuar o app.
    theme_color: '#ffffff',
    lang: 'pt-BR',
    dir: 'ltr',
    categories: ['finance', 'productivity'],
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      // O desenho ocupa o centro sobre fundo cheio (dentro da zona segura de 80%), então os mesmos
      // arquivos servem de ícone adaptável no Android.
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Nova transação',
        short_name: 'Nova',
        // `?new=1` abre o formulário (ver `TransactionComposerProvider`).
        url: '/admin/home?new=1',
        icons: [{ src: '/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Início',
        url: '/admin/home',
        icons: [{ src: '/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Transações',
        url: '/admin/transactions',
        icons: [{ src: '/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Orçamentos',
        url: '/admin/budgets',
        icons: [{ src: '/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Reservas',
        url: '/admin/reserves',
        icons: [{ src: '/icon-192x192.png', sizes: '192x192' }],
      },
    ],
  }
}
