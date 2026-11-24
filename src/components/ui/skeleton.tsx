import type * as React from 'react'

import { cn } from '@/lib/utils'

// Radar Skeleton: `muted` block with a shimmer sweep (muted → border → muted), off with prefers-reduced-motion.
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn(
        'bg-muted block rounded-sm bg-[linear-gradient(90deg,var(--muted)_25%,var(--border-default)_50%,var(--muted)_75%)] bg-size-[200%_100%]',
        'animate-[sst-shimmer_1.6s_linear_infinite] motion-reduce:animate-none motion-reduce:bg-none',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
