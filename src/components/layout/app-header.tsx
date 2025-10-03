'use client'

import { Bell } from 'lucide-react'

import { UserMenu } from '@/components/auth/user-menu'
import { SpaceSelector } from '@/components/layout/space-selector'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'

export function AppHeader() {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />

      <div className="flex flex-1 items-center justify-between">
        {/* Seletor de espaço no lado esquerdo */}
        <div className="flex items-center">
          <SpaceSelector />
        </div>

        {/* Controles do usuário no lado direito */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
