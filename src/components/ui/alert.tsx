import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { Icon, type IconName } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

// Radar inline Alert: radius-md, `*-soft` background, border in the base color, icon + title in `*-text`.
const alertVariants = cva(
  'group/alert text-foreground flex w-full items-start gap-3 rounded-md border px-4 py-3.5 text-left text-sm',
  {
    variants: {
      tone: {
        info: 'border-info bg-info-soft [--alert-border:var(--info)] [--alert-fg:var(--info-text)]',
        success: 'border-success bg-success-soft [--alert-border:var(--success)] [--alert-fg:var(--success-text)]',
        warning: 'border-warning bg-warning-soft [--alert-border:var(--warning)] [--alert-fg:var(--warning-text)]',
        error: 'border-error bg-error-soft [--alert-border:var(--error)] [--alert-fg:var(--error-text)]',
      },
    },
    defaultVariants: {
      tone: 'info',
    },
  },
)

const defaultIcon: Record<NonNullable<VariantProps<typeof alertVariants>['tone']>, IconName> = {
  info: 'info',
  success: 'check-circle',
  warning: 'alert-triangle',
  error: 'alert-circle',
}

type AlertProps = React.ComponentProps<'div'> &
  VariantProps<typeof alertVariants> & {
    /** Replaces the tone icon; `null` hides it. */
    icon?: IconName | null
  }

function Alert({ className, tone = 'info', icon, children, ...props }: AlertProps) {
  const resolvedTone = tone ?? 'info'
  const iconName = icon === undefined ? defaultIcon[resolvedTone] : icon

  return (
    <div
      data-slot="alert"
      data-tone={resolvedTone}
      role={resolvedTone === 'error' || resolvedTone === 'warning' ? 'alert' : 'status'}
      className={cn(alertVariants({ tone: resolvedTone }), className)}
      {...props}>
      {iconName && <Icon name={iconName} size={20} className="mt-px text-(--alert-fg)" />}
      <div data-slot="alert-body" className="flex min-w-0 flex-1 flex-col gap-0.5">
        {children}
      </div>
    </div>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="alert-title" className={cn('font-semibold text-(--alert-fg)', className)} {...props} />
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'text-foreground [&_a]:text-primary-text [&_a]:hover:text-primary-hover text-sm [&_a]:font-medium [&_a]:hover:underline [&_a]:hover:underline-offset-4 [&_p:not(:last-child)]:mb-2',
        className,
      )}
      {...props}
    />
  )
}

/** Action row under the text (e.g. an outline `Button size="sm"` "Tentar novamente"). */
function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-action"
      className={cn(
        'mt-1.5 flex flex-wrap items-center gap-2 [&_[data-slot=button]]:border-(--alert-border) [&_[data-slot=button]]:bg-transparent [&_[data-slot=button]]:text-(--alert-fg)',
        className,
      )}
      {...props}
    />
  )
}

export { Alert, AlertAction, AlertDescription, AlertTitle, alertVariants }
