import { addDays, addMonths, addWeeks, addYears, getDay, setDate } from 'date-fns'

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface RecurrenceInput {
  dueDate: Date | null
  recurrenceType: RecurrenceType
  recurrenceInterval: number
  recurrenceDaysOfWeek: number[]
  recurrenceDayOfMonth: number | null
  recurrenceEndsAt: Date | null
}

function normalizeInterval(value: number) {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1
}

function clampDayOfMonth(year: number, month: number, day: number) {
  return Math.min(day, new Date(year, month + 1, 0).getDate())
}

function isAfterEnd(date: Date, end: Date | null) {
  return !!end && date.getTime() > end.getTime()
}

export function getNextRecurrenceDate(input: RecurrenceInput): Date | null {
  if (!input.dueDate || input.recurrenceType === 'none') return null

  const interval = normalizeInterval(input.recurrenceInterval)
  let next: Date | null = null

  if (input.recurrenceType === 'daily') {
    next = addDays(input.dueDate, interval)
  }

  if (input.recurrenceType === 'weekly') {
    const days = [...new Set(input.recurrenceDaysOfWeek)].sort((a, b) => a - b)
    const currentDay = getDay(input.dueDate)
    const nextWeekday = days.find(day => day > currentDay)
    if (nextWeekday !== undefined) {
      next = addDays(input.dueDate, nextWeekday - currentDay)
    } else if (days.length > 0) {
      next = addDays(input.dueDate, 7 * interval - currentDay + days[0])
    } else {
      next = addWeeks(input.dueDate, interval)
    }
  }

  if (input.recurrenceType === 'monthly') {
    const base = addMonths(input.dueDate, interval)
    const requestedDay = input.recurrenceDayOfMonth ?? input.dueDate.getDate()
    const day = clampDayOfMonth(base.getFullYear(), base.getMonth(), requestedDay)
    next = setDate(base, day)
  }

  if (input.recurrenceType === 'yearly') {
    next = addYears(input.dueDate, interval)
  }

  if (!next || isAfterEnd(next, input.recurrenceEndsAt)) return null
  return next
}
