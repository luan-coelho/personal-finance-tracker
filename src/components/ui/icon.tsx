import type { SVGProps } from 'react'

import { type IconName, icons } from '@/lib/icons'
import { cn } from '@/lib/utils'

export type { IconName }

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  /** Tamanho em px (16 badge/chip/botão sm-md, 20 campo/sidebar/menu/botão lg, 24 navegação/lista). */
  size?: number
  strokeWidth?: number
  /** Texto acessível. Sem label o ícone é decorativo (aria-hidden). */
  label?: string
}

export function Icon({ name, size = 20, strokeWidth = 1.5, className, label, ...props }: IconProps) {
  const a11y = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true as const, focusable: 'false' as const }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('shrink-0', className)}
      {...a11y}
      {...props}>
      <path d={icons[name]} />
    </svg>
  )
}
