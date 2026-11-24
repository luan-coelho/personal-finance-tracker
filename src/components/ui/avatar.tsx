'use client'

import { Avatar as AvatarPrimitive } from 'radix-ui'
import type * as React from 'react'

import { cn } from '@/lib/utils'

type AvatarSize = 24 | 32 | 40 | 56

// Radar Avatar: 24 (comment), 32 (table, group), 40 (default), 56 (profile); initials in `primary-soft`.
function Avatar({
  className,
  size = 40,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: AvatarSize
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        'group/avatar relative inline-flex size-10 shrink-0 items-center justify-center rounded-full align-middle select-none',
        'data-[size=24]:size-6 data-[size=32]:size-8 data-[size=56]:size-14',
        className,
      )}
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('size-full rounded-[inherit] object-cover', className)}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'bg-primary-soft text-primary-soft-fg flex size-full items-center justify-center rounded-[inherit] text-sm leading-none font-semibold',
        'group-data-[size=24]/avatar:text-[10px] group-data-[size=32]/avatar:text-xs group-data-[size=56]/avatar:text-lg',
        className,
      )}
      {...props}
    />
  )
}

const statusClass = {
  online: 'bg-success',
  busy: 'bg-error',
  away: 'bg-warning',
  offline: 'bg-border-strong',
} as const

function AvatarBadge({
  className,
  status = 'online',
  ...props
}: React.ComponentProps<'span'> & { status?: keyof typeof statusClass }) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        'border-card absolute right-0.5 bottom-0.5 z-10 size-3.5 rounded-full border-2',
        'group-data-[size=24]/avatar:-right-px group-data-[size=24]/avatar:-bottom-px group-data-[size=24]/avatar:size-2.5',
        'group-data-[size=32]/avatar:-right-px group-data-[size=32]/avatar:-bottom-px group-data-[size=32]/avatar:size-2.5',
        statusClass[status],
        className,
      )}
      {...props}
    />
  )
}

function AvatarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        'group/avatar-group inline-flex items-center align-middle',
        '*:data-[slot=avatar]:border-card *:not-first:-ml-2 *:data-[slot=avatar]:border-2',
        'has-data-[size=24]:*:not-first:-ml-1.5 has-data-[size=40]:*:not-first:-ml-2.5 has-data-[size=56]:*:not-first:-ml-2.5',
        className,
      )}
      {...props}
    />
  )
}

function AvatarGroupCount({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        'border-card bg-muted text-muted-foreground relative flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs leading-none font-semibold',
        'group-has-data-[size=24]/avatar-group:size-6 group-has-data-[size=24]/avatar-group:text-[10px]',
        'group-has-data-[size=40]/avatar-group:size-10 group-has-data-[size=40]/avatar-group:text-sm',
        'group-has-data-[size=56]/avatar-group:size-14 group-has-data-[size=56]/avatar-group:text-lg',
        className,
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage }
