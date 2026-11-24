import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { addMonths, getDaysInMonth, getMonthLabel, parseMonthString, toMonthString } from './date-utils'

describe('month string helpers', () => {
  it('builds YYYY-MM and normalizes months outside 0–11', () => {
    assert.equal(toMonthString(2026, 0), '2026-01')
    assert.equal(toMonthString(2026, 11), '2026-12')
    assert.equal(toMonthString(2026, -1), '2025-12')
    assert.equal(toMonthString(2026, 12), '2027-01')
  })

  it('parses YYYY-MM into year and 0-based month', () => {
    assert.deepEqual(parseMonthString('2026-10'), { year: 2026, month0: 9 })
  })

  it('adds and subtracts months across year boundaries', () => {
    assert.equal(addMonths('2025-12', 1), '2026-01')
    assert.equal(addMonths('2026-01', -1), '2025-12')
    assert.equal(addMonths('2026-03', -14), '2025-01')
    assert.equal(addMonths('2026-11', -5), '2026-06')
    assert.equal(addMonths('2026-11', 0), '2026-11')
  })

  it('counts days in month, including February in leap years', () => {
    assert.equal(getDaysInMonth(2024, 1), 29)
    assert.equal(getDaysInMonth(2025, 1), 28)
    assert.equal(getDaysInMonth(2000, 1), 29)
    assert.equal(getDaysInMonth(2100, 1), 28)
    assert.equal(getDaysInMonth(2026, 10), 30)
    assert.equal(getDaysInMonth(2026, 11), 31)
  })

  it('labels months in lowercase Portuguese', () => {
    assert.equal(getMonthLabel('2026-10', 'long'), 'outubro')
    assert.equal(getMonthLabel('2026-10', 'short'), 'out')
    assert.equal(getMonthLabel('2026-03', 'long'), 'março')
    assert.equal(getMonthLabel('2026-02', 'short'), 'fev')
  })
})
