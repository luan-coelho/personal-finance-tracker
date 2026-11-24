'use client'

import { useEffect, useState } from 'react'

import { Button, IconButton } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import type { UseMonthSelectorReturn } from '@/hooks/use-month-selector'

import { getBrazilCurrentYearMonth } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

import { useMonthSelectorContext } from '@/providers/month-selector-provider'

export interface MonthSelectorProps {
  onMonthChange?: (state: UseMonthSelectorReturn) => void
  /** Mostra o intervalo de datas do mês no popover. */
  showDateRange?: boolean
  showTodayButton?: boolean
  showAllButton?: boolean
  /** Mantido por compatibilidade: o controle Radar já é compacto. */
  compact?: boolean
  className?: string
  onShowAll?: () => void
}

const shortMonthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

/**
 * Seletor de mês Radar: controle de 40px com anterior/próximo e o rótulo do mês,
 * que abre um popover com o ano e a grade de meses. Fica à esquerda do `PageActions`.
 * Abaixo de `lg` ocupa a linha inteira, com 48px e setas de 40px nas pontas.
 */
export function MonthSelector({
  onMonthChange,
  showDateRange = true,
  showTodayButton = true,
  showAllButton = false,
  className,
  onShowAll,
}: MonthSelectorProps) {
  const monthSelector = useMonthSelectorContext()
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(monthSelector.selectedYear)

  // Avisa o pai quando o mês muda
  // biome-ignore lint/correctness/useExhaustiveDependencies: dispara só na troca de mês/ano
  useEffect(() => {
    onMonthChange?.(monthSelector)
  }, [monthSelector.selectedMonth, monthSelector.selectedYear, onMonthChange])

  const handleOpenChange = (next: boolean) => {
    if (next) setViewYear(monthSelector.selectedYear)
    setOpen(next)
  }

  const handleSelectMonth = (month: number) => {
    monthSelector.goToDate(new Date(viewYear, month, 1))
    setOpen(false)
  }

  const handleTodayClick = () => {
    monthSelector.goToCurrentMonth()
    setOpen(false)
  }

  const today = getBrazilCurrentYearMonth()
  const label = `${monthSelector.monthName} de ${monthSelector.selectedYear}`

  return (
    <div data-slot="month-selector" className={cn('flex flex-wrap items-center gap-2 max-lg:w-full', className)}>
      <div
        role="group"
        aria-label="Mês"
        className="border-input bg-card h-control-md inline-flex items-center gap-0.5 rounded-full border p-[3px] max-lg:flex max-lg:w-full">
        <IconButton icon="chevron-left" label="Mês anterior" size="sm" onClick={monthSelector.goToPreviousMonth} />

        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={`Escolher mês, atual: ${label}`}
              className="hover:bg-accent data-[state=open]:bg-accent focus-visible:shadow-focus-ring text-foreground h-control-sm inline-flex min-w-40 items-center justify-center gap-2 rounded-full px-3 text-sm leading-5 font-medium whitespace-nowrap transition-colors duration-150 outline-none max-lg:flex-1">
              <Icon name="calendar" size={16} className="text-muted-foreground" />
              <span className="tabular-nums">{label}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={8} className="flex w-72 flex-col gap-3 p-3">
            <div className="flex items-center justify-between">
              <IconButton
                icon="chevron-left"
                label="Ano anterior"
                size="sm"
                onClick={() => setViewYear(year => year - 1)}
              />
              <span className="text-sm leading-5 font-semibold tabular-nums">{viewYear}</span>
              <IconButton
                icon="chevron-right"
                label="Próximo ano"
                size="sm"
                onClick={() => setViewYear(year => year + 1)}
              />
            </div>

            <div className="grid grid-cols-3 gap-1">
              {shortMonthNames.map((short, month) => {
                const isSelected = month === monthSelector.selectedMonth && viewYear === monthSelector.selectedYear
                const isToday = month === today.month && viewYear === today.year
                return (
                  <button
                    key={short}
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`${monthSelector.monthNames[month]} de ${viewYear}`}
                    onClick={() => handleSelectMonth(month)}
                    className={cn(
                      'focus-visible:shadow-focus-ring h-control-sm inline-flex items-center justify-center rounded-full text-sm leading-5 font-medium transition-colors duration-150 outline-none',
                      isSelected
                        ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
                        : 'text-foreground hover:bg-accent',
                      !isSelected && isToday && 'text-primary-text font-semibold',
                    )}>
                    {short}
                  </button>
                )
              })}
            </div>

            {showDateRange && (
              <p className="border-border text-muted-foreground border-t pt-3 text-xs leading-4 tabular-nums">
                {monthSelector.monthStartDate.toLocaleDateString('pt-BR')} a{' '}
                {monthSelector.monthEndDate.toLocaleDateString('pt-BR')}
              </p>
            )}
          </PopoverContent>
        </Popover>

        <IconButton icon="chevron-right" label="Próximo mês" size="sm" onClick={monthSelector.goToNextMonth} />
      </div>

      {showTodayButton && !monthSelector.isCurrentMonth && (
        <Button variant="ghost" onClick={handleTodayClick}>
          Mês atual
        </Button>
      )}

      {showAllButton && (
        <Button variant="ghost" onClick={onShowAll}>
          Ver todas
        </Button>
      )}
    </div>
  )
}
