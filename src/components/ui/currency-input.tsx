'use client'

import { forwardRef } from 'react'

import { Input } from '@/components/ui/input'

import { cn } from '@/lib/utils'

interface CurrencyInputProps extends Omit<React.ComponentProps<'input'>, 'onChange' | 'type'> {
  value: string
  onValueChange: (value: string) => void
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value
      // Permite apenas dígitos, pontos (milhar) e vírgula (decimal)
      const cleaned = rawValue.replace(/[^\d.,]/g, '')
      onValueChange(cleaned)
    }

    return (
      <div className="relative">
        <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm">R$</span>
        <Input
          ref={ref}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          className={cn('pl-10', className)}
          {...props}
        />
      </div>
    )
  },
)

CurrencyInput.displayName = 'CurrencyInput'
