'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertCircle, Calendar as CalendarIcon } from 'lucide-react'
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
}: DatePickerProps) {
  const hasError = error !== undefined && error !== null
  const showErrorIcon = showValidationIcon && hasError

  return (
    <div className="relative">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'h-10 w-[280px] justify-start rounded-sm text-left font-normal',
              !date && 'text-muted-foreground',
              hasError ? 'border-destructive' : 'border-zinc-300',
              showErrorIcon ? 'pr-10' : '',
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
      {showErrorIcon && (
        <div className="absolute inset-y-0 right-3 flex items-center">
          <AlertCircle className="text-destructive size-4" />
        </div>
      )}
    </div>
  )
}
