'use client'

import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import type * as React from 'react'

import { Icon } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

/**
 * Radar Checkbox (`.sst-checkbox`): caixa 20px, raio 6, borda 1,5px `border-strong` sobre `card`.
 * Hover e foco trocam a borda para `primary` (foco soma `focus-ring`); marcada fica sólida em
 * `primary` com check 14 (traço 3) em `primary-fg`; parcial mostra traço 10×2,5.
 * Erro por `aria-invalid`; desabilitada a 45%.
 */
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'group/checkbox peer border-border-strong bg-card text-primary-foreground relative inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm border-[1.5px] outline-none',
        'transition-[border-color,background-color,box-shadow] duration-120',
        'after:absolute after:-inset-x-3 after:-inset-y-2',
        'hover:not-disabled:not-aria-invalid:border-primary focus-visible:not-aria-invalid:border-primary focus-visible:shadow-focus-ring',
        'data-checked:not-aria-invalid:border-primary data-checked:bg-primary data-[state=indeterminate]:not-aria-invalid:border-primary data-[state=indeterminate]:bg-primary',
        'aria-invalid:border-error',
        'disabled:data-unchecked:border-input disabled:data-unchecked:bg-muted disabled:cursor-not-allowed disabled:opacity-45',
        'disabled:data-checked:border-border-strong disabled:data-checked:bg-border-strong disabled:data-[state=indeterminate]:border-border-strong disabled:data-[state=indeterminate]:bg-border-strong disabled:data-checked:text-white disabled:data-[state=indeterminate]:text-white',
        className,
      )}
      {...props}>
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="grid place-content-center text-current">
        <Icon name="check" size={14} strokeWidth={3} className="group-data-[state=indeterminate]/checkbox:hidden" />
        <span className="hidden h-[2.5px] w-2.5 rounded-[2px] bg-current group-data-[state=indeterminate]/checkbox:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
