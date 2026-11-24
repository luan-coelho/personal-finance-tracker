'use client'

import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import type * as React from 'react'

import { cn } from '@/lib/utils'

/** Grupo de rádios Radar: empilhado com `space-3`. */
function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root data-slot="radio-group" className={cn('grid w-full gap-3', className)} {...props} />
}

/**
 * Radar Radio (`.sst-radio`): círculo 20px, borda 1,5px `border-strong` sobre `card`;
 * selecionado vira anel de 6px em `primary` (o miolo é o próprio `card`).
 * Hover e foco trocam a borda para `primary`; erro por `aria-invalid`; desabilitado a 45%.
 */
function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'peer border-border-strong bg-card relative size-5 shrink-0 cursor-pointer rounded-full border-[1.5px] outline-none',
        'transition-[border-color,border-width,box-shadow] duration-120',
        'after:absolute after:-inset-x-3 after:-inset-y-2',
        'hover:not-disabled:not-aria-invalid:border-primary focus-visible:not-aria-invalid:border-primary focus-visible:shadow-focus-ring',
        'data-checked:not-aria-invalid:border-primary data-checked:border-[6px]',
        'aria-invalid:border-error',
        'disabled:data-unchecked:border-input disabled:data-unchecked:bg-muted disabled:cursor-not-allowed disabled:opacity-45',
        'disabled:data-checked:border-border-strong disabled:data-checked:bg-card',
        className,
      )}
      {...props}
    />
  )
}

export { RadioGroup, RadioGroupItem }
