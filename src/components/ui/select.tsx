'use client'

import { Select as SelectPrimitive } from 'radix-ui'
import type * as React from 'react'

import { Icon } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

/**
 * Radar Select (`.sst-select*`): gatilho idêntico ao Input (44px, raio 10, borda
 * `border`, fundo `card`) e lista em `popover` (raio 14, `border-strong`, `sh-lg`)
 * com itens de 40px. Erro por `aria-invalid` no `SelectTrigger`.
 */

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return (
    <SelectPrimitive.Group data-slot="select-group" className={cn('flex flex-col gap-0.5', className)} {...props} />
  )
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  /** `default` 44px (`control-lg`, igual ao Input); `sm` 40px (`control-md`) para barras de ferramentas. */
  size?: 'sm' | 'default'
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        'group/select-trigger rounded-control border-input bg-card text-foreground flex w-full cursor-pointer items-center justify-between gap-2 border px-3.5 text-left text-sm transition-[border-color,box-shadow] duration-[120ms] outline-none',
        'data-[size=default]:h-control-lg data-[size=sm]:h-control-md',
        'data-placeholder:text-muted-foreground',
        'hover:border-border-strong',
        'focus-visible:border-primary focus-visible:shadow-focus-ring data-[state=open]:border-primary data-[state=open]:shadow-focus-ring',
        'aria-invalid:border-error aria-invalid:focus-visible:border-error aria-invalid:data-[state=open]:border-error aria-invalid:focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--error)_25%,transparent)] aria-invalid:data-[state=open]:shadow-[0_0_0_3px_color-mix(in_srgb,var(--error)_25%,transparent)]',
        'disabled:border-border disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed',
        '*:data-[slot=select-value]:flex *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:flex-1 *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2.5 *:data-[slot=select-value]:truncate',
        className,
      )}
      {...props}>
      {children}
      <SelectPrimitive.Icon asChild>
        <Icon
          name="chevron-down"
          size={18}
          className="text-muted-foreground pointer-events-none transition-transform duration-[120ms] group-data-[state=open]/select-trigger:rotate-180"
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = 'popper',
  align = 'start',
  sideOffset = 2,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          'border-border-strong bg-popover text-popover-foreground shadow-sh-lg relative z-50 max-h-[min(var(--radix-select-content-available-height),306px)] min-w-40 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border text-sm',
          'data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 duration-100',
          className,
        )}
        position={position}
        align={align}
        sideOffset={position === 'popper' ? sideOffset : undefined}
        {...props}>
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          data-position={position}
          className={cn(
            'flex flex-col gap-0.5 p-1.5',
            position === 'popper' && 'w-full min-w-(--radix-select-trigger-width)',
          )}>
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn('text-muted-foreground px-2.5 pt-2.5 pb-1 text-xs font-medium', className)}
      {...props}
    />
  )
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'h-control-md rounded-control text-foreground relative flex w-full shrink-0 cursor-pointer items-center justify-between gap-2 px-2.5 text-sm outline-none select-none',
        'data-highlighted:bg-accent',
        'data-disabled:text-muted-foreground data-disabled:cursor-default data-disabled:opacity-50',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0',
        className,
      )}
      {...props}>
      <SelectPrimitive.ItemText asChild>
        <span className="[&_svg]:text-muted-foreground flex min-w-0 items-center gap-2.5 truncate">{children}</span>
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="flex items-center">
        <Icon name="check" size={18} className="text-primary-text" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('bg-border pointer-events-none mx-1.5 my-1 h-px shrink-0', className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        'bg-popover text-muted-foreground z-10 flex cursor-default items-center justify-center py-1',
        className,
      )}
      {...props}>
      <Icon name="chevron-up" size={16} />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        'bg-popover text-muted-foreground z-10 flex cursor-default items-center justify-center py-1',
        className,
      )}
      {...props}>
      <Icon name="chevron-down" size={16} />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
