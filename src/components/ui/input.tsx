import type * as React from 'react'

import { Icon, type IconName } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

/**
 * Estados do campo Radar (`.sst-input`) aplicados direto no `<input>`:
 * hover `border-strong`, foco borda `primary` + `focus-ring`, erro (`aria-invalid`) borda `error`
 * com anel error 25% só no foco, desabilitado em `muted`, somente-leitura tracejado sem anel.
 */
const inputStateClasses = [
  'hover:not-focus:not-disabled:not-read-only:not-aria-invalid:border-border-strong',
  'focus:not-read-only:not-aria-invalid:border-primary focus:not-read-only:not-aria-invalid:shadow-focus-ring',
  'aria-invalid:not-disabled:border-error aria-invalid:focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--error)_25%,transparent)]',
  'disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none',
  'read-only:not-disabled:border-dashed read-only:not-disabled:bg-transparent read-only:not-disabled:focus:not-aria-invalid:border-border-strong',
]

/** Invólucro (`.sst-input`) quando há ícone, prefixo ou ação; o estado vem das props. */
const shellBase =
  'flex h-control-lg w-full min-w-0 items-center gap-2.5 rounded-control border border-input bg-card px-3.5 text-foreground text-sm transition-[border-color,box-shadow,background-color] duration-120'

const shellState = {
  default: 'hover:not-focus-within:border-border-strong focus-within:border-primary focus-within:shadow-focus-ring',
  invalid: 'border-error focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--error)_25%,transparent)]',
  disabled: 'cursor-not-allowed border-border bg-muted text-muted-foreground shadow-none',
  readonly: 'border-dashed bg-transparent focus-within:border-border-strong',
} as const

interface InputProps extends Omit<React.ComponentProps<'input'>, 'prefix'> {
  /** Ícone Radar à esquerda, em `muted-fg` (`search`, `map-pin`, `mail`). */
  icon?: IconName
  /** Texto fixo antes do valor, em `muted-fg` ("R$", "+55"). */
  prefix?: string
  /** Ação dentro do campo, à direita: um `IconButton size="sm"` (`ghost` para limpar, `secondary` para consultar). */
  action?: React.ReactNode
}

/**
 * Radar Input: 44px (`control-lg`), raio 10, borda `border` sobre `card`, texto 14.
 * Sem `icon`/`prefix`/`action` renderiza só o `<input>` (o `className` vai nele);
 * com eles renderiza o invólucro e o `className` vai no invólucro. `ref` e demais props
 * vão sempre para o `<input>`.
 */
function Input({ className, type, icon, prefix, action, ...props }: InputProps) {
  if (!icon && !prefix && !action) {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          'h-control-lg rounded-control border-input bg-card text-foreground w-full min-w-0 border px-3.5 text-sm outline-none',
          'transition-[border-color,box-shadow,background-color] duration-120',
          'placeholder:text-muted-foreground',
          'file:text-foreground file:me-3 file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium',
          inputStateClasses,
          className,
        )}
        {...props}
      />
    )
  }

  const invalid = props['aria-invalid'] === true || props['aria-invalid'] === 'true'
  const state = props.disabled ? 'disabled' : props.readOnly ? 'readonly' : invalid ? 'invalid' : 'default'

  return (
    <div
      data-slot="input-shell"
      data-state={state}
      className={cn(
        shellBase,
        shellState[state],
        invalid && state === 'readonly' && 'border-error',
        action && 'pr-1.5',
        className,
      )}>
      {icon ? <Icon name={icon} size={18} className="text-muted-foreground" /> : null}
      {prefix ? <span className="text-muted-foreground whitespace-nowrap">{prefix}</span> : null}
      <input
        type={type}
        data-slot="input"
        className="placeholder:text-muted-foreground h-full w-full min-w-0 flex-1 border-0 bg-transparent p-0 text-inherit outline-none disabled:cursor-not-allowed"
        {...props}
      />
      {invalid && !action ? <Icon name="alert-circle" size={18} className="text-error shrink-0" /> : null}
      {action ? <span className="inline-flex shrink-0 items-center">{action}</span> : null}
    </div>
  )
}

export type { InputProps }
export { Input, inputStateClasses }
