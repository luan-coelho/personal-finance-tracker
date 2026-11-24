'use client'

import { AppSidebar } from '@/components/layout/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

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
 */
export function AppLayout({ children, defaultOpen = true }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <MonthSelectorProvider>
        <AppSidebar />
        <SidebarInset>
          <div data-slot="app-content" className="flex flex-1 flex-col gap-6 px-4 pb-8 sm:px-8">
            {children}
          </div>
        </SidebarInset>
      </MonthSelectorProvider>
    </SidebarProvider>
  )
}
