import type * as React from 'react'

import { cn } from '@/lib/utils'

// Radar Table: card container (radius-lg, border-subtle, sh-sm), 56px rows, 12/500 muted header,
// hover `accent`, selected (`data-state=selected`) `primary-soft`, no vertical borders or zebra.

function Table({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<'table'> & { containerClassName?: string }) {
  return (
    <div
      data-slot="table-container"
      className={cn(
        'border-border bg-card text-foreground shadow-sh-sm relative w-full min-w-0 overflow-hidden rounded-lg border text-sm',
        containerClassName,
      )}>
      <div data-slot="table-scroll" className="w-full overflow-x-auto">
        <table data-slot="table" className={cn('w-full caption-bottom border-collapse', className)} {...props} />
      </div>
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead data-slot="table-header" className={cn('[&_tr]:h-auto [&_tr]:hover:bg-transparent', className)} {...props} />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" className={cn('[&>tr:last-child>td]:border-b-0', className)} {...props} />
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('border-border border-t font-medium [&>tr]:hover:bg-transparent [&>tr>td]:border-b-0', className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'h-table-row hover:bg-accent has-aria-expanded:bg-accent data-[state=selected]:bg-primary-soft transition-colors duration-120',
        className,
      )}
      {...props}
    />
  )
}

type NumericProps = {
  /** Numbers and dates: right-aligned with tabular figures. */
  numeric?: boolean
}

function TableHead({ className, numeric = false, ...props }: React.ComponentProps<'th'> & NumericProps) {
  return (
    <th
      data-slot="table-head"
      data-numeric={numeric || undefined}
      className={cn(
        'border-border text-muted-foreground border-b px-4 py-3 text-left align-middle text-xs leading-4 font-medium whitespace-nowrap first:pl-6 last:pr-6',
        'has-[[role=checkbox]]:w-14 has-[[role=checkbox]]:py-0 has-[[role=checkbox]]:pr-0',
        numeric && 'text-right',
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, numeric = false, ...props }: React.ComponentProps<'td'> & NumericProps) {
  return (
    <td
      data-slot="table-cell"
      data-numeric={numeric || undefined}
      className={cn(
        'border-border border-b px-4 align-middle first:pl-6 last:pr-6',
        'has-[[role=checkbox]]:w-14 has-[[role=checkbox]]:pr-0',
        numeric && 'text-right tabular-nums',
        className,
      )}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('border-border text-muted-foreground border-t px-6 py-3 text-[13px]', className)}
      {...props}
    />
  )
}

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow }
