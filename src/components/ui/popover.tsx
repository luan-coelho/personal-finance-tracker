'use client'

import { Popover as PopoverPrimitive } from 'radix-ui'
import type * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Radar Popover (`.sst-popover*`): painel de 300px em `popover`, borda
 * `border-strong`, raio 14 (`radius-md`), `sh-lg`, padding 16 e pilha de 8px.
 * Abre por clique (nunca por hover). `arrow` liga a seta de 10px do Radar.
 * Campos (DatePicker, Combobox) usam o mesmo painel com `className` próprio e sem seta.
 */

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

/** Radix mede a seta (10×10 antes da rotação) e soma a altura ao deslocamento. */
const ARROW_SIZE = 10

function PopoverContent({
  className,
  align = 'start',
  sideOffset = 8,
  arrow = false,
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
  /** Seta de 10px apontando para o gatilho (padrão do Popover de conteúdo rico do Radar). */
  arrow?: boolean
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        // A seta ocupa parte do espaço até o gatilho: a distância total continua `sideOffset`.
        sideOffset={arrow ? sideOffset - ARROW_SIZE : sideOffset}
        className={cn(
          'border-border-strong bg-popover text-popover-foreground shadow-sh-lg z-50 flex w-[300px] max-w-[calc(100vw-32px)] origin-(--radix-popover-content-transform-origin) flex-col gap-2 rounded-md border p-4 text-left text-sm outline-hidden',
          'data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 duration-100',
          className,
        )}
        {...props}>
        {children}
        {arrow && (
          <PopoverPrimitive.Arrow asChild>
            <span
              data-slot="popover-arrow"
              className="border-border-strong bg-popover block size-2.5 -translate-y-1 rotate-45 border-r border-b"
            />
          </PopoverPrimitive.Arrow>
        )}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

function PopoverHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="popover-header" className={cn('flex flex-col gap-1', className)} {...props} />
}

/** Título 14/600: responde à pergunta do gatilho. */
function PopoverTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return (
    <h2
      data-slot="popover-title"
      className={cn('text-foreground m-0 text-sm leading-5 font-semibold', className)}
      {...props}
    />
  )
}

/** Corpo 13/19 em `muted-fg`. */
function PopoverDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="popover-description"
      className={cn('text-muted-foreground m-0 text-[13px] leading-[19px]', className)}
      {...props}
    />
  )
}

export { Popover, PopoverAnchor, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger }
