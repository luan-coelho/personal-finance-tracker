import type * as React from 'react'

import { Icon, type IconName } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

interface FabProps extends Omit<React.ComponentProps<'button'>, 'children'> {
  /** Verbo + objeto ("Nova transação"). No FAB recolhido vira `aria-label`; no estendido é o texto visível. */
  label: string
  /** Ícone Radar; `plus` por padrão. */
  icon?: IconName
  /** Mostra o rótulo ao lado do ícone (ícone 24 + texto 16/600). */
  extended?: boolean
}

/**
 * Radar Fab: ação de criação principal no mobile. 56px, `radius-lg`, `primary` + `primary-fg`,
 * elevação `sh-md` (cai para `sh-sm` no pressionado). Um por tela; o posicionamento é de quem usa.
 */
function Fab({ label, icon = 'plus', extended = false, className, type, ...props }: FabProps) {
  return (
    <button
      type={type ?? 'button'}
      data-slot="fab"
      aria-label={extended ? undefined : label}
      className={cn(
        'bg-primary text-primary-foreground shadow-sh-md inline-flex h-14 min-w-14 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 text-base leading-6 font-semibold whitespace-nowrap outline-none select-none',
        'transition-[background-color,box-shadow,color] duration-120',
        'hover:bg-primary-hover active:bg-primary-active active:shadow-sh-sm active:text-white',
        'focus-visible:shadow-[var(--sh-md),var(--focus-ring)]',
        'disabled:cursor-not-allowed disabled:opacity-45',
        extended ? 'pr-6 pl-5' : 'w-14 p-0',
        className,
      )}
      {...props}>
      <Icon name={icon} size={extended ? 24 : 26} strokeWidth={1.75} />
      {extended && <span>{label}</span>}
    </button>
  )
}

export type { FabProps }
export { Fab }
