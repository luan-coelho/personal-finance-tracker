import type * as React from 'react'

import { cn } from '@/lib/utils'

interface SpinnerProps extends Omit<React.ComponentProps<'span'>, 'children'> {
  /** Diâmetro em px (padrão 16, `icon-sm`). */
  size?: number
  /** Texto para leitor de tela. Sem ele o spinner é decorativo (aria-hidden). */
  label?: string
}

/**
 * Spinner do Radar (`.sst-btn__spinner`): anel de 2px em `currentColor` com um quarto
 * transparente, `sst-spin` 0,8s linear. Parado com `prefers-reduced-motion`.
 */
function Spinner({ size = 16, label, className, style, ...props }: SpinnerProps) {
  const a11y = label ? { role: 'status' as const, 'aria-label': label } : { 'aria-hidden': true as const }

  return (
    <span
      data-slot="spinner"
      className={cn(
        'inline-block shrink-0 animate-[sst-spin_0.8s_linear_infinite] rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none',
        className,
      )}
      style={{ width: size, height: size, ...style }}
      {...a11y}
      {...props}
    />
  )
}

export type { SpinnerProps }
export { Spinner }
