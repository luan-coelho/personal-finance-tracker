import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { getBudgetTransactionFilters } from './budget-transaction-utils'

describe('getBudgetTransactionFilters', () => {
  it('selects only expenses from the budget space, exact category and Brazilian month', () => {
    const filters = getBudgetTransactionFilters({
      spaceId: 'space-1',
      category: 'Alimentação/Mercado',
      month: '2026-10',
    })

    assert.equal(filters.spaceId, 'space-1')
    assert.equal(filters.category, 'Alimentação/Mercado')
    assert.equal(filters.type, 'saida')
    assert.equal(filters.dateFrom?.toISOString(), '2026-10-01T03:00:00.000Z')
    assert.equal(filters.dateTo?.toISOString(), '2026-11-01T02:59:59.999Z')
    assert.equal('userId' in filters, false)
    assert.equal('reserveId' in filters, false)
  })

  it('includes the whole December and stops before January begins in Brazil', () => {
    const filters = getBudgetTransactionFilters({ spaceId: 'space-2', category: 'Compras', month: '2026-12' })

    assert.equal(filters.dateFrom?.toISOString(), '2026-12-01T03:00:00.000Z')
    assert.equal(filters.dateTo?.toISOString(), '2027-01-01T02:59:59.999Z')
  })
})
