'use client'

import { format } from 'date-fns'
import { ptBR as dateFnsPtBR } from 'date-fns/locale'
import * as React from 'react'
import { type DayButton, DayPicker, getDefaultClassNames } from 'react-day-picker'
import { ptBR } from 'react-day-picker/locale'

import { Icon } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

/**
 * Calendário Radar (`.sst-cal*`), a grade usada por DatePicker e DateRangeField.
 * Cabeçalho com botões redondos de 32px e mês em 14/600 ("Novembro 2026"),
 * dias da semana "D S T Q Q S S" em 12/500 `muted-fg`, células de 34px com 13px
 * tabular. Hoje: contorno tracejado 1,5px `primary`. Selecionado: `primary`.
 * Intervalo: `primary-soft` com pontas arredondadas. Locale padrão: ptBR.
 * Usa react-day-picker 10 (`startMonth`/`endMonth`/`autoFocus`; nada de `fromDate`/`initialFocus`).
 */

type CalendarProps = React.ComponentProps<typeof DayPicker>

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale = ptBR,
  navLayout = 'around',
  formatters,
  components,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()

  const ownClassNames: Partial<typeof defaultClassNames> = {
    root: 'w-full',
    months: 'relative flex flex-col gap-6 sm:flex-row',
    month: 'relative grid w-full min-w-0 grid-cols-[32px_1fr_32px] items-center gap-y-3',
    nav: 'contents',
    month_caption: 'col-start-2 row-start-1 flex h-control-sm items-center justify-center',
    caption_label: 'font-semibold text-foreground text-sm leading-5 select-none',
    button_previous:
      'col-start-1 row-start-1 inline-flex size-control-sm cursor-pointer items-center justify-center rounded-full bg-transparent p-0 text-foreground outline-none hover:bg-accent focus-visible:shadow-focus-ring aria-disabled:cursor-not-allowed aria-disabled:opacity-45 aria-disabled:hover:bg-transparent',
    button_next:
      'col-start-3 row-start-1 inline-flex size-control-sm cursor-pointer items-center justify-center rounded-full bg-transparent p-0 text-foreground outline-none hover:bg-accent focus-visible:shadow-focus-ring aria-disabled:cursor-not-allowed aria-disabled:opacity-45 aria-disabled:hover:bg-transparent',
    // Tabela em blocos: as linhas viram grades de 7 colunas com 2px de gap, como `.sst-cal__grid`.
    month_grid: 'col-span-3 block w-full border-collapse [&>thead]:block',
    weekdays: 'grid grid-cols-7 gap-0.5',
    weekday: 'text-center font-medium text-muted-foreground text-xs leading-4 select-none',
    weeks: 'mt-3 flex flex-col gap-0.5',
    week: 'grid grid-cols-7 gap-0.5',
    week_number_header: 'select-none',
    week_number: 'text-center text-muted-foreground text-xs select-none',
    day: 'group/day relative p-0 text-center select-none',
    hidden: 'invisible',
    footer: 'col-span-3',
  }

  const mergedClassNames = Object.fromEntries(
    Object.keys({ ...defaultClassNames, ...classNames }).map(key => {
      const k = key as keyof typeof defaultClassNames
      return [k, cn(defaultClassNames[k], ownClassNames[k], classNames?.[k])]
    }),
  ) as typeof defaultClassNames

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={locale}
      navLayout={navLayout}
      className={cn('group/calendar', className)}
      formatters={{
        formatCaption: (month, _options, dateLib) =>
          capitalize(
            dateLib ? dateLib.format(month, 'LLLL yyyy') : format(month, 'LLLL yyyy', { locale: dateFnsPtBR }),
          ),
        formatWeekdayName: (weekday, _options, dateLib) =>
          (dateLib
            ? dateLib.format(weekday, 'EEEEE')
            : format(weekday, 'EEEEE', { locale: dateFnsPtBR })
          ).toUpperCase(),
        ...formatters,
      }}
      classNames={mergedClassNames}
      components={{
        Root: CalendarRoot,
        Chevron: CalendarChevron,
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarRoot({
  className,
  rootRef,
  ...props
}: React.ComponentProps<'div'> & { rootRef?: React.Ref<HTMLDivElement> }) {
  return <div data-slot="calendar" ref={rootRef} className={className} {...props} />
}

function CalendarChevron({
  className,
  orientation,
}: {
  className?: string
  orientation?: 'up' | 'down' | 'left' | 'right'
}) {
  const name = orientation === 'left' ? 'chevron-left' : orientation === 'right' ? 'chevron-right' : 'chevron-down'
  return <Icon name={name} size={18} className={className} />
}

function CalendarDayButton({ className, day, modifiers, ...props }: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  const rangeStart = modifiers.range_start
  const rangeEnd = modifiers.range_end
  const rangeMiddle = modifiers.range_middle
  const single = modifiers.selected && !rangeStart && !rangeEnd && !rangeMiddle
  const solid = single || rangeStart || rangeEnd
  const hasRange = rangeStart !== rangeEnd

  return (
    <button
      ref={ref}
      data-day={day.isoDate}
      data-selected-single={single || undefined}
      data-range-start={rangeStart || undefined}
      data-range-end={rangeEnd || undefined}
      data-range-middle={rangeMiddle || undefined}
      className={cn(
        'text-foreground flex h-[34px] w-full cursor-pointer items-center justify-center rounded-full border-[1.5px] border-transparent bg-transparent p-0 text-[13px] font-normal tabular-nums outline-none',
        'hover:bg-accent focus-visible:shadow-focus-ring',
        modifiers.outside && 'text-muted-foreground',
        modifiers.today && 'border-primary text-primary-text border-dashed font-semibold',
        rangeMiddle &&
          'bg-primary-soft text-primary-soft-fg hover:bg-primary-soft rounded-none group-first/day:rounded-l-full group-last/day:rounded-r-full',
        solid && 'bg-primary text-primary-foreground hover:bg-primary font-semibold',
        rangeStart && hasRange && 'rounded-r-none group-last/day:rounded-r-full',
        rangeEnd && hasRange && 'rounded-l-none group-first/day:rounded-l-full',
        modifiers.disabled && 'cursor-not-allowed opacity-45 hover:bg-transparent',
        className,
      )}
      {...props}
    />
  )
}

export type { CalendarProps }
export { Calendar, CalendarDayButton }
