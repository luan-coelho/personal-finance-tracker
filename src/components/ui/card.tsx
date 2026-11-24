import { Slot } from 'radix-ui'
import type * as React from 'react'

import { cn } from '@/lib/utils'

type CardProps = React.ComponentProps<'div'> & {
  /** `default`: padding 24, gap 16. `sm`: padding 16, gap 12 (Radar `mobile`). */
  size?: 'default' | 'sm'
  /** Clickable card: hover/focus change only the border (`border-strong`) and shadow (`sh-md`). */
  interactive?: boolean
  asChild?: boolean
}

function Card({
  className,
  size = 'default',
  interactive = false,
  asChild = false,
  onClick,
  onKeyDown,
  ...props
}: CardProps) {
  const Comp = asChild ? Slot.Root : 'div'
  // Keyboard activation only when the card itself is the clickable element (client-side onClick).
  const clickable = interactive && !asChild && onClick !== undefined

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event)
    if (event.defaultPrevented || event.target !== event.currentTarget) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.currentTarget.click()
    }
  }

  return (
    <Comp
      data-slot="card"
      data-size={size}
      data-interactive={interactive || undefined}
      className={cn(
        'group/card border-border bg-card text-card-foreground shadow-sh-sm flex min-w-0 flex-col gap-(--card-gap) rounded-lg border py-(--card-spacing)',
        '[--card-gap:--spacing(4)] [--card-spacing:--spacing(6)] data-[size=sm]:[--card-gap:--spacing(3)] data-[size=sm]:[--card-spacing:--spacing(4)]',
        interactive &&
          '[--card-gap:--spacing(3)] hover:border-border-strong hover:shadow-sh-md focus-visible:border-border-strong cursor-pointer transition-[border-color,box-shadow] duration-120 outline-none focus-visible:shadow-[var(--sh-md),var(--focus-ring)]',
        className,
      )}
      onClick={onClick}
      onKeyDown={clickable ? handleKeyDown : onKeyDown}
      {...(clickable && { role: 'button', tabIndex: 0 })}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'group/card-header grid auto-rows-min items-start gap-x-3 gap-y-0.5 px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-(--card-spacing)',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('font-heading min-w-0 text-base leading-6 font-semibold', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-description" className={cn('text-muted-foreground text-[13px]', className)} {...props} />
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 flex items-center gap-2 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('min-w-0 px-(--card-spacing)', className)} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'flex flex-wrap items-center justify-end gap-2 px-(--card-spacing) [.border-t]:pt-(--card-spacing)',
        className,
      )}
      {...props}
    />
  )
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
