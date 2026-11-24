import { Slot } from 'radix-ui'
import type * as React from 'react'

import { Icon } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

/* Radar: 14px `muted-foreground`, `chevron-right` de 14 entre os níveis. */

function Breadcrumb({ className, ...props }: React.ComponentProps<'nav'>) {
  return <nav aria-label="Navegação estrutural" data-slot="breadcrumb" className={cn(className)} {...props} />
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        'text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm leading-5 wrap-break-word',
        className,
      )}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="breadcrumb-item" className={cn('inline-flex items-center gap-1.5', className)} {...props} />
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<'a'> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : 'a'

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn(
        'text-muted-foreground hover:text-foreground focus-visible:shadow-focus-ring rounded-xs transition-colors duration-150 outline-none',
        className,
      )}
      {...props}
    />
  )
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      className={cn('text-foreground font-normal', className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn('text-muted-foreground inline-flex', className)}
      {...props}>
      {children ?? <Icon name="chevron-right" size={14} />}
    </li>
  )
}

function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn('flex size-5 items-center justify-center', className)}
      {...props}>
      <Icon name="more-horizontal" size={16} />
      <span className="sr-only">Mais</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
