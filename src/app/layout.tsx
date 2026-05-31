import { QueryProvider } from '@/providers/query-provider'
import { SessionProvider } from '@/providers/session-provider'
import { SpaceProvider } from '@/providers/space-provider'
import { ThemeConfigProvider } from '@/providers/theme-config-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Outfit } from 'next/font/google'

import { InstallPromptCapture } from '@/components/pwa/install-prompt-capture'
import { ServiceWorkerRegister } from '@/components/pwa/sw-register'
import { Toaster } from '@/components/ui/sonner'

import './globals.css'

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
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
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${outfit.variable} antialiased`}>
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
                  {children}
                  <Analytics />
                  <Toaster
                    expand
                    richColors
                    toastOptions={{
                      duration: 5000,
                    }}
                  />
                </SpaceProvider>
              </QueryProvider>
            </SessionProvider>
          </ThemeConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
