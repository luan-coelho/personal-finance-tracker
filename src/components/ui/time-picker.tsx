'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

import { TimePickerInput } from './time-picker-input'

interface TimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  className?: string
}

export function TimePicker({ date, setDate, className }: TimePickerProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null)
  const hourRef = React.useRef<HTMLInputElement>(null)

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="grid gap-1 text-center">
        <TimePickerInput
          picker="hours"
          date={date}
          setDate={setDate}
          ref={hourRef}
          onRightFocus={() => minuteRef.current?.focus()}
        />
      </div>
      <div className="flex h-10 items-center">
        <span className="text-sm">:</span>
      </div>
      <div className="grid gap-1 text-center">
        <TimePickerInput
          picker="minutes"
          date={date}
          setDate={setDate}
          ref={minuteRef}
          onLeftFocus={() => hourRef.current?.focus()}
        />
      </div>
    </div>
  )
}

interface TimePickerDemoProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export function TimePickerDemo({ value, onChange, placeholder, className }: TimePickerDemoProps) {
  const [date, setDate] = React.useState<Date | undefined>(() => {
    if (value) {
      const [hours, minutes] = value.split(':').map(Number)
      const newDate = new Date()
      newDate.setHours(hours, minutes, 0, 0)
      return newDate
    }
    return undefined
  })

  React.useEffect(() => {
    if (date && onChange) {
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      onChange(`${hours}:${minutes}`)
    }
  }, [date, onChange])

  React.useEffect(() => {
    if (value && value !== '') {
      const [hours, minutes] = value.split(':').map(Number)
      if (!isNaN(hours) && !isNaN(minutes)) {
        const newDate = new Date()
        newDate.setHours(hours, minutes, 0, 0)
        setDate(newDate)
      }
    } else {
      setDate(undefined)
    }
  }, [value])

  return (
    <div className={cn('bg-background flex items-center rounded-md border px-3 py-2', className)}>
      {date ? (
        <TimePicker date={date} setDate={setDate} />
      ) : (
        <span className="text-muted-foreground text-sm">{placeholder || 'Selecione um horário'}</span>
      )}
    </div>
  )
}
