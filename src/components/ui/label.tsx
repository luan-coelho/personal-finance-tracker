'use client'

import { Label as LabelPrimitive } from 'radix-ui'
import type * as React from 'react'

import { cn } from '@/lib/utils'

/** Rótulo Radar (`.sst-field__label`): 14/20 500 em `fg`, sentence case, sem dois-pontos. */
function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'text-foreground flex items-center gap-1 text-sm font-medium select-none',
        'group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-45 peer-disabled:cursor-not-allowed peer-disabled:opacity-45',
        className,
      )}
      {...props}
    />
  )
}

export { Label }
