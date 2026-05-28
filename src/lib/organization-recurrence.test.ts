import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { insertOrganizationTaskSchema } from '@/app/db/schemas/organization-task-schema'

import { getNextRecurrenceDate, getNextRecurrenceReminderAt, type RecurrenceInput } from './organization-recurrence'

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

describe('getNextRecurrenceReminderAt', () => {
  it('keeps the same reminder offset when advancing recurrence', () => {
    const reminderAt = new Date('2026-05-27T12:00:00.000Z')
    const currentDueDate = new Date('2026-05-27T03:00:00.000Z')
    const nextDueDate = new Date('2026-05-29T03:00:00.000Z')

    assert.equal(
      getNextRecurrenceReminderAt({
        reminderAt,
        currentDueDate,
        nextDueDate,
      })?.toISOString(),
      '2026-05-29T12:00:00.000Z',
    )
  })

  it('returns null when there is no current reminder', () => {
    assert.equal(
      getNextRecurrenceReminderAt({
        reminderAt: null,
        currentDueDate: new Date('2026-05-27T03:00:00.000Z'),
        nextDueDate: new Date('2026-05-28T03:00:00.000Z'),
      }),
      null,
    )
  })
})

describe('insertOrganizationTaskSchema recurrence validation', () => {
  it('requires a due date for recurring tasks', () => {
    const result = insertOrganizationTaskSchema.safeParse({
      spaceId: '11111111-1111-4111-8111-111111111111',
      title: 'Pagar conta',
      createdById: '22222222-2222-4222-8222-222222222222',
      recurrenceType: 'monthly',
      recurrenceInterval: 1,
      recurrenceDaysOfWeek: [],
      labelIds: [],
    })

    assert.equal(result.success, false)
  })
})
