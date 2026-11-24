import type * as React from 'react'

import { buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      aria-label="Paginação"
      data-slot="pagination"
      className={cn('mx-auto flex w-full justify-center font-sans', className)}
      {...props}
    />
  )
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul data-slot="pagination-content" className={cn('flex items-center gap-1', className)} {...props} />
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & React.ComponentProps<'a'>

const disabledLink = 'aria-disabled:pointer-events-none aria-disabled:opacity-45'

// Radar page button: 36px circle, 13/500 tabular; active page in `primary-soft` 600.
function PaginationLink({ className, isActive, ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      data-slot="pagination-link"
      data-active={isActive || undefined}
      className={cn(
        buttonVariants({ variant: isActive ? 'secondary' : 'ghost', size: 'sm' }),
        'size-9! px-0 tabular-nums max-lg:size-11!',
        isActive && 'font-semibold',
        disabledLink,
        className,
      )}
      {...props}
    />
  )
}

function PaginationPrevious({ className, text = 'Anterior', ...props }: React.ComponentProps<'a'> & { text?: string }) {
  return (
    <a
      data-slot="pagination-previous"
      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-9! max-lg:h-11!', disabledLink, className)}
      {...props}>
      <Icon name="chevron-left" size={16} />
      <span>{text}</span>
    </a>
  )
}

function PaginationNext({ className, text = 'Próxima', ...props }: React.ComponentProps<'a'> & { text?: string }) {
  return (
    <a
      data-slot="pagination-next"
      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-9! max-lg:h-11!', disabledLink, className)}
      {...props}>
      <span>{text}</span>
      <Icon name="chevron-right" size={16} />
    </a>
  )
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn('text-muted-foreground flex size-9 items-center justify-center max-lg:size-11', className)}
      {...props}>
      <Icon name="more-horizontal" size={16} />
      <span className="sr-only">Mais páginas</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
