'use client'

import type * as React from 'react'

import { Icon, type IconName } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

type ChipSize = 'sm' | 'md' | 'lg'

const CHIP_SIZE: Record<ChipSize, string> = {
  sm: 'h-7',
  md: 'h-control-sm',
  lg: 'h-control-md',
}

interface ChipProps extends Omit<React.ComponentProps<'button'>, 'children'> {
  /** Selecionado: fundo `primary-soft`, texto `primary-soft-fg`, borda `primary` (`aria-pressed` no chip de filtro). */
  selected?: boolean
  /** Mostra o × (ícone `x` 12 num alvo de 20) e torna o chip removível: o corpo deixa de ser clicável. */
  onRemove?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /** Rótulo acessível do ×; padrão "Remover {texto do chip}". */
  removeLabel?: string
  /** Ícone Radar à esquerda (14px; 16px em `lg`). */
  icon?: IconName
  /** Ícone à direita (`chevron-down` em filtro rápido que abre menu). */
  iconRight?: IconName
  /** md 32 (padrão, faixa de filtros) · sm 28 (linha de aplicados) · lg 40 (filtros rápidos). */
  size?: ChipSize
  children?: React.ReactNode
}

/**
 * Radar Chip (`.sst-chip`): cápsula de 32px, 13/16 500, borda `border` sobre `card`.
 * Sem `onRemove` é um botão de filtro com `aria-pressed`; com `onRemove` é uma tag (`span`)
 * com o botão × de 20px.
 */
function Chip({
  selected = false,
  onRemove,
  removeLabel,
  icon,
  iconRight,
  size = 'md',
  disabled,
  className,
  children,
  type,
  ...props
}: ChipProps) {
  const removable = typeof onRemove === 'function'
  const text = typeof children === 'string' || typeof children === 'number' ? String(children) : ''

  const classes = cn(
    'border-input bg-card text-foreground inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 align-middle text-[13px]/4 font-medium whitespace-nowrap',
    CHIP_SIZE[size],
    removable && 'pr-2',
    selected && 'border-primary bg-primary-soft text-primary-soft-fg',
    disabled && 'cursor-not-allowed opacity-45',
    className,
  )

  const content = (
    <>
      {icon ? <Icon name={icon} size={size === 'lg' ? 16 : 14} /> : null}
      <span className="truncate">{children}</span>
      {iconRight ? <Icon name={iconRight} size={14} /> : null}
    </>
  )

  if (removable) {
    return (
      <span
        data-slot="chip"
        data-selected={selected || undefined}
        aria-disabled={disabled || undefined}
        className={classes}
        {...(props as React.ComponentProps<'span'>)}>
        {content}
        <button
          type="button"
          data-slot="chip-remove"
          disabled={disabled}
          aria-label={removeLabel ?? (text ? `Remover ${text}` : 'Remover')}
          onClick={event => {
            event.stopPropagation()
            onRemove(event)
          }}
          className={cn(
            'inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-inherit outline-none',
            'hover:not-disabled:bg-accent focus-visible:shadow-focus-ring transition-[background-color,box-shadow] duration-120 disabled:cursor-not-allowed',
          )}>
          <Icon name="x" size={12} strokeWidth={2} />
        </button>
      </span>
    )
  }

  return (
    <button
      type={type ?? 'button'}
      data-slot="chip"
      aria-pressed={selected}
      disabled={disabled}
      className={cn(
        'focus-visible:shadow-focus-ring cursor-pointer transition-[background-color,border-color,box-shadow] duration-120 outline-none',
        !selected && 'hover:not-disabled:border-border-strong hover:not-disabled:bg-accent',
        classes,
      )}
      {...props}>
      {content}
    </button>
  )
}

export type { ChipProps }
export { Chip }
