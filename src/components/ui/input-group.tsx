'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

/**
 * Invólucro de campo Radar (`.sst-input`) para composições livres: 44px, raio 10,
 * borda `border` sobre `card`, gap 10. Hover `border-strong`, foco borda `primary` + `focus-ring`,
 * erro `error` (anel error 25% no foco), desabilitado em `muted`.
 */
function InputGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        'group/input-group h-control-lg rounded-control border-input bg-card text-foreground relative flex w-full min-w-0 items-center gap-2.5 border text-sm outline-none',
        'transition-[border-color,box-shadow,background-color] duration-120',
        'hover:not-focus-within:not-has-[[data-slot=input-group-control]:disabled]:not-has-[[data-slot][aria-invalid=true]]:border-border-strong',
        'has-[[data-slot=input-group-control]:focus-visible]:not-has-[[data-slot][aria-invalid=true]]:border-primary has-[[data-slot=input-group-control]:focus-visible]:shadow-focus-ring',
        'has-[[data-slot][aria-invalid=true]]:border-error has-[[data-slot][aria-invalid=true]]:has-[[data-slot=input-group-control]:focus-visible]:shadow-[0_0_0_3px_color-mix(in_srgb,var(--error)_25%,transparent)]',
        'has-[[data-slot=input-group-control]:disabled]:border-border has-[[data-slot=input-group-control]:disabled]:bg-muted has-[[data-slot=input-group-control]:disabled]:text-muted-foreground has-[[data-slot=input-group-control]:disabled]:cursor-not-allowed',
        'in-data-[slot=combobox-content]:focus-within:border-inherit in-data-[slot=combobox-content]:focus-within:shadow-none',
        'has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto',
        'has-[>[data-align=inline-end]]:[&>input]:pr-0 has-[>[data-align=inline-start]]:[&>input]:pl-0',
        className,
      )}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  "text-muted-foreground flex h-auto cursor-text items-center justify-center gap-2 text-sm select-none group-has-[[data-slot=input-group-control]:disabled]/input-group:opacity-45 [&>kbd]:rounded-xs [&>svg:not([class*='size-'])]:size-[18px]",
  {
    variants: {
      align: {
        'inline-start': 'order-first pl-3.5 has-[>button]:pl-1.5',
        'inline-end': 'order-last pr-3.5 has-[>button]:pr-1.5',
        'block-start': 'order-first w-full justify-start px-3.5 pt-3 [.border-b]:pb-3',
        'block-end': 'order-last w-full justify-start px-3.5 pb-3 [.border-t]:pt-3',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  },
)

function InputGroupAddon({
  className,
  align = 'inline-start',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: o clique só repassa o foco ao input, que já é focável por teclado
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={e => {
        if ((e.target as HTMLElement).closest('button')) {
          return
        }
        e.currentTarget.parentElement?.querySelector('input')?.focus()
      }}
      {...props}
    />
  )
}

const inputGroupButtonVariants = cva('shadow-none', {
  variants: {
    size: {
      sm: '',
      'icon-sm': 'w-control-sm px-0',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

/** Ação dentro do campo: Button `sm` (32px), `ghost` por padrão; `icon-sm` deixa quadrado. */
function InputGroupButton({
  className,
  type = 'button',
  variant = 'ghost',
  size = 'sm',
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'size'> & VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      size="sm"
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        "text-muted-foreground flex items-center gap-2 text-sm [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[18px]",
        className,
      )}
      {...props}
    />
  )
}

function InputGroupInput({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      data-slot="input-group-control"
      className={cn(
        'placeholder:text-muted-foreground h-full min-w-0 flex-1 border-0 bg-transparent px-3.5 text-inherit outline-none disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  )
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="input-group-control"
      className={cn(
        'placeholder:text-muted-foreground field-sizing-content min-h-24 w-full flex-1 resize-none border-0 bg-transparent px-3.5 py-3 text-inherit outline-none disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  )
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea }
