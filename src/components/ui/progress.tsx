'use client'

import { Progress as ProgressPrimitive } from 'radix-ui'
import type * as React from 'react'

import { cn } from '@/lib/utils'

const toneClass = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
} as const

type ProgressProps = React.ComponentProps<typeof ProgressPrimitive.Root> & {
  /** `md` 8px track (default) or `sm` 4px. */
  size?: 'md' | 'sm'
  /** Fill color; use `warning`/`error` when a budget is near or past its limit. */
  tone?: keyof typeof toneClass
  indicatorClassName?: string
}

function Progress({
  className,
  value,
  max = 100,
  size = 'md',
  tone = 'primary',
  indicatorClassName,
  ...props
}: ProgressProps) {
  // Radix treats values outside 0..max as invalid; clamp so an exceeded budget renders a full bar.
  const clamped = value == null ? null : Math.min(max, Math.max(0, value))
  const percent = clamped == null ? 0 : (clamped / max) * 100

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      data-size={size}
      data-tone={tone}
      value={clamped}
      max={max}
      className={cn('bg-muted relative h-2 w-full overflow-hidden rounded-full data-[size=sm]:h-1', className)}
      {...props}>
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          'h-full rounded-full transition-[width] duration-200 ease-out',
          toneClass[tone],
          indicatorClassName,
        )}
        style={{ width: `${percent}%` }}
      />
    </ProgressPrimitive.Root>
  )
}

export type { ProgressProps }
export { Progress }
