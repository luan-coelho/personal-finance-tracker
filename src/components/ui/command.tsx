'use client'

import { Command as CommandPrimitive } from 'cmdk'
import type * as React from 'react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

/**
 * Lista pesquisável Radar, base do Combobox (`.sst-combobox__menu`, itens de 40px,
 * raio 10, realce `accent`) e da paleta ⌘K (`.sst-cmdk*`: `CommandDialog` com
 * raio 20, `border-strong`, `sh-xl`, busca de 56px e itens de 44px).
 * Dentro de um `PopoverContent` use `className="p-0"` no popover.
 */

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        'bg-popover text-popover-foreground flex size-full flex-col overflow-hidden text-sm leading-5',
        className,
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title = 'Paleta de comandos',
  description = 'Busque uma ação ou um registro',
  children,
  className,
  showCloseButton = false,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        data-command-dialog=""
        className={cn(
          'border-border-strong bg-popover shadow-sh-xl top-1/3 w-full max-w-[560px] translate-y-0 gap-0 overflow-hidden rounded-lg border p-0 sm:max-w-[560px]',
          className,
        )}
        showCloseButton={showCloseButton}>
        {children}
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className={cn(
        'h-control-lg border-border text-muted-foreground flex shrink-0 items-center gap-2.5 border-b px-3.5',
        'in-data-command-dialog:h-14 in-data-command-dialog:gap-3 in-data-command-dialog:px-5 in-data-command-dialog:text-base in-data-command-dialog:leading-6',
      )}>
      <Icon name="search" size={18} />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          'text-foreground placeholder:text-muted-foreground h-full min-w-0 flex-1 border-0 bg-transparent p-0 outline-none disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        'max-h-[306px] scroll-py-1.5 overflow-x-hidden overflow-y-auto p-1.5 outline-none in-data-command-dialog:max-h-[360px] in-data-command-dialog:p-2',
        '**:[[cmdk-list-sizer]]:flex **:[[cmdk-list-sizer]]:flex-col **:[[cmdk-list-sizer]]:gap-0.5',
        className,
      )}
      {...props}
    />
  )
}

function CommandEmpty({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn('text-muted-foreground px-2.5 py-6 text-center text-sm', className)}
      {...props}
    />
  )
}

function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        'text-foreground overflow-hidden',
        '**:[[cmdk-group-heading]]:text-muted-foreground **:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:pt-2.5 **:[[cmdk-group-heading]]:pb-1 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:leading-4 **:[[cmdk-group-heading]]:font-medium',
        '**:[[cmdk-group-items]]:flex **:[[cmdk-group-items]]:flex-col **:[[cmdk-group-items]]:gap-0.5',
        className,
      )}
      {...props}
    />
  )
}

function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn('bg-border mx-1.5 my-1 h-px shrink-0', className)}
      {...props}
    />
  )
}

/**
 * Item de 40px (44 na paleta). `data-checked="true"` mostra o `check` em `primary-text`
 * à direita (escolha única); para seleção múltipla, desenhe a caixa no próprio conteúdo.
 */
function CommandItem({ className, children, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        'group/command-item h-control-md rounded-control text-foreground relative flex shrink-0 cursor-pointer items-center gap-2.5 px-2.5 text-sm outline-none select-none',
        'in-data-command-dialog:h-control-lg in-data-command-dialog:gap-3 in-data-command-dialog:px-3',
        'data-[selected=true]:bg-accent',
        'data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50',
        '[&_svg]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0',
        className,
      )}
      {...props}>
      {children}
      <Icon
        name="check"
        size={18}
        className="text-primary-text! ml-auto hidden group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:block"
      />
    </CommandPrimitive.Item>
  )
}

/** Atalho em `kbd` DM Mono 11px sobre `card`. */
function CommandShortcut({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="command-shortcut"
      className={cn(
        'border-input bg-card text-muted-foreground ml-auto rounded-[5px] border px-1.5 py-0.5 font-mono text-[11px] leading-4',
        className,
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
}
