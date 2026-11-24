import type * as React from 'react'

import { cn } from '@/lib/utils'

export interface PageActionsProps extends React.ComponentProps<'div'> {
  /** Botões da página, à direita. Uma primária por tela, sempre por último. */
  actions?: React.ReactNode
}

/**
 * Radar PageActions: primeira linha do conteúdo, logo abaixo do PageHeader.
 * `children` à esquerda (tabs, seletor de mês, filtros) e `actions` à direita; vira coluna abaixo de 640px.
 */
export function PageActions({ children, actions, className, ...props }: PageActionsProps) {
  const hasLeft = children !== undefined && children !== null && children !== false

  return (
    <div
      data-slot="page-actions"
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-end',
        hasLeft ? 'sm:justify-between' : 'sm:justify-end',
        className,
      )}
      {...props}>
      {hasLeft && (
        <div data-slot="page-actions-left" className="flex min-w-0 flex-wrap items-end gap-3">
          {children}
        </div>
      )}
      {actions && (
        <div data-slot="page-actions-right" className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}
