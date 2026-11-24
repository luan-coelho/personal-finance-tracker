'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type * as React from 'react'

import { isActivePath, primaryNavItems } from '@/components/layout/navigation'
import { Icon, type IconName } from '@/components/ui/icon'
import { useSidebar } from '@/components/ui/sidebar'

import { cn } from '@/lib/utils'

const itemClass =
  'group/bottom-nav-item flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-1 rounded-control border-0 bg-transparent p-0 text-xs leading-4 font-medium text-muted-foreground no-underline outline-none focus-visible:shadow-focus-ring data-active:font-semibold data-active:text-primary-text'

function BottomNavItemContent({ icon, label, active }: { icon: IconName; label: string; active: boolean }) {
  return (
    <>
      {/* Indicador 44×40, o mesmo tile do item ativo da sidebar recolhida. */}
      <span
        className={cn(
          'rounded-control inline-flex h-10 w-11 items-center justify-center transition-colors duration-120',
          active ? 'bg-primary-soft' : 'group-active/bottom-nav-item:bg-accent',
        )}>
        <Icon name={icon} size={24} strokeWidth={active ? 1.75 : 1.5} />
      </span>
      <span className="max-w-full truncate">{label}</span>
    </>
  )
}

/**
 * Radar BottomNav: navegação do mobile (abaixo de `lg`). 72px mais a safe area, fundo `card`,
 * borda superior `border-subtle`, rótulo sempre visível. "Mais" abre o drawer com os demais
 * destinos, a conta e o espaço.
 */
export function BottomNav({ className, ...props }: React.ComponentProps<'nav'>) {
  const pathname = usePathname()
  const { openMobile, setOpenMobile } = useSidebar()
  const inPrimary = primaryNavItems.some(item => isActivePath(pathname, item.href))

  return (
    <nav
      aria-label="Navegação principal"
      data-slot="bottom-nav"
      className={cn(
        'border-border bg-card pb-safe-bottom fixed inset-x-0 bottom-0 z-30 border-t lg:hidden print:hidden',
        className,
      )}
      {...props}>
      <ul className="h-bottom-nav m-0 flex list-none items-start px-1 pt-1.5">
        {primaryNavItems.map(item => {
          const active = isActivePath(pathname, item.href)
          return (
            <li key={item.href} className="flex min-w-0 flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                data-active={active || undefined}
                className={itemClass}>
                <BottomNavItemContent icon={item.icon} label={item.label} active={active} />
              </Link>
            </li>
          )
        })}
        <li className="flex min-w-0 flex-1">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={openMobile}
            data-active={!inPrimary || undefined}
            className={itemClass}
            onClick={() => setOpenMobile(true)}>
            <BottomNavItemContent icon="menu" label="Mais" active={!inPrimary} />
          </button>
        </li>
      </ul>
    </nav>
  )
}
