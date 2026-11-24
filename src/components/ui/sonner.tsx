'use client'

import { useTheme } from 'next-themes'
import type * as React from 'react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

import { Icon } from '@/components/ui/icon'
import { Spinner } from '@/components/ui/spinner'

import { cn } from '@/lib/utils'

// Radar Toast: solid background in the family's 600/700 shade with white text (same in both themes),
// radius-md, sh-lg, bottom right, at most 3 visible. Neutral toasts use `inverse`.
const toastClassNames = {
  toast:
    'flex w-full items-start gap-3 rounded-md bg-inverse py-3 pr-3 pl-4 font-sans text-sm text-inverse-fg shadow-sh-lg',
  success: 'bg-success-600! text-white!',
  error: 'bg-error-600! text-white!',
  warning: 'bg-warning-700! text-white!',
  info: 'bg-info-600! text-white!',
  loading: 'bg-inverse text-inverse-fg',
  icon: 'inline-flex size-9 shrink-0 items-center justify-center rounded-control bg-current/18',
  content: 'flex min-h-9 min-w-0 flex-1 flex-col justify-center gap-0.5',
  title: 'text-sm leading-5 font-semibold',
  description: 'text-[13px] leading-[18px] opacity-85',
  actionButton: cn(
    'h-control-sm inline-flex shrink-0 cursor-pointer items-center self-center rounded-full border border-current/40 bg-current/14 px-3 text-[13px] font-medium whitespace-nowrap',
    'outline-none hover:bg-current/22 focus-visible:shadow-[0_0_0_3px_rgb(255_255_255/0.45)]',
  ),
  cancelButton: cn(
    'h-control-sm inline-flex shrink-0 cursor-pointer items-center self-center rounded-full px-3 text-[13px] font-medium whitespace-nowrap',
    'outline-none hover:bg-current/14 focus-visible:shadow-[0_0_0_3px_rgb(255_255_255/0.45)]',
  ),
  closeButton: cn(
    'order-last mt-1 inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-0! bg-transparent! text-current!',
    'outline-none hover:bg-current/14! focus-visible:shadow-[0_0_0_3px_rgb(255_255_255/0.45)]',
  ),
}

function Toaster({ toastOptions, style, className, ...props }: ToasterProps) {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      position="bottom-right"
      visibleToasts={3}
      gap={12}
      icons={{
        success: <Icon name="check" size={20} />,
        info: <Icon name="info" size={20} />,
        warning: <Icon name="alert-triangle" size={20} />,
        error: <Icon name="alert-circle" size={20} />,
        loading: <Spinner size={20} />,
        close: <Icon name="x" size={16} />,
      }}
      {...props}
      // Radar defaults that must win over callers: solid tones come from our classes, not Sonner's rich colors.
      richColors={false}
      className={cn('toaster group', className)}
      style={{ '--width': '380px', ...style } as React.CSSProperties}
      toastOptions={{
        duration: 4000,
        ...toastOptions,
        unstyled: true,
        classNames: { ...toastClassNames, ...toastOptions?.classNames },
      }}
    />
  )
}

export { Toaster }
