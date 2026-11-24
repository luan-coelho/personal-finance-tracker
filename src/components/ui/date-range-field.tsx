'use client'

import { isAfter, isBefore, startOfDay, subDays, subMonths } from 'date-fns'
import * as React from 'react'

import { Calendar } from '@/components/ui/calendar'
import { calendarChipClassName, dateFieldTriggerClassName, formatDateBR } from '@/components/ui/date-picker'
import { Icon } from '@/components/ui/icon'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { cn } from '@/lib/utils'

/**
 * Radar DateRangeField (`.sst-daterange*`): um gatilho com cara de campo
 * ("01/11/2026 – 24/11/2026" em DM Mono) e um popover com dois meses lado a lado
 * (um abaixo do outro em telas estreitas). Início e fim sólidos em `primary`,
 * intervalo em `primary-soft`, hoje tracejado. O primeiro clique define o início e
 * deixa o fim em aberto; o segundo fecha o período e o popover (um fim anterior ao
 * início inverte os dois). Rodapé com atalhos Hoje · 7 dias · 30 dias (contados até hoje).
 *
 * ```tsx
 * <DateRangeField
 *   value={{ from: filters.dateFrom, to: filters.dateTo }}
 *   onChange={({ from, to }) => setFilters({ ...filters, dateFrom: from, dateTo: to })}
 * />
 * ```
 */

export interface DateRangeValue {
  from?: Date
  to?: Date
}

export interface DateRangePreset {
  /** Texto do chip de 28px: "Hoje", "7 dias", "30 dias". */
  label: string
  /** Tamanho do período terminando hoje, em dias (1 = só hoje). */
  days: number
}

export const DEFAULT_DATE_RANGE_PRESETS: DateRangePreset[] = [
  { label: 'Hoje', days: 1 },
  { label: '7 dias', days: 7 },
  { label: '30 dias', days: 30 },
]

export interface DateRangeFieldProps
  extends Omit<React.ComponentProps<'button'>, 'value' | 'defaultValue' | 'onChange' | 'children' | 'type'> {
  value?: DateRangeValue
  /** Chamado a cada dia escolhido (`to` vazio enquanto o fim está em aberto) ou atalho aplicado. */
  onChange?: (value: DateRangeValue) => void
  /** Texto de cada ponta vazia. Padrão: "dd/mm/aaaa". */
  placeholder?: string
  /** Atalhos do rodapé; padrão Hoje · 7 dias · 30 dias. Lista vazia esconde o rodapé. */
  presets?: DateRangePreset[]
  /** Meses no popover. Padrão: 2. */
  numberOfMonths?: 1 | 2
  /** Primeiro e último dias selecionáveis. */
  fromDate?: Date
  toDate?: Date
  disabled?: boolean
  /** Borda e anel na família error (equivale a `aria-invalid`). */
  invalid?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Alinhamento do popover em relação ao gatilho. Padrão: `start`. */
  align?: 'start' | 'center' | 'end'
}

export function DateRangeField({
  value,
  onChange,
  placeholder = 'dd/mm/aaaa',
  presets = DEFAULT_DATE_RANGE_PRESETS,
  numberOfMonths = 2,
  fromDate,
  toDate,
  disabled = false,
  invalid,
  open: openProp,
  onOpenChange,
  align = 'start',
  className,
  'aria-invalid': ariaInvalid,
  ...props
}: DateRangeFieldProps) {
  const [openState, setOpenState] = React.useState(false)
  const open = openProp ?? openState
  // true enquanto o início foi escolhido e o próximo clique define o fim.
  const [pickingEnd, setPickingEnd] = React.useState(false)

  const setOpen = (next: boolean) => {
    if (next) setPickingEnd(Boolean(value?.from && !value?.to))
    setOpenState(next)
    onOpenChange?.(next)
  }

  const min = fromDate ? startOfDay(fromDate) : undefined
  const max = toDate ? startOfDay(toDate) : undefined
  const today = startOfDay(new Date())

  const handleDay = (day: Date) => {
    const picked = startOfDay(day)
    if (!pickingEnd || !value?.from) {
      onChange?.({ from: picked, to: undefined })
      setPickingEnd(true)
      return
    }
    const start = startOfDay(value.from)
    onChange?.(isBefore(picked, start) ? { from: picked, to: start } : { from: start, to: picked })
    setPickingEnd(false)
    setOpen(false)
  }

  const applyPreset = (preset: DateRangePreset) => {
    onChange?.({ from: subDays(today, Math.max(preset.days, 1) - 1), to: today })
    setPickingEnd(false)
    setOpen(false)
  }

  const presetDisabled = (preset: DateRangePreset) => {
    const from = subDays(today, Math.max(preset.days, 1) - 1)
    return (min !== undefined && isBefore(from, min)) || (max !== undefined && isAfter(today, max))
  }

  const defaultMonth = value?.from ?? (numberOfMonths === 2 ? subMonths(today, 1) : today)
  const empty = !value?.from && !value?.to

  const part = (date: Date | undefined) =>
    date ? (
      <span className="font-mono">{formatDateBR(date)}</span>
    ) : (
      <span className="text-muted-foreground">{placeholder}</span>
    )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-slot="date-range-field"
          data-empty={empty || undefined}
          disabled={disabled}
          aria-invalid={invalid || ariaInvalid || undefined}
          className={cn(dateFieldTriggerClassName, className)}
          {...props}>
          <Icon name="calendar" size={18} className="text-muted-foreground" />
          <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate whitespace-nowrap">
            {part(value?.from)}
            <span aria-hidden="true" className="text-muted-foreground">
              –
            </span>
            {part(value?.to)}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent sideOffset={6} align={align} className="w-[296px] gap-3 sm:w-auto">
        <Calendar
          mode="range"
          numberOfMonths={numberOfMonths}
          selected={value?.from ? { from: value.from, to: value.to } : undefined}
          onSelect={(_range, triggerDate) => handleDay(triggerDate)}
          autoFocus
          defaultMonth={defaultMonth}
          startMonth={fromDate}
          endMonth={toDate}
          disabled={[...(min ? [{ before: min }] : []), ...(max ? [{ after: max }] : [])]}
          classNames={{ month: 'sm:w-[262px]' }}
        />
        {presets.length > 0 && (
          <div className="border-border flex flex-wrap items-center gap-1.5 border-t pt-3">
            {presets.map(preset => (
              <button
                key={preset.label}
                type="button"
                className={calendarChipClassName}
                disabled={presetDisabled(preset)}
                onClick={() => applyPreset(preset)}>
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
