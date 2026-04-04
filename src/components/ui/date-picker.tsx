'use client'

import { addDays, format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import * as React from 'react'
import { FieldError } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { cn } from '@/lib/utils'

interface DatePickerProps {
  date?: Date
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  fromDate?: Date
  toDate?: Date
  showValidationIcon?: boolean
  error?: FieldError
  defaultMonth?: Date
  showNavigation?: boolean
}

export function DatePicker({
  date,
  onSelect,
  placeholder = 'Selecione uma data',
  disabled = false,
  className,
  fromDate,
  toDate,
  showValidationIcon = false,
  error,
  defaultMonth,
  showNavigation = false,
}: DatePickerProps) {
  const hasError = error !== undefined && error !== null
  const showErrorIcon = showValidationIcon && hasError

  const handlePreviousDay = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!onSelect) return
    const baseDate = date ?? new Date()
    const newDate = subDays(baseDate, 1)
    if (fromDate && newDate < fromDate) return
    onSelect(newDate)
  }

  const handleNextDay = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!onSelect) return
    const baseDate = date ?? new Date()
    const newDate = addDays(baseDate, 1)
    if (toDate && newDate > toDate) return
    onSelect(newDate)
  }

  return (
    <div className="relative flex items-center gap-1">
      {showNavigation && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 shrink-0 border-zinc-300"
          disabled={disabled || (fromDate && date ? subDays(date, 1) < fromDate : false)}
          onClick={handlePreviousDay}>
          <ChevronLeft className="size-4" />
        </Button>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'h-10 w-[280px] justify-start rounded-sm text-left font-normal',
              !date && 'text-muted-foreground',
              hasError ? 'border-destructive' : 'border-zinc-300',
              showErrorIcon ? 'pr-10' : '',
              showNavigation && 'flex-1 w-auto',
              className,
            )}
            disabled={disabled}>
            {!showErrorIcon && <CalendarIcon className="mr-2 h-4 w-4" />}
            {date ? format(date, 'PPP', { locale: ptBR }) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onSelect}
            initialFocus
            locale={ptBR}
            fromDate={fromDate}
            toDate={toDate}
            defaultMonth={defaultMonth ?? date}
            disabled={[...(fromDate ? [{ before: fromDate }] : []), ...(toDate ? [{ after: toDate }] : [])]}
          />
        </PopoverContent>
      </Popover>
      {showNavigation && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 shrink-0 border-zinc-300"
          disabled={disabled || (toDate && date ? addDays(date, 1) > toDate : false)}
          onClick={handleNextDay}>
          <ChevronRight className="size-4" />
        </Button>
      )}
      {showErrorIcon && (
        <div className="absolute inset-y-0 right-3 flex items-center">
          <AlertCircle className="text-destructive size-4" />
        </div>
      )}
    </div>
  )
}
