import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { DM_Mono, DM_Sans } from 'next/font/google'

import { InstallPromptCapture } from '@/components/pwa/install-prompt-capture'
import { ServiceWorkerRegister } from '@/components/pwa/sw-register'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

import { QueryProvider } from '@/providers/query-provider'
import { SessionProvider } from '@/providers/session-provider'
import { SpaceProvider } from '@/providers/space-provider'
import { ThemeConfigProvider } from '@/providers/theme-config-provider'
import { ThemeProvider } from '@/providers/theme-provider'

import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  axes: ['opsz'],
  display: 'swap',
})

const dmMono = DM_Mono({
  variable: '--font-dm-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0e0d' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Finanças Pessoais',
  description: 'Aplicativo pessoal de controle financeiro.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Finanças Pessoais',
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${dmSans.variable} ${dmMono.variable}`}>
      <body className="antialiased">
        <InstallPromptCapture />
        <ServiceWorkerRegister />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="nextjs-boilerplate-theme">
          <ThemeConfigProvider>
            <SessionProvider>
              <QueryProvider>
                <SpaceProvider>
                  <TooltipProvider>
                    {children}
                    <Analytics />
                    <Toaster />
                  </TooltipProvider>
                </SpaceProvider>
              </QueryProvider>
            </SessionProvider>
          </ThemeConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
