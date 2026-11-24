import type * as React from 'react'

import { Icon, type IconName } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

type EmptyStateProps = Omit<React.ComponentProps<'div'>, 'title'> & {
  /** Radar icon in the 56px `muted` tile (default `clipboard`); `null` removes the tile. */
  icon?: IconName | null
  /** 16/600: "Nenhuma transação encontrada". */
  title: React.ReactNode
  /** 14/20 `muted-fg`, up to 300px: what to do next. */
  description?: React.ReactNode
  /** Buttons: outline on the left, primary on the right. */
  action?: React.ReactNode
  /** Card frame (card + border-subtle + radius-lg) when the empty state fills the whole area. */
  bordered?: boolean
}

function EmptyState({
  className,
  icon = 'clipboard',
  title,
  description,
  action,
  bordered = false,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        'flex flex-col items-center gap-3 px-6 py-12 text-center',
        bordered && 'border-border bg-card rounded-lg border',
        className,
      )}
      {...props}>
      {icon && (
        <div
          data-slot="empty-state-icon"
          className="bg-muted text-muted-foreground inline-flex size-14 items-center justify-center rounded-2xl">
          <Icon name={icon} size={24} />
        </div>
      )}
      <div data-slot="empty-state-title" className="text-foreground mt-1 text-base leading-6 font-semibold">
        {title}
      </div>
      {description && (
        <p data-slot="empty-state-description" className="text-muted-foreground max-w-[300px] text-sm">
          {description}
        </p>
      )}
      {children}
      {action && (
        <div data-slot="empty-state-actions" className="mt-2 flex flex-wrap justify-center gap-2">
          {action}
        </div>
      )}
    </div>
  )
}

export type { EmptyStateProps }
export { EmptyState }
