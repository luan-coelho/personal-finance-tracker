import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { getActiveTransactionFiltersCount, parseAmountFilterParam } from './transaction-filter-utils'

describe('parseAmountFilterParam', () => {
  it('parses decimal and Brazilian currency-like values', () => {
    assert.equal(parseAmountFilterParam('125.50'), 125.5)
    assert.equal(parseAmountFilterParam('1.234,56'), 1234.56)
  })

  it('keeps zero as a valid amount limit', () => {
    assert.equal(parseAmountFilterParam('0'), 0)
  })

  it('ignores blank, invalid, and negative amount limits', () => {
    assert.equal(parseAmountFilterParam(null), undefined)
    assert.equal(parseAmountFilterParam(''), undefined)
    assert.equal(parseAmountFilterParam('abc'), undefined)
    assert.equal(parseAmountFilterParam('-10'), undefined)
  })
})

describe('getActiveTransactionFiltersCount', () => {
  it('counts filled scalar values and non-empty arrays', () => {
    assert.equal(
      getActiveTransactionFiltersCount({
        search: 'mercado',
        tags: ['casa'],
        amountFrom: 0,
        amountTo: undefined,
        category: '',
      }),
      3,
    )
  })

  it('ignores undefined, empty strings, and empty arrays', () => {
    assert.equal(
      getActiveTransactionFiltersCount({
        search: '',
        tags: [],
        amountFrom: undefined,
      }),
      0,
    )
  })
})
