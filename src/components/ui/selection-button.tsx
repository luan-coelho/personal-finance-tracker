'use client'

import { Check } from 'lucide-react'
import type { ComponentProps } from 'react'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

interface SelectionButtonProps extends Omit<ComponentProps<typeof Button>, 'variant'> {
  selected: boolean
}

export function SelectionButton({ selected, className, children, ...props }: SelectionButtonProps) {
  return (
    <Button
      {...props}
      type="button"
      variant="outline"
      aria-pressed={selected}
      className={cn(
        'h-auto min-h-9 max-w-full justify-start text-left whitespace-normal',
        selected &&
          'border-primary bg-primary/10 text-foreground hover:bg-primary/15 hover:text-foreground dark:border-primary dark:bg-primary/15 dark:hover:bg-primary/20',
        className,
      )}>
      {children}
      {selected && <Check className="size-3.5" aria-hidden="true" />}
    </Button>
  )
}
