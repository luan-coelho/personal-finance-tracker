import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { pushRecentCategory, sortCategoriesByRecency } from './recent-categories'

describe('sortCategoriesByRecency', () => {
  it('puts recently used categories first, most recent first, and keeps the rest in order', () => {
    const categories = ['Aluguel', 'Farmácia', 'Lazer', 'Mercado', 'Transporte']

    assert.deepEqual(sortCategoriesByRecency(categories, ['Mercado', 'Farmácia']), [
      'Mercado',
      'Farmácia',
      'Aluguel',
      'Lazer',
      'Transporte',
    ])
  })

  it('ignores recent categories that no longer exist', () => {
    assert.deepEqual(sortCategoriesByRecency(['Aluguel', 'Mercado'], ['Extinta', 'Mercado']), ['Mercado', 'Aluguel'])
  })

  it('returns the original order when nothing was used yet', () => {
    assert.deepEqual(sortCategoriesByRecency(['Aluguel', 'Mercado'], []), ['Aluguel', 'Mercado'])
  })
})

describe('pushRecentCategory', () => {
  it('moves a repeated category to the front without duplicating it', () => {
    assert.deepEqual(pushRecentCategory(['Mercado', 'Lazer'], 'Lazer'), ['Lazer', 'Mercado'])
  })

  it('keeps only the most recent entries up to the limit', () => {
    assert.deepEqual(pushRecentCategory(['B', 'C'], 'A', 2), ['A', 'B'])
  })
})
