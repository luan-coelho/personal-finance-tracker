'use client'

import { Switch as SwitchPrimitive } from 'radix-ui'
import type * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Radar Switch (`.sst-switch`): trilho 44×24 em cápsula, desligado em `border`, ligado em `primary`;
 * thumb branco de 20px a 2px da borda, sombra curta, desliza em 150ms. Foco com `focus-ring`
 * no trilho; desabilitado a 45%.
 */
function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer group/switch bg-input relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full outline-none',
        'transition-[background-color,box-shadow] duration-150',
        'after:absolute after:-inset-x-3 after:-inset-y-2',
        'focus-visible:shadow-focus-ring data-checked:bg-primary',
        'disabled:cursor-not-allowed disabled:opacity-45',
        className,
      )}
      {...props}>
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none absolute top-0.5 left-0.5 block size-5 rounded-full bg-white shadow-[0_1px_2px_#0003] transition-transform duration-150 data-checked:translate-x-5"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
