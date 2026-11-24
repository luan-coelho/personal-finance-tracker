'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

const textareaClasses = [
  'block field-sizing-content min-h-24 w-full resize-none rounded-control border border-input bg-card px-3.5 py-3 text-foreground text-sm outline-none',
  'transition-[border-color,box-shadow,background-color] duration-120',
  'placeholder:text-muted-foreground',
  'hover:not-focus:not-disabled:not-read-only:not-aria-invalid:border-border-strong',
  'focus:not-read-only:not-aria-invalid:border-primary focus:not-read-only:not-aria-invalid:shadow-focus-ring',
  'aria-invalid:not-disabled:border-error aria-invalid:focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--error)_25%,transparent)]',
  'disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none',
  'read-only:not-disabled:border-dashed read-only:not-disabled:bg-transparent read-only:not-disabled:focus:not-aria-invalid:border-border-strong',
]

interface TextareaProps extends React.ComponentProps<'textarea'> {
  /** Contador "118/500" em `font-mono` 12 abaixo do campo. Padrão: sim quando há `maxLength`. */
  showCount?: boolean
}

/**
 * Radar Textarea (`.sst-textarea`): mínimo 96px, padding 12/14, raio 10, cresce com o conteúdo
 * (`field-sizing: content`), mesmos estados do Input. O `className` vai sempre no `<textarea>`.
 */
function Textarea({ className, showCount, maxLength, onChange, ...props }: TextareaProps) {
  const withCount = showCount ?? maxLength != null
  const [uncontrolledLength, setUncontrolledLength] = React.useState(() => String(props.defaultValue ?? '').length)
  const length = props.value != null ? String(props.value).length : uncontrolledLength

  const textarea = (
    <textarea
      data-slot="textarea"
      maxLength={maxLength}
      className={cn(textareaClasses, className)}
      onChange={event => {
        if (props.value == null) setUncontrolledLength(event.target.value.length)
        onChange?.(event)
      }}
      {...props}
    />
  )

  if (!withCount) return textarea

  const over = maxLength != null && length > maxLength

  return (
    <div data-slot="textarea-wrapper" className="flex min-w-0 flex-col gap-1.5">
      {textarea}
      <div className="text-muted-foreground flex justify-end text-xs">
        <span className={cn('font-mono tabular-nums', over && 'text-error-text')}>
          {maxLength != null ? `${length}/${maxLength}` : length}
        </span>
      </div>
    </div>
  )
}

export type { TextareaProps }
export { Textarea }
