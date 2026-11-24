'use client'

import { Dialog as DialogPrimitive } from 'radix-ui'
import type * as React from 'react'

import { Button, IconButton } from '@/components/ui/button'

import { cn } from '@/lib/utils'

// Radar Dialog: max 480 (`md` 768, `lg` 1024), radius-lg, border-strong, sh-xl, `overlay` scrim.
// Header and footer stay fixed; only DialogBody scrolls.
// Below `sm` it becomes the Radar BottomSheet: docked to the bottom, full width, top corners only,
// up to 90% of the screen, 36×4 handle, safe-area padding, and it rides above the on-screen keyboard.

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'bg-overlay data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 fixed inset-0 isolate z-50 duration-150',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Radar BottomSheet geometry, shared with AlertDialog. Applied below `sm`; `max-w-none!` beats the
 * size class of the centered dialog.
 */
const BOTTOM_SHEET_CLASS = cn(
  'max-sm:top-auto max-sm:bottom-(--keyboard-inset) max-sm:left-0 max-sm:w-full max-sm:max-w-none! max-sm:translate-x-0 max-sm:translate-y-0',
  'max-sm:pb-safe-bottom max-sm:max-h-[calc(90dvh-var(--keyboard-inset))] max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0',
  'max-sm:data-open:zoom-in-100 max-sm:data-open:slide-in-from-bottom max-sm:data-closed:zoom-out-100 max-sm:data-closed:slide-out-to-bottom max-sm:duration-200',
)

/** 36×4 handle of the bottom sheet; decorative (closing is the scrim, Esc or the buttons). */
function BottomSheetHandle() {
  return (
    <span
      aria-hidden="true"
      data-slot="bottom-sheet-handle"
      className="bg-border-strong mx-auto mt-2 hidden h-1 w-9 shrink-0 rounded-full max-sm:block"
    />
  )
}

const dialogSizeClass = {
  sm: 'max-w-[480px]',
  md: 'max-w-[768px]',
  lg: 'max-w-[1024px]',
} as const

function DialogContent({
  className,
  children,
  size = 'sm',
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  /** `sm` 480 (default) · `md` 768 · `lg` 1024 for long forms. */
  size?: keyof typeof dialogSizeClass
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        data-size={size}
        data-close-button={showCloseButton || undefined}
        className={cn(
          'group/dialog fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden',
          'border-border-strong bg-card text-card-foreground shadow-sh-xl rounded-lg border text-left text-sm outline-none',
          // A <form> wrapping body + footer keeps the fixed-header/scrolling-body layout.
          '[&>form]:flex [&>form]:min-h-0 [&>form]:flex-col',
          'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 duration-150',
          BOTTOM_SHEET_CLASS,
          dialogSizeClass[size],
          className,
        )}
        {...props}>
        <BottomSheetHandle />
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close" asChild>
            <IconButton
              icon="x"
              label="Fechar"
              variant="ghost"
              className="absolute top-[18px] right-4 size-9! max-lg:top-3 max-lg:right-3 max-lg:size-11! max-sm:top-4"
            />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        'flex shrink-0 flex-col gap-1 px-6 pt-6 group-data-[close-button]/dialog:pr-17 max-sm:px-4 max-sm:pt-3 [&:last-child]:pb-6',
        className,
      )}
      {...props}
    />
  )
}

/** The only scrolling region: padding 20/24. */
function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-body"
      className={cn('flex min-h-0 flex-col gap-1.5 overflow-auto overscroll-contain px-6 py-5 max-sm:px-4', className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'flex shrink-0 flex-wrap items-center justify-end gap-2 px-6 pb-6 [[data-slot=dialog-header]+&]:pt-5',
        // Bottom sheet (Radar StickyFooter mobile): one row, the last (primary) action takes 2/3.
        'max-sm:border-border max-sm:flex-nowrap max-sm:border-t max-sm:px-4 max-sm:pt-3 max-sm:pb-4 max-sm:*:min-w-0 max-sm:*:flex-1 max-sm:*:last:flex-2 max-sm:*:only:flex-1',
        className,
      )}
      {...props}>
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Fechar</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('font-heading text-foreground m-0 text-lg leading-[26px] font-semibold', className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        'text-muted-foreground *:[a]:text-primary-text m-0 text-sm *:[a]:hover:underline *:[a]:hover:underline-offset-4',
        className,
      )}
      {...props}
    />
  )
}

export {
  BOTTOM_SHEET_CLASS,
  BottomSheetHandle,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
