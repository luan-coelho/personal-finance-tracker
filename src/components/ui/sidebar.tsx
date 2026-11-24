'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { Dialog as DialogPrimitive, Slot } from 'radix-ui'
import * as React from 'react'

import { IconButton } from '@/components/ui/button'
import type { IconName } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { useIsMobile } from '@/hooks/use-mobile'

import { cn } from '@/lib/utils'

/*
 * Radar AppSidebar sobre a API do shadcn.
 * ≥ 1024px: fixa à esquerda, `card` com borda direita, 272px expandida ou 72px recolhida (só ícones).
 * < 1024px: drawer sobre o scrim `overlay`, sempre expandido.
 */

// Lido em `src/app/admin/layout.tsx` (server) para o estado inicial; mantenha os dois em sincronia.
const SIDEBAR_COOKIE_NAME = 'sidebar_state'
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = 'var(--sidebar-expanded)'
const SIDEBAR_WIDTH_ICON = 'var(--sidebar-collapsed)'
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

type SidebarContextProps = {
  state: 'expanded' | 'collapsed'
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.')
  }

  return context
}

/** Igual a `useSidebar`, mas devolve `null` fora do `SidebarProvider` (ex.: PageHeader na vitrine). */
function useSidebarOptional() {
  return React.useContext(SidebarContext)
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  // Estado interno; `open`/`onOpenChange` permitem controle externo.
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      // Guarda o estado no cookie para manter entre telas e recargas.
      // biome-ignore lint/suspicious/noDocumentCookie: padrão do shadcn para persistir o estado da sidebar
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open],
  )

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile(value => !value) : setOpen(value => !value)
  }, [isMobile, setOpen])

  // Atalho ⌘B / Ctrl+B.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleSidebar])

  // Fecha o drawer ao passar para a sidebar fixa.
  React.useEffect(() => {
    if (!isMobile) setOpenMobile(false)
  }, [isMobile])

  const state = open ? 'expanded' : 'collapsed'

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, toggleSidebar],
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-slot="sidebar-wrapper"
        style={
          {
            '--sidebar-width': SIDEBAR_WIDTH,
            '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
            ...style,
          } as React.CSSProperties
        }
        className={cn('group/sidebar-wrapper bg-background flex min-h-svh w-full', className)}
        {...props}>
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

function Sidebar({
  side = 'left',
  variant = 'sidebar',
  collapsible = 'icon',
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  side?: 'left' | 'right'
  variant?: 'sidebar' | 'floating' | 'inset'
  collapsible?: 'offcanvas' | 'icon' | 'none'
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === 'none') {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          'bg-card text-foreground border-border flex h-full w-(--sidebar-width) flex-col gap-4 border-r px-3 py-5',
          className,
        )}
        {...props}>
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <DialogPrimitive.Root open={openMobile} onOpenChange={setOpenMobile}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay
            data-slot="sidebar-overlay"
            className="bg-overlay data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 fixed inset-0 z-50 duration-200"
          />
          <DialogPrimitive.Content
            data-sidebar="sidebar"
            data-slot="sidebar"
            data-mobile="true"
            data-side={side}
            aria-describedby={undefined}
            className={cn(
              'bg-card text-foreground border-border fixed inset-y-0 z-50 flex h-full w-(--sidebar-width) max-w-[calc(100vw-48px)] flex-col gap-4 px-3 py-5 text-sm leading-5 outline-none duration-200',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              side === 'left'
                ? 'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left left-0 border-r'
                : 'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right right-0 border-l',
              className,
            )}
            {...props}>
            <DialogPrimitive.Title className="sr-only">Menu de navegação</DialogPrimitive.Title>
            {children}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    )
  }

  return (
    <div
      className="group peer text-foreground hidden lg:block"
      data-state={state}
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar">
      {/* Reserva o espaço da sidebar fixa no fluxo do layout */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          'relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-out',
          'group-data-[collapsible=offcanvas]:w-0',
          'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
        )}
      />
      <div
        data-slot="sidebar-container"
        data-side={side}
        className={cn(
          'bg-card border-border fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) overflow-hidden transition-[left,right,width] duration-200 ease-out lg:flex',
          'data-[side=left]:left-0 data-[side=left]:border-r data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]',
          'data-[side=right]:right-0 data-[side=right]:border-l data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
          'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
          className,
        )}
        {...props}>
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="flex size-full flex-col gap-4 px-3 py-5 text-sm leading-5 group-data-[collapsible=icon]:items-center">
          {children}
        </div>
      </div>
    </div>
  )
}

function SidebarTrigger({
  onClick,
  icon = 'menu',
  label = 'Abrir menu',
  ...props
}: Omit<React.ComponentProps<typeof IconButton>, 'icon' | 'label'> & {
  icon?: IconName
  label?: string
}) {
  const { toggleSidebar } = useSidebar()

  return (
    <IconButton
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      icon={icon}
      label={label}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    />
  )
}

function SidebarRail({ className, ...props }: React.ComponentProps<'button'>) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      type="button"
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Recolher ou expandir menu"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Recolher ou expandir menu"
      className={cn(
        'hover:after:bg-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-colors after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 group-data-[side=left]:-right-4 group-data-[side=right]:left-0 lg:flex',
        'in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize',
        '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
        className,
      )}
      {...props}
    />
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<'main'>) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn('bg-background relative flex w-full min-w-0 flex-1 flex-col', className)}
      {...props}
    />
  )
}

function SidebarInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  return <Input data-slot="sidebar-input" data-sidebar="input" className={cn('w-full', className)} {...props} />
}

function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn(
        'flex shrink-0 items-center justify-between gap-2 px-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-3 group-data-[collapsible=icon]:px-0',
        className,
      )}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn('relative flex shrink-0 flex-col gap-3 group-data-[collapsible=icon]:items-center', className)}
      {...props}
    />
  )
}

function SidebarSeparator({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role="separator"
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn('bg-border my-1.5 h-px w-6 shrink-0', className)}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        // -m-1 p-1: espaço para o anel de foco dos itens dentro da área rolável.
        '-m-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        'group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-1',
        className,
      )}
      {...props}
    />
  )
}

function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn(
        'relative flex w-full min-w-0 flex-col gap-0.5 group-data-[collapsible=icon]:items-center',
        className,
      )}
      {...props}
    />
  )
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'div'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'div'

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        'text-muted-foreground focus-visible:shadow-focus-ring flex shrink-0 items-center px-2.5 pb-1.5 text-xs leading-4 font-medium outline-none group-data-[collapsible=icon]:hidden [&>svg]:size-4 [&>svg]:shrink-0',
        className,
      )}
      {...props}
    />
  )
}

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        'text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:shadow-focus-ring absolute top-0 right-2 flex size-6 items-center justify-center rounded-sm outline-none group-data-[collapsible=icon]:hidden [&>svg]:size-4 [&>svg]:shrink-0',
        className,
      )}
      {...props}
    />
  )
}

function SidebarGroupContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn('w-full text-sm', className)}
      {...props}
    />
  )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn('flex w-full min-w-0 flex-col gap-0.5 group-data-[collapsible=icon]:items-center', className)}
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn('group/menu-item relative w-full group-data-[collapsible=icon]:w-auto', className)}
      {...props}
    />
  )
}

const sidebarMenuButtonVariants = cva(
  [
    // Item Radar: 40px mínimo, raio 10, ícone 20, rótulo 14/500, hover `accent`.
    'peer/menu-button group/menu-button text-foreground flex w-full items-center gap-3 overflow-hidden rounded-control px-2.5 py-2 text-left text-sm leading-5 font-medium outline-none transition-colors duration-150',
    'hover:bg-accent focus-visible:shadow-focus-ring',
    'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
    // Ativo: seleção suave `primary-soft` + `primary-text`, 600, traço 1,75.
    'data-[active=true]:bg-primary-soft data-[active=true]:text-primary-text data-[active=true]:hover:bg-primary-soft data-[active=true]:font-semibold data-[active=true]:[&_svg]:[stroke-width:1.75]',
    '[&_svg]:size-icon-md [&_svg]:shrink-0 [&>span:last-child]:truncate',
    'group-has-data-[sidebar=menu-action]/menu-item:pr-8',
    // Recolhida: tile 44×40, ícone 22, sem rótulo.
    'group-data-[collapsible=icon]:h-control-md group-data-[collapsible=icon]:w-control-lg group-data-[collapsible=icon]:min-h-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:[&_svg]:size-[22px] group-data-[collapsible=icon]:[&>span]:hidden',
  ].join(' '),
  {
    variants: {
      variant: {
        default: '',
        outline: 'border-input bg-card border',
      },
      size: {
        default: 'min-h-control-md',
        sm: 'min-h-control-sm text-xs',
        lg: 'min-h-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = 'default',
  size = 'default',
  tooltip,
  className,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot.Root : 'button'
  const { isMobile, state } = useSidebar()

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      aria-current={isActive ? 'page' : undefined}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  )

  if (!tooltip) {
    return button
  }

  const tooltipProps = typeof tooltip === 'string' ? { children: tooltip } : tooltip

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" align="center" hidden={state !== 'collapsed' || isMobile} {...tooltipProps} />
    </Tooltip>
  )
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean
  showOnHover?: boolean
}) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        'text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:shadow-focus-ring absolute top-2 right-1.5 flex size-6 items-center justify-center rounded-sm outline-none group-data-[collapsible=icon]:hidden peer-data-[size=sm]/menu-button:top-1 peer-data-[size=lg]/menu-button:top-3 [&>svg]:size-4 [&>svg]:shrink-0',
        showOnHover &&
          'group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 aria-expanded:opacity-100 lg:opacity-0',
        className,
      )}
      {...props}
    />
  )
}

function SidebarMenuBadge({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        'text-muted-foreground peer-data-[active=true]/menu-button:text-primary-text pointer-events-none absolute top-2.5 right-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium tabular-nums select-none group-data-[collapsible=icon]:hidden peer-data-[size=sm]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-3.5',
        className,
      )}
      {...props}
    />
  )
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<'div'> & {
  showIcon?: boolean
}) {
  // Largura aleatória entre 50 e 90%.
  const [width] = React.useState(() => `${Math.floor(Math.random() * 40) + 50}%`)

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn('flex h-control-md items-center gap-3 rounded-control px-2.5', className)}
      {...props}>
      {showIcon && <Skeleton className="size-icon-md rounded-sm" data-sidebar="menu-skeleton-icon" />}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={{ '--skeleton-width': width } as React.CSSProperties}
      />
    </div>
  )
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        'border-border ml-5 flex min-w-0 flex-col gap-0.5 border-l py-0.5 pl-2.5 group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  )
}

function SidebarMenuSubItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn('group/menu-sub-item relative', className)}
      {...props}
    />
  )
}

function SidebarMenuSubButton({
  asChild = false,
  size = 'md',
  isActive = false,
  className,
  ...props
}: React.ComponentProps<'a'> & {
  asChild?: boolean
  size?: 'sm' | 'md'
  isActive?: boolean
}) {
  const Comp = asChild ? Slot.Root : 'a'

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        'text-foreground hover:bg-accent focus-visible:shadow-focus-ring flex min-h-control-sm min-w-0 items-center gap-2 overflow-hidden rounded-control px-2.5 font-medium outline-none transition-colors duration-150 group-data-[collapsible=icon]:hidden',
        'aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[size=md]:text-sm data-[size=sm]:text-xs',
        'data-[active=true]:bg-primary-soft data-[active=true]:text-primary-text data-[active=true]:font-semibold',
        '[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
        className,
      )}
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
  useSidebarOptional,
}
