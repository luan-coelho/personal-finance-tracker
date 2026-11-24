import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type * as React from 'react'

import { Icon, type IconName } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

// Radar Badge (status): soft only — `*-soft` background, `*-text` label, 6px dot in the base color.
const badgeVariants = cva(
  'inline-flex h-6 w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 align-middle text-xs leading-4 font-medium whitespace-nowrap [&>svg]:pointer-events-none',
  {
    variants: {
      tone: {
        neutral: 'bg-muted text-muted-foreground [--badge-dot:var(--border-strong)]',
        success: 'bg-success-soft text-success-text [--badge-dot:var(--success)]',
        warning: 'bg-warning-soft text-warning-text [--badge-dot:var(--warning)]',
        error: 'bg-error-soft text-error-text [--badge-dot:var(--error)]',
        info: 'bg-info-soft text-info-text [--badge-dot:var(--info)]',
        primary: 'bg-primary-soft text-primary-soft-fg [--badge-dot:var(--primary)]',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
)

type BadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    /** 6px dot before the label, in the tone's base color. */
    dot?: boolean
    /** Radar icon before the label (12px). */
    icon?: IconName
    asChild?: boolean
  }

function Badge({ className, tone = 'neutral', dot = false, icon, asChild = false, children, ...props }: BadgeProps) {
  const Comp = asChild ? Slot.Root : 'span'

  return (
    <Comp data-slot="badge" data-tone={tone} className={cn(badgeVariants({ tone }), className)} {...props}>
      {asChild ? (
        children
      ) : (
        <>
          {dot && (
            <span data-slot="badge-dot" aria-hidden className="size-1.5 shrink-0 rounded-full bg-(--badge-dot)" />
          )}
          {icon && <Icon name={icon} size={12} />}
          {children}
        </>
      )}
    </Comp>
  )
}

export type { BadgeProps }
export { Badge, badgeVariants }
