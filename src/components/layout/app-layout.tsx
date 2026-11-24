'use client'

import { usePathname } from 'next/navigation'

import { AppSidebar } from '@/components/layout/app-sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { isPrimaryRootPath, isRootPath } from '@/components/layout/navigation'
import { OfflineBanner } from '@/components/layout/offline-banner'
import { TransactionComposerFab, TransactionComposerProvider } from '@/components/transaction-composer'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

import { cn } from '@/lib/utils'

import { MonthSelectorProvider } from '@/providers/month-selector-provider'

interface AppLayoutProps {
  children: React.ReactNode
  /** Estado inicial da sidebar (expandida), lido do cookie no servidor. */
  defaultOpen?: boolean
}

/**
 * Shell Radar: AppSidebar + área de conteúdo sobre `bg`.
 * Sem header global: cada página renderiza seu próprio `<PageHeader>` como primeiro filho,
 * seguido de `<PageActions>` e do conteúdo (blocos com gap de 24px).
 *
 * Abaixo de `lg` (mobile): o PageHeader é a AppBar fixa, as telas-raiz ganham a BottomNav
 * ("Mais" abre a sidebar como drawer) e as de finanças o FAB "Nova transação". Telas internas
 * ficam só com a AppBar e o "voltar".
 */
export function AppLayout({ children, defaultOpen = true }: AppLayoutProps) {
  const pathname = usePathname()
  const hasBottomNav = isRootPath(pathname)
  const hasFab = isPrimaryRootPath(pathname)

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <MonthSelectorProvider>
        <TransactionComposerProvider>
          <AppSidebar />
          <SidebarInset>
            <OfflineBanner />
            <div
              data-slot="app-content"
              className={cn(
                'flex flex-1 flex-col gap-6 px-4 pb-8 sm:px-8',
                // O conteúdo rola por baixo da BottomNav e do FAB: reserva a altura deles e a safe area.
                'max-lg:pb-[calc(var(--safe-bottom)+--spacing(8))]',
                hasBottomNav && 'max-lg:pb-[calc(var(--bottom-nav)+var(--safe-bottom)+--spacing(6))]',
                hasFab && 'max-lg:pb-[calc(var(--bottom-nav)+var(--safe-bottom)+--spacing(22))]',
              )}>
              {children}
            </div>
          </SidebarInset>
          {hasBottomNav && <BottomNav />}
          <TransactionComposerFab />
        </TransactionComposerProvider>
      </MonthSelectorProvider>
    </SidebarProvider>
  )
}
