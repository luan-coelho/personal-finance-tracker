import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildTransactionUrlQuery,
  getActiveTransactionFiltersCount,
  parseAmountFilterParam,
  parseTransactionUrlFilters,
} from './transaction-filter-utils'

describe('parseTransactionUrlFilters', () => {
  it('reads type, category and userId', () => {
    const params = new URLSearchParams('type=saida&category=Mercado%20%26%20feira&userId=u1')
    assert.deepEqual(parseTransactionUrlFilters(params), { type: 'saida', category: 'Mercado & feira', userId: 'u1' })
  })

  it('ignores unknown types and blank values', () => {
    const params = new URLSearchParams('type=outro&category=%20&userId=')
    assert.deepEqual(parseTransactionUrlFilters(params), {})
  })
})

describe('buildTransactionUrlQuery', () => {
  it('round-trips with parseTransactionUrlFilters', () => {
    const query = buildTransactionUrlQuery({ type: 'saida', category: 'Saúde' })
    assert.equal(query, '?type=saida&category=Sa%C3%BAde')
    assert.deepEqual(parseTransactionUrlFilters(new URLSearchParams(query)), { type: 'saida', category: 'Saúde' })
  })

  it('returns an empty string without filters', () => {
    assert.equal(buildTransactionUrlQuery({}), '')
  })
})

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
