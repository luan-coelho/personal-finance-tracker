import type { IconName } from '@/components/ui/icon'

import { routes } from '@/lib/routes'

export interface NavItem {
  label: string
  href: string
  icon: IconName
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

/** Destinos do app, na ordem da AppSidebar. O primeiro grupo também alimenta a BottomNav. */
export const navGroups: NavGroup[] = [
  {
    title: 'Finanças',
    items: [
      { label: 'Início', href: routes.frontend.admin.home.index, icon: 'home' },
      { label: 'Transações', href: routes.frontend.admin.transactions.index, icon: 'credit-card' },
      { label: 'Orçamentos', href: routes.frontend.admin.budgets.index, icon: 'target' },
      { label: 'Reservas', href: routes.frontend.admin.reserves.index, icon: 'piggy-bank' },
    ],
  },
  {
    title: 'Cadastros',
    items: [
      { label: 'Categorias', href: routes.frontend.admin.categories.index, icon: 'folder-tree' },
      { label: 'Tags', href: routes.frontend.admin.tags.index, icon: 'tag' },
    ],
  },
  {
    title: 'Administração',
    items: [
      { label: 'Espaços', href: routes.frontend.admin.spaces.index, icon: 'building-2' },
      { label: 'Usuários', href: routes.frontend.admin.users.index, icon: 'users' },
    ],
  },
]

/** Destinos da BottomNav (Radar: 3 a 5); o resto fica em "Mais", que abre o drawer. */
export const primaryNavItems: NavItem[] = navGroups[0].items

const allNavItems = navGroups.flatMap(group => group.items)

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** Raiz de um módulo (lista), onde a BottomNav aparece; telas internas usam só a AppBar com "voltar". */
export function isRootPath(pathname: string) {
  return allNavItems.some(item => item.href === pathname)
}

/** Telas-raiz de finanças, onde o FAB "Nova transação" aparece. */
export function isPrimaryRootPath(pathname: string) {
  return primaryNavItems.some(item => item.href === pathname)
}
