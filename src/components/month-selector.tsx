'use client'

import { useMonthSelectorContext } from '@/providers/month-selector-provider'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { UseMonthSelectorReturn } from '@/hooks/use-month-selector'

import { cn } from '@/lib/utils'

export interface MonthSelectorProps {
  onMonthChange?: (state: UseMonthSelectorReturn) => void
  showDateRange?: boolean
  showTodayButton?: boolean
  showAllButton?: boolean
  compact?: boolean
  className?: string
  onShowAll?: () => void
}

export function MonthSelector({
  onMonthChange,
  showDateRange = true,
  showTodayButton = true,
  showAllButton = false,
  compact = false,
  className,
  onShowAll,
}: MonthSelectorProps) {
  const monthSelector = useMonthSelectorContext()

  // Notify parent when month changes
  useEffect(() => {
    onMonthChange?.(monthSelector)
  }, [monthSelector.selectedMonth, monthSelector.selectedYear, onMonthChange])

  const handlePreviousMonth = () => {
    monthSelector.goToPreviousMonth()
  }

  const handleNextMonth = () => {
    monthSelector.goToNextMonth()
  }

  const handleYearChange = (year: string) => {
    monthSelector.setYear(parseInt(year))
  }

  const handleTodayClick = () => {
    monthSelector.goToCurrentMonth()
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button variant="outline" size="sm" onClick={handlePreviousMonth} className="h-8 w-30 p-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <span className="font-medium">{monthSelector.monthName}</span>
          <Select value={monthSelector.selectedYear.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-40">
              {monthSelector.yearOptions.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" size="sm" onClick={handleNextMonth} className="h-8 w-8 p-0">
          <ChevronRight className="h-4 w-4" />
        </Button>

        {showTodayButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTodayClick}
            disabled={monthSelector.isCurrentMonth}
            className="h-8 text-xs">
            Hoje
          </Button>
        )}

        {showAllButton && (
          <Button variant="ghost" size="sm" onClick={onShowAll} className="h-8 text-xs">
            Ver Todas
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex flex-col items-center gap-2 md:flex-row">
              <h2 className="text-xl font-semibold">{monthSelector.monthName}</h2>
              <Select value={monthSelector.selectedYear.toString()} onValueChange={handleYearChange}>
                <SelectTrigger className="w-30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthSelector.yearOptions.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" size="sm" onClick={handleNextMonth} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {showTodayButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTodayClick}
                disabled={monthSelector.isCurrentMonth}
                className="h-7 text-xs">
                Hoje
              </Button>
            )}
            {showAllButton && (
              <Button variant="ghost" size="sm" onClick={onShowAll} className="h-7 text-xs">
                Ver Todas
              </Button>
            )}
            {showDateRange && (
              <div className="text-muted-foreground text-sm">
                {monthSelector.monthStartDate.toLocaleDateString('pt-BR')} -{' '}
                {monthSelector.monthEndDate.toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
