'use client'

import { addDays, format, isAfter, isBefore, startOfDay, subDays } from 'date-fns'
import * as React from 'react'

import { IconButton } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Icon } from '@/components/ui/icon'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { cn } from '@/lib/utils'

/**
 * Radar DateField (`.sst-datefield*`): gatilho com cara de campo (44px, raio 10,
 * borda `border`, fundo `card`, ícone `calendar` 18 em `muted-fg`, valor em DM Mono
 * `dd/MM/yyyy`) e popover de 296px com o `Calendar` e o chip "Hoje". Nunca o seletor
 * nativo. Erro por `aria-invalid` (o `FormControl` já repassa) ou pela prop `invalid`.
 *
 * ```tsx
 * <DatePicker date={value} onSelect={setValue} />
 * <FormControl><DatePicker date={field.value} onSelect={field.onChange} showNavigation /></FormControl>
 * ```
 */

/** Classes do gatilho de campo de data, compartilhadas com o DateRangeField. */
export const dateFieldTriggerClassName = cn(
  'h-control-lg rounded-control border-input bg-card text-foreground flex w-full min-w-0 cursor-pointer items-center gap-2.5 border px-3.5 text-left text-sm leading-5 transition-[border-color,box-shadow] duration-[120ms] outline-none max-lg:text-base',
  'hover:border-border-strong',
  'focus-visible:border-primary focus-visible:shadow-focus-ring data-[state=open]:border-primary data-[state=open]:shadow-focus-ring',
  'aria-invalid:border-error aria-invalid:focus-visible:border-error aria-invalid:data-[state=open]:border-error aria-invalid:focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--error)_25%,transparent)] aria-invalid:data-[state=open]:shadow-[0_0_0_3px_color-mix(in_srgb,var(--error)_25%,transparent)]',
  'disabled:hover:border-input disabled:cursor-not-allowed disabled:opacity-45',
)

/** Chip de atalho do rodapé do calendário (`.sst-cal__chip`): 28px, 12/500. */
export const calendarChipClassName =
  'inline-flex h-7 cursor-pointer items-center rounded-full border border-input bg-card px-2.5 font-medium text-foreground text-xs leading-4 max-lg:h-9 max-lg:px-3.5 max-lg:text-[13px] outline-none hover:bg-accent focus-visible:shadow-focus-ring disabled:cursor-not-allowed disabled:opacity-45'

export function formatDateBR(date: Date) {
  return format(date, 'dd/MM/yyyy')
}

export interface DatePickerProps
  extends Omit<React.ComponentProps<'button'>, 'onSelect' | 'value' | 'defaultValue' | 'children' | 'type'> {
  /** Data selecionada. */
  date?: Date
  /** Recebe o dia escolhido (o popover fecha). */
  onSelect?: (date: Date | undefined) => void
  /** Texto do gatilho vazio, em DM Sans `muted-fg`. Padrão: "dd/mm/aaaa". */
  placeholder?: string
  disabled?: boolean
  /** Borda e anel na família error (equivale a `aria-invalid`). */
  invalid?: boolean
  /** Primeiro dia selecionável. */
  fromDate?: Date
  /** Último dia selecionável. */
  toDate?: Date
  /** Mês exibido ao abrir quando não há data. */
  defaultMonth?: Date
  /** Botões de dia anterior/próximo ao lado do campo. */
  showNavigation?: boolean
  /** Popover controlado. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Classe do contêiner com os botões de navegação (só com `showNavigation`; o `className` vai para o gatilho). */
  wrapperClassName?: string
}

export function DatePicker({
  date,
  onSelect,
  placeholder = 'dd/mm/aaaa',
  disabled = false,
  invalid,
  fromDate,
  toDate,
  defaultMonth,
  showNavigation = false,
  open: openProp,
  onOpenChange,
  className,
  wrapperClassName,
  'aria-invalid': ariaInvalid,
  ...props
}: DatePickerProps) {
  const [openState, setOpenState] = React.useState(false)
  const open = openProp ?? openState
  const setOpen = (next: boolean) => {
    setOpenState(next)
    onOpenChange?.(next)
  }

  const min = fromDate ? startOfDay(fromDate) : undefined
  const max = toDate ? startOfDay(toDate) : undefined
  const isOutOfBounds = (day: Date) =>
    (min !== undefined && isBefore(startOfDay(day), min)) || (max !== undefined && isAfter(startOfDay(day), max))

  const today = startOfDay(new Date())
  const yesterday = subDays(today, 1)
  const previousDay = subDays(date ?? today, 1)
  const nextDay = addDays(date ?? today, 1)

  const select = (day: Date | undefined) => {
    onSelect?.(day)
    setOpen(false)
  }

  const field = (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-slot="date-picker"
          disabled={disabled}
          aria-invalid={invalid || ariaInvalid || undefined}
          className={cn(dateFieldTriggerClassName, className)}
          {...props}>
          <Icon name="calendar" size={18} className="text-muted-foreground" />
          {date ? (
            <span className="min-w-0 flex-1 truncate font-mono">{formatDateBR(date)}</span>
          ) : (
            <span className="text-muted-foreground min-w-0 flex-1 truncate">{placeholder}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent sideOffset={6} className="w-[296px] gap-3 max-lg:w-[328px]">
        <Calendar
          mode="single"
          selected={date}
          onSelect={select}
          autoFocus
          defaultMonth={date ?? defaultMonth}
          startMonth={fromDate}
          endMonth={toDate}
          disabled={[...(min ? [{ before: min }] : []), ...(max ? [{ after: max }] : [])]}
        />
        <div className="border-border flex flex-wrap items-center gap-1.5 border-t pt-3">
          <button
            type="button"
            className={calendarChipClassName}
            disabled={isOutOfBounds(today)}
            onClick={() => select(today)}>
            Hoje
          </button>
          <button
            type="button"
            className={calendarChipClassName}
            disabled={isOutOfBounds(yesterday)}
            onClick={() => select(yesterday)}>
            Ontem
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )

  if (!showNavigation) return field

  return (
    <div data-slot="date-picker-group" className={cn('flex w-full min-w-0 items-center gap-2', wrapperClassName)}>
      <IconButton
        type="button"
        icon="chevron-left"
        label="Dia anterior"
        variant="outline"
        size="lg"
        disabled={disabled || isOutOfBounds(previousDay)}
        onClick={() => onSelect?.(previousDay)}
      />
      <div className="min-w-0 flex-1">{field}</div>
      <IconButton
        type="button"
        icon="chevron-right"
        label="Próximo dia"
        variant="outline"
        size="lg"
        disabled={disabled || isOutOfBounds(nextDay)}
        onClick={() => onSelect?.(nextDay)}
      />
    </div>
  )
}
