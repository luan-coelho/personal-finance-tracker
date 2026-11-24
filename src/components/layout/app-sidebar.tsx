'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'

import { useSignOut } from '@/components/auth/sign-out-button'
import { UserAvatar } from '@/components/auth/user-avatar'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { IconButton } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Icon, type IconName } from '@/components/ui/icon'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'

import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useSpaces } from '@/hooks/use-spaces'

import { useSession } from '@/lib/auth-client'
import { routes } from '@/lib/routes'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: IconName
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    title: 'Finanças',
    items: [
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

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppSidebar() {
  const pathname = usePathname()
  const { state, isMobile, setOpenMobile } = useSidebar()
  // No drawer (< 1024px) a sidebar fica sempre expandida.
  const collapsed = state === 'collapsed' && !isMobile

  const closeDrawer = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarBrand collapsed={collapsed} />

      <SidebarContent>
        <nav
          aria-label="Navegação principal"
          className="flex flex-col gap-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-1">
          {navGroups.map((group, index) => (
            <Fragment key={group.title}>
              {collapsed && index > 0 && <SidebarSeparator />}
              <SidebarGroup>
                <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                <SidebarMenu>
                  {group.items.map(item => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActivePath(pathname, item.href)} tooltip={item.label}>
                        <Link href={item.href} onClick={closeDrawer}>
                          <Icon name={item.icon} size={20} />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            </Fragment>
          ))}
        </nav>
      </SidebarContent>

      <SidebarFooter>
        {!collapsed && <InstallPrompt />}
        <AccountMenu collapsed={collapsed} />
      </SidebarFooter>
    </Sidebar>
  )
}

function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  const { toggleSidebar, isMobile, setOpenMobile } = useSidebar()

  if (collapsed) {
    return (
      <SidebarHeader>
        <Link
          href={routes.frontend.admin.index}
          aria-label="Família Coelho"
          className="focus-visible:shadow-focus-ring rounded-lg outline-none">
          <span className="bg-primary-soft text-primary-soft-fg inline-flex size-7 items-center justify-center rounded-lg text-[15px] leading-none font-semibold">
            F
          </span>
        </Link>
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Expandir menu"
          className="bg-muted text-muted-foreground hover:text-foreground focus-visible:shadow-focus-ring inline-flex size-control-md shrink-0 items-center justify-center rounded-control outline-none transition-colors duration-150">
          <Icon name="sidebar-expand" size={20} />
        </button>
      </SidebarHeader>
    )
  }

  return (
    <SidebarHeader>
      <Link
        href={routes.frontend.admin.index}
        className="focus-visible:shadow-focus-ring min-w-0 rounded-sm text-lg leading-6 font-semibold tracking-[-0.01em] whitespace-nowrap outline-none">
        Família Coelho
      </Link>
      {isMobile ? (
        <IconButton
          icon="x"
          label="Fechar menu"
          size="sm"
          onClick={() => setOpenMobile(false)}
        />
      ) : (
        <IconButton
          icon="sidebar-collapse"
          label="Recolher menu"
          size="sm"
          onClick={toggleSidebar}
        />
      )}
    </SidebarHeader>
  )
}

const menuItemClass =
  'flex w-full cursor-pointer items-center gap-3 rounded-control p-2.5 text-sm leading-5 text-foreground outline-none focus:bg-accent data-[highlighted]:bg-accent [&_svg]:text-current'

function AccountMenu({ collapsed }: { collapsed: boolean }) {
  const { data: session, status } = useSession()
  const { selectedSpace, setSelectedSpace, isLoading: spaceLoading } = useSelectedSpace()
  const { data: spaces, isLoading: spacesLoading } = useSpaces()
  const { signOut, isPending: signingOut } = useSignOut()
  const { isMobile, setOpenMobile } = useSidebar()

  if (status === 'loading') {
    return collapsed ? (
      <Skeleton className="size-control-sm rounded-full" />
    ) : (
      <div className="flex items-center gap-2.5 px-2.5 py-2">
        <Skeleton className="size-control-sm rounded-full" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2.5 w-32" />
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  const { name, email } = session.user
  const spacesBusy = spaceLoading || spacesLoading

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {collapsed ? (
          <button
            type="button"
            aria-label={`Conta de ${name}`}
            className="focus-visible:shadow-focus-ring rounded-full outline-none">
            <UserAvatar />
          </button>
        ) : (
          <button
            type="button"
            className="hover:bg-accent data-[state=open]:bg-accent focus-visible:shadow-focus-ring text-foreground flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left outline-none transition-colors duration-150">
            <UserAvatar />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[13px] leading-[18px] font-medium">{name}</span>
              <span className="text-muted-foreground truncate text-[11px] leading-4">{email}</span>
            </span>
            <Icon name="chevrons-up-down" size={16} className="text-muted-foreground" />
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align="start"
        sideOffset={8}
        className={cn(
          'bg-popover text-foreground border-border shadow-sh-lg flex flex-col gap-0.5 rounded-2xl border p-1.5',
          collapsed ? 'w-72' : 'w-(--radix-dropdown-menu-trigger-width)',
        )}>
        <DropdownMenuLabel className="flex items-center gap-3 px-2.5 py-2 font-normal">
          <UserAvatar size="lg" />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm leading-5 font-semibold">{name}</span>
            <span className="text-muted-foreground truncate text-xs leading-4">{email}</span>
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-border mx-0 my-1 h-px" />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-muted-foreground px-2.5 pt-1.5 pb-0.5 text-xs leading-4 font-medium">
            Espaço
          </DropdownMenuLabel>

          {spacesBusy ? (
            <div className="flex items-center gap-3 px-2.5 py-2">
              <Skeleton className="size-7 rounded-lg" />
              <Skeleton className="h-3 w-28" />
            </div>
          ) : spaces && spaces.length > 0 ? (
            spaces.map(space => {
              const isCurrent = space.id === selectedSpace?.id
              return (
                <DropdownMenuItem
                  key={space.id}
                  onSelect={() => {
                    if (!isCurrent) setSelectedSpace(space)
                  }}
                  aria-current={isCurrent ? 'true' : undefined}
                  className={cn(menuItemClass, 'px-2.5 py-2', isCurrent && 'bg-accent')}>
                  <span
                    className={cn(
                      'inline-flex size-7 shrink-0 items-center justify-center rounded-lg',
                      isCurrent ? 'bg-primary-soft text-primary-soft-fg' : 'bg-muted text-muted-foreground',
                    )}>
                    <Icon name="building-2" size={16} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate leading-[18px] font-medium">{space.name}</span>
                    {space.description && (
                      <span className="text-muted-foreground truncate text-xs leading-4">{space.description}</span>
                    )}
                  </span>
                  {isCurrent && <Icon name="check" size={16} className="text-primary" />}
                </DropdownMenuItem>
              )
            })
          ) : (
            <p className="text-muted-foreground px-2.5 py-2 text-sm leading-5">Nenhum espaço ainda.</p>
          )}

          <DropdownMenuItem asChild className={menuItemClass}>
            <Link
              href={routes.frontend.admin.spaces.create}
              onClick={() => {
                if (isMobile) setOpenMobile(false)
              }}>
              <Icon name="plus" size={20} />
              Criar espaço
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-border mx-0 my-1 h-px" />

        <DropdownMenuItem
          onSelect={signOut}
          disabled={signingOut}
          className={cn(
            menuItemClass,
            'text-error-text hover:bg-error-soft focus:bg-error-soft focus:text-error-text data-[highlighted]:bg-error-soft data-[highlighted]:text-error-text',
          )}>
          <Icon name="log-out" size={20} />
          {signingOut ? 'Saindo' : 'Sair'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
