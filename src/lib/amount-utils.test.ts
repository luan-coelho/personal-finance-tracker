import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { formatBrazilianAmountInput } from './amount-utils'

describe('formatBrazilianAmountInput', () => {
  it('formats typed digits as a Brazilian currency amount without the currency symbol', () => {
    assert.equal(formatBrazilianAmountInput('1'), '0,01')
    assert.equal(formatBrazilianAmountInput('12'), '0,12')
    assert.equal(formatBrazilianAmountInput('1234'), '12,34')
    assert.equal(formatBrazilianAmountInput('123456'), '1.234,56')
  })

  it('removes non-digits and clears empty or zero values', () => {
    assert.equal(formatBrazilianAmountInput('R$ 1.234,56'), '1.234,56')
    assert.equal(formatBrazilianAmountInput(''), '')
    assert.equal(formatBrazilianAmountInput('0'), '')
  })
})
