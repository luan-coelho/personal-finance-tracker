'use client'

import type * as React from 'react'

import { Input } from '@/components/ui/input'

import { formatBrazilianAmountInput } from '@/lib/amount-utils'
import { cn } from '@/lib/utils'

interface CurrencyInputProps
  extends Omit<React.ComponentProps<typeof Input>, 'value' | 'defaultValue' | 'onChange' | 'prefix' | 'type'> {
  /** Valor no formato digitado pelo usuário ("1.234,56"); vazio quando zero. */
  value?: string
  /** Recebe o valor já mascarado por `formatBrazilianAmountInput` ("1234" → "12,34"). */
  onChange?: (value: string) => void
}

/**
 * Campo de moeda Radar: Input com prefixo "R$", `inputMode="decimal"` e algarismos tabulares.
 * A máscara é a mesma dos formulários (`formatBrazilianAmountInput`); a normalização para o
 * banco continua em `normalizeBrazilianAmount`. Compatível com `{...field}` do react-hook-form.
 */
function CurrencyInput({ value, onChange, placeholder = '0,00', className, ...props }: CurrencyInputProps) {
  return (
    <Input
      type="text"
      prefix="R$"
      inputMode="decimal"
      autoComplete="off"
      placeholder={placeholder}
      className={cn('tabular-nums', className)}
      value={value ?? ''}
      onChange={event => onChange?.(formatBrazilianAmountInput(event.target.value))}
      {...props}
    />
  )
}

export type { CurrencyInputProps }
export { CurrencyInput }
