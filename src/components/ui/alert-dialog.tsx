'use client'

import { AlertDialog as AlertDialogPrimitive } from 'radix-ui'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Icon, type IconName } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

// Radar confirmation dialog (`.sst-dialog--destructive` layout): padding 24, gap 16, radius-lg,
// border-strong, sh-xl, `overlay` scrim. Radix focuses Cancel first.
// `destructive`: 440px, `alert-triangle` in an `error-soft` tile, action defaults to `destructive`.

const AlertDialogToneContext = React.createContext<{ destructive: boolean }>({ destructive: false })

function AlertDialog({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

function AlertDialogPortal({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
}

function AlertDialogOverlay({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        'bg-overlay data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 fixed inset-0 z-50 duration-150',
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  destructive = false,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content> & {
  /** Destructive confirmation: 440px, error icon tile, `destructive` action. */
  destructive?: boolean
}) {
  return (
    <AlertDialogToneContext.Provider value={{ destructive }}>
      <AlertDialogPortal>
        <AlertDialogOverlay />
        <AlertDialogPrimitive.Content
          data-slot="alert-dialog-content"
          data-destructive={destructive || undefined}
          className={cn(
            'group/alert-dialog-content fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-auto',
            'border-border-strong bg-card text-card-foreground shadow-sh-xl rounded-lg border p-6 text-left text-sm outline-none',
            'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 duration-150',
            destructive ? 'max-w-[440px]' : 'max-w-[480px]',
            className,
          )}
          {...props}
        />
      </AlertDialogPortal>
    </AlertDialogToneContext.Provider>
  )
}

function AlertDialogHeader({ className, children, ...props }: React.ComponentProps<'div'>) {
  const { destructive } = React.useContext(AlertDialogToneContext)

  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        'flex flex-col gap-1.5',
        'has-data-[slot=alert-dialog-media]:grid has-data-[slot=alert-dialog-media]:grid-cols-[40px_1fr] has-data-[slot=alert-dialog-media]:items-start has-data-[slot=alert-dialog-media]:gap-x-4',
        className,
      )}
      {...props}>
      {destructive && <AlertDialogMedia />}
      {children}
    </div>
  )
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn('flex flex-wrap items-center justify-end gap-2', className)}
      {...props}
    />
  )
}

/** 40px tile spanning title + description; defaults to `alert-triangle` in `error-soft`. */
function AlertDialogMedia({
  className,
  icon = 'alert-triangle',
  children,
  ...props
}: React.ComponentProps<'div'> & { icon?: IconName }) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn(
        'bg-error-soft text-error row-span-2 inline-flex size-10 items-center justify-center rounded-xl',
        className,
      )}
      {...props}>
      {children ?? <Icon name={icon} size={20} />}
    </div>
  )
}

function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(
        'font-heading text-foreground m-0 text-lg leading-[26px] font-semibold',
        'group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2 group-has-data-[slot=alert-dialog-media]/alert-dialog-content:pt-[7px]',
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(
        'text-muted-foreground m-0 text-sm group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2',
        className,
      )}
      {...props}
    />
  )
}

type ButtonProps = React.ComponentProps<typeof Button>

function AlertDialogAction({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> & Pick<ButtonProps, 'variant' | 'size'>) {
  const { destructive } = React.useContext(AlertDialogToneContext)

  return (
    <Button variant={variant ?? (destructive ? 'destructive' : 'primary')} size={size} asChild>
      <AlertDialogPrimitive.Action data-slot="alert-dialog-action" className={className} {...props} />
    </Button>
  )
}

function AlertDialogCancel({
  className,
  variant = 'outline',
  size,
  children = 'Cancelar',
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel> & Pick<ButtonProps, 'variant' | 'size'>) {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Cancel data-slot="alert-dialog-cancel" className={className} {...props}>
        {children}
      </AlertDialogPrimitive.Cancel>
    </Button>
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
