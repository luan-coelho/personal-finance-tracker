'use client'

import type * as React from 'react'

import { Icon, type IconName } from '@/components/ui/icon'
import { toggleVariants } from '@/components/ui/toggle'

import { cn } from '@/lib/utils'

interface SelectionButtonProps extends Omit<React.ComponentProps<'button'>, 'type'> {
  /** Opção atual do grupo; vira `aria-pressed`. */
  selected: boolean
  /** Ícone Radar de 18px antes do rótulo (ou passe o ícone em `children`). */
  icon?: IconName
}

/**
 * Opção de escolha numa faixa que quebra linha (categoria, usuário). Visual do ToggleButton
 * Radar (`.sst-toggle`): cápsula outline de 40px; selecionada com borda `primary`, fundo
 * `primary-soft` e texto `primary-soft-fg`. O texto não quebra: rótulos longos são truncados.
 */
function SelectionButton({ selected, icon, className, children, ...props }: SelectionButtonProps) {
  return (
    <button
      type="button"
      data-slot="selection-button"
      aria-pressed={selected}
      className={cn(toggleVariants(), 'max-w-full justify-start overflow-hidden [&>span]:truncate', className)}
      {...props}>
      {icon ? <Icon name={icon} size={18} /> : null}
      {children}
    </button>
  )
}

export type { SelectionButtonProps }
export { SelectionButton }
