'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { Toggle as TogglePrimitive } from 'radix-ui'
import type * as React from 'react'

import { Icon, type IconName } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

/**
 * Radar ToggleButton (`.sst-toggle`): cápsula outline de 40px, padding 14, 14/20 500.
 * Desligado: hover igual ao Button outline (`accent` + `border-strong`).
 * Ligado (`aria-pressed`): borda `primary`, fundo `primary-soft`, texto `primary-soft-fg`.
 */
const toggleVariants = cva(
  [
    'group/toggle border-input bg-card text-foreground inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border text-sm font-medium whitespace-nowrap outline-none',
    'transition-[background-color,border-color,color,box-shadow] duration-120',
    'hover:not-disabled:not-aria-pressed:border-border-strong hover:not-disabled:not-aria-pressed:bg-accent',
    'focus-visible:shadow-focus-ring',
    'disabled:cursor-not-allowed disabled:opacity-45',
    'aria-pressed:border-primary aria-pressed:bg-primary-soft aria-pressed:text-primary-soft-fg aria-pressed:hover:not-disabled:border-primary-hover',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  {
    variants: {
      size: {
        md: 'h-control-md px-3.5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

interface ToggleProps extends React.ComponentProps<typeof TogglePrimitive.Root>, VariantProps<typeof toggleVariants> {
  /** Ícone Radar de 18px à esquerda (`filter`, `sliders`, `eye`). */
  icon?: IconName
  /** Itens ativos, exibido como " · 3" com algarismos tabulares. Omita quando zero. */
  count?: number | string
}

function Toggle({ className, size = 'md', icon, count, children, ...props }: ToggleProps) {
  return (
    <TogglePrimitive.Root data-slot="toggle" className={cn(toggleVariants({ size, className }))} {...props}>
      {icon ? <Icon name={icon} size={18} /> : null}
      {count != null && count !== '' ? (
        <span>
          {children}
          <span className="tabular-nums">{` · ${count}`}</span>
        </span>
      ) : (
        children
      )}
    </TogglePrimitive.Root>
  )
}

export type { ToggleProps }
export { Toggle, toggleVariants }
