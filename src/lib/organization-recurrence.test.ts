import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { getNextRecurrenceDate, type RecurrenceInput } from './organization-recurrence'

function input(overrides: Partial<RecurrenceInput>): RecurrenceInput {
  return {
    dueDate: new Date('2026-05-27T03:00:00.000Z'),
    recurrenceType: 'none',
    recurrenceInterval: 1,
    recurrenceDaysOfWeek: [],
    recurrenceDayOfMonth: null,
    recurrenceEndsAt: null,
    ...overrides,
  }
}

describe('getNextRecurrenceDate', () => {
  it('returns null for non-recurring tasks', () => {
    assert.equal(getNextRecurrenceDate(input({ recurrenceType: 'none' })), null)
  })

  it('advances daily recurrence by interval', () => {
    assert.equal(
      getNextRecurrenceDate(input({ recurrenceType: 'daily', recurrenceInterval: 2 }))?.toISOString(),
      '2026-05-29T03:00:00.000Z',
    )
  })

  it('advances weekly recurrence to the next selected weekday', () => {
    assert.equal(
      getNextRecurrenceDate(input({ recurrenceType: 'weekly', recurrenceDaysOfWeek: [5] }))?.toISOString(),
      '2026-05-29T03:00:00.000Z',
    )
  })

  it('advances monthly recurrence to the requested day of month', () => {
    assert.equal(
      getNextRecurrenceDate(input({ recurrenceType: 'monthly', recurrenceDayOfMonth: 10 }))?.toISOString(),
      '2026-06-10T03:00:00.000Z',
    )
  })

  it('returns null when the next recurrence is after the end date', () => {
    assert.equal(
      getNextRecurrenceDate(
        input({
          recurrenceType: 'daily',
          recurrenceEndsAt: new Date('2026-05-27T23:59:59.999Z'),
        }),
      ),
      null,
    )
  })
})
