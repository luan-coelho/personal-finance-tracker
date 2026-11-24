'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { Tabs as TabsPrimitive } from 'radix-ui'
import type * as React from 'react'

import { cn } from '@/lib/utils'

function Tabs({ className, orientation = 'horizontal', ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      orientation={orientation}
      className={cn('group/tabs flex flex-col gap-4', className)}
      {...props}
    />
  )
}

// `underline` for page sections; `segmented` to switch the view of the same list.
const tabsListVariants = cva('group/tabs-list font-sans', {
  variants: {
    variant: {
      underline: 'border-border flex gap-1 border-b',
      segmented:
        'bg-muted inline-flex max-w-full [scrollbar-width:none] items-center gap-0.5 self-start overflow-x-auto rounded-full p-[3px]',
    },
  },
  defaultVariants: {
    variant: 'underline',
  },
})

function TabsList({
  className,
  variant = 'underline',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'text-muted-foreground relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 text-sm font-medium whitespace-nowrap transition-colors duration-120 outline-none',
        'hover:text-foreground focus-visible:shadow-focus-ring data-active:text-foreground disabled:pointer-events-none disabled:opacity-45 data-active:font-semibold',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0',
        // underline
        'group-data-[variant=underline]/tabs-list:h-control-lg group-data-[variant=underline]/tabs-list:focus-visible:rounded-control group-data-[variant=underline]/tabs-list:px-3.5',
        'after:bg-primary after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-t-[2px] after:opacity-0 group-data-[variant=underline]/tabs-list:data-active:after:opacity-100',
        // segmented
        'group-data-[variant=segmented]/tabs-list:h-[34px] group-data-[variant=segmented]/tabs-list:rounded-full group-data-[variant=segmented]/tabs-list:px-3.5 group-data-[variant=segmented]/tabs-list:text-[13px]',
        'group-data-[variant=segmented]/tabs-list:data-active:bg-card group-data-[variant=segmented]/tabs-list:data-active:shadow-sh-sm group-data-[variant=segmented]/tabs-list:data-active:focus-visible:shadow-[var(--sh-sm),var(--focus-ring)]',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn('flex-1 outline-none', className)} {...props} />
}

export { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants }
