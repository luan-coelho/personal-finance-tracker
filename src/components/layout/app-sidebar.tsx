'use client'

import { Building2, CreditCard, FolderTree, PiggyBank, Rabbit, Tag, Target, Users } from 'lucide-react'
import Link from 'next/link'

import { InstallPrompt } from '@/components/pwa/install-prompt'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'

import { routes } from '@/lib/routes'

// Menu items principais
const items = [
  {
    title: 'Transações',
    url: routes.frontend.admin.transactions.index,
    icon: CreditCard,
  },
  {
    title: 'Categorias',
    url: routes.frontend.admin.categories.index,
    icon: FolderTree,
  },
  {
    title: 'Tags',
    url: routes.frontend.admin.tags.index,
    icon: Tag,
  },
  {
    title: 'Orçamentos',
    url: routes.frontend.admin.budgets.index,
    icon: Target,
  },
  {
    title: 'Reservas',
    url: routes.frontend.admin.reserves.index,
    icon: PiggyBank,
  },
]

// Menu items de usuários (administração)
const userManagementItems = [
  {
    title: 'Espaços',
    url: routes.frontend.admin.spaces.index,
    icon: Building2,
  },
  {
    title: 'Usuários',
    url: routes.frontend.admin.users.index,
    icon: Users,
  },
]

export function AppSidebar() {
  // Sidebar sempre usa o tema dark
  return (
    <div className="dark">
      <Sidebar className="bg-sidebar" variant="inset">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
              <Rabbit className="h-4 w-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Familia Coelho</span>
              <span className="text-muted-foreground truncate text-xs">Gestão Financeira</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navegação Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {userManagementItems.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <InstallPrompt />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </div>
  )
}
