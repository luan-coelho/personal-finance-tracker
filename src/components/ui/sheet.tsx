'use client'

import { Dialog as SheetPrimitive } from 'radix-ui'
import * as React from 'react'

import { IconButton } from '@/components/ui/button'

import { cn } from '@/lib/utils'

// Radar Sheet: side panel 420 (`lg` 560 for forms), no radius on the screen edge, border-strong,
// sh-xl, `overlay` scrim. Header and footer are fixed; only SheetBody scrolls.
// The close button lives inside SheetHeader (aligned with the title).

const SheetCloseContext = React.createContext(true)

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        'bg-overlay data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 fixed inset-0 z-50 duration-200',
        className,
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = 'right',
  size = 'default',
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: 'right' | 'left'
  /** `default` 420 · `lg` 560 (forms). */
  size?: 'default' | 'lg'
  /** Shows the close IconButton inside SheetHeader. */
  showCloseButton?: boolean
}) {
  return (
    <SheetCloseContext.Provider value={showCloseButton}>
      <SheetPortal>
        <SheetOverlay />
        <SheetPrimitive.Content
          data-slot="sheet-content"
          data-side={side}
          data-size={size}
          className={cn(
            'bg-card text-card-foreground shadow-sh-xl fixed inset-y-0 z-50 flex h-full w-full max-w-[420px] flex-col text-left text-sm outline-none data-[size=lg]:max-w-[560px]',
            'data-open:animate-in data-closed:animate-out duration-200 ease-out',
            'data-[side=right]:border-border-strong data-[side=right]:data-open:slide-in-from-right data-[side=right]:data-closed:slide-out-to-right data-[side=right]:right-0 data-[side=right]:border-l',
            'data-[side=left]:border-border-strong data-[side=left]:data-open:slide-in-from-left data-[side=left]:data-closed:slide-out-to-left data-[side=left]:left-0 data-[side=left]:border-r',
            // A <form> wrapping body + footer keeps the fixed-header/scrolling-body layout.
            '[&>form]:flex [&>form]:min-h-0 [&>form]:flex-1 [&>form]:flex-col',
            className,
          )}
          {...props}>
          {children}
        </SheetPrimitive.Content>
      </SheetPortal>
    </SheetCloseContext.Provider>
  )
}

function SheetHeader({ className, children, ...props }: React.ComponentProps<'div'>) {
  const showCloseButton = React.useContext(SheetCloseContext)

  return (
    <div
      data-slot="sheet-header"
      className={cn('border-border flex shrink-0 items-center justify-between gap-4 border-b px-6 py-5', className)}
      {...props}>
      <div data-slot="sheet-heading" className="flex min-w-0 flex-col gap-0.5">
        {children}
      </div>
      {showCloseButton && (
        <SheetPrimitive.Close data-slot="sheet-close" asChild>
          <IconButton icon="x" label="Fechar" variant="ghost" className="size-9! shrink-0" />
        </SheetPrimitive.Close>
      )}
    </div>
  )
}

/** The only scrolling region: padding 20/24, gap 20 between sections. */
function SheetBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-body"
      className={cn('flex min-h-0 flex-1 flex-col gap-5 overflow-auto px-6 py-5', className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        'border-border mt-auto flex shrink-0 items-center justify-between gap-2 border-t px-6 py-4',
        className,
      )}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn('font-heading text-foreground m-0 text-lg leading-[26px] font-semibold', className)}
      {...props}
    />
  )
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-muted-foreground m-0 text-[13px] leading-[18px]', className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
}
