'use client'

import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui'
import type * as React from 'react'

import { Icon } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

/**
 * Radar Menu (`.sst-menu*`): painel de 240px em `popover`, borda `border-strong`,
 * raio 14, `sh-lg`, padding 6 e 2px entre itens. Itens de 40px com raio 10,
 * ícone 18 em `muted-fg`, atalho em DM Mono 11px. Realce (hover/teclado) em `accent`;
 * `variant="destructive"` em `error-text` com realce `error-soft`, sempre o último,
 * depois de um `DropdownMenuSeparator`. `variant="muted"` para ação secundária.
 */

function DropdownMenu({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
}

/** Enquanto o menu está aberto, o gatilho fica em `accent` com o anel de foco. */
function DropdownMenuTrigger({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      className={cn('data-[state=open]:bg-accent data-[state=open]:shadow-focus-ring', className)}
      {...props}
    />
  )
}

const menuPanel =
  'z-50 flex w-60 flex-col gap-0.5 overflow-x-hidden overflow-y-auto rounded-md border border-border-strong bg-popover p-1.5 text-left text-popover-foreground text-sm shadow-sh-lg duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0'

function DropdownMenuContent({
  className,
  align = 'end',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        align={align}
        className={cn(
          menuPanel,
          'max-h-(--radix-dropdown-menu-content-available-height) origin-(--radix-dropdown-menu-content-transform-origin)',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group
      data-slot="dropdown-menu-group"
      className={cn('flex flex-col gap-0.5', className)}
      {...props}
    />
  )
}

const menuItem = cn(
  'h-control-md rounded-control text-foreground relative flex w-full shrink-0 cursor-pointer items-center gap-2.5 px-2.5 text-left text-sm font-normal outline-none select-none',
  'data-highlighted:bg-accent active:bg-muted',
  'data-disabled:cursor-not-allowed data-disabled:opacity-50',
  'data-inset:pl-[38px]',
  '[&_svg]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0',
)

function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  /** `muted`: secundária (Arquivar), `muted-fg` a 50%. `destructive`: Excluir, em `error-text`. */
  variant?: 'default' | 'muted' | 'destructive'
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cn(
        menuItem,
        'data-[variant=muted]:text-muted-foreground data-[variant=muted]:opacity-50 data-[variant=muted]:[&_svg]:text-current',
        'data-[variant=destructive]:text-error-text data-[variant=destructive]:data-highlighted:bg-error-soft data-[variant=destructive]:active:bg-error-soft data-[variant=destructive]:[&_svg]:text-current',
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset || undefined}
      className={cn(menuItem, 'pr-9', className)}
      checked={checked}
      {...props}>
      {children}
      <span
        className="pointer-events-none absolute right-2.5 flex items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator">
        <DropdownMenuPrimitive.ItemIndicator>
          <Icon name="check" size={18} className="text-primary-text!" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      className={cn('flex flex-col gap-0.5', className)}
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset || undefined}
      className={cn(menuItem, 'pr-9', className)}
      {...props}>
      {children}
      <span
        className="pointer-events-none absolute right-2.5 flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator">
        <DropdownMenuPrimitive.ItemIndicator>
          <Icon name="check" size={18} className="text-primary-text!" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
    </DropdownMenuPrimitive.RadioItem>
  )
}

/** Título de grupo 12/500 em `muted-fg`. */
function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset || undefined}
      className={cn(
        'text-muted-foreground px-2.5 pt-2.5 pb-1 text-xs leading-4 font-medium data-inset:pl-[38px]',
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn('bg-border mx-1.5 my-1 h-px shrink-0', className)}
      {...props}
    />
  )
}

/** Atalho à direita em DM Mono 11px `muted-fg` ("↵", "E", "⌘K"). Só atalhos que funcionam na tela. */
function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn('text-muted-foreground ml-auto font-mono text-[11px] leading-4', className)}
      {...props}
    />
  )
}

function DropdownMenuSub({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset || undefined}
      className={cn(menuItem, 'data-[state=open]:bg-accent', className)}
      {...props}>
      {children}
      <Icon name="chevron-right" size={16} className="ml-auto" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        data-slot="dropdown-menu-sub-content"
        className={cn(menuPanel, 'origin-(--radix-dropdown-menu-content-transform-origin)', className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
}
