import { QueryProvider } from '@/providers/query-provider'
import { SessionProvider } from '@/providers/session-provider'
import { SpaceProvider } from '@/providers/space-provider'
import { ThemeConfigProvider } from '@/providers/theme-config-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { Toaster } from '@/components/ui/sonner'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Finanças Pessoais',
  description: 'Aplicativo pessoal de controle financeiro.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
