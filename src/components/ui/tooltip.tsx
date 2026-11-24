'use client'

import { Tooltip as TooltipPrimitive } from 'radix-ui'
import type * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Radar Tooltip (`.sst-tooltip*`): balão em `inverse` + `inverse-fg`, 12/500,
 * padding 6/10, raio 8, `sh-md`, seta de 8px, a 6px do âncora. Aparece 500ms
 * depois do hover ou do foco. Só rótulos curtos, uma linha.
 */

function TooltipProvider({ delayDuration = 500, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

/** Altura da seta desenhada pelo Radix; somada ao `sideOffset` para dar 6px até o âncora. */
const ARROW_HEIGHT = 5

function TooltipContent({
  className,
  sideOffset = 6,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset - ARROW_HEIGHT}
        className={cn(
          'bg-inverse text-inverse-fg shadow-sh-md z-[70] w-fit origin-(--radix-tooltip-content-transform-origin) rounded-[8px] px-2.5 py-1.5 text-xs leading-5 font-medium whitespace-nowrap',
          'data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=instant-open]:animate-in data-[state=instant-open]:fade-in-0 data-closed:animate-out data-closed:fade-out-0 duration-[120ms]',
          className,
        )}
        {...props}>
        {children}
        <TooltipPrimitive.Arrow width={11} height={ARROW_HEIGHT} className="fill-inverse" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
