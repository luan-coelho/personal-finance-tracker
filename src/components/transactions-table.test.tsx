import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'

import type { TransactionWithUser } from '@/app/db/schemas'

import { TransactionsTable } from './transactions-table'

const transaction: TransactionWithUser = {
  id: 'transaction-1',
  spaceId: 'space-1',
  userId: 'user-1',
  type: 'saida',
  amount: '12.34',
  date: new Date('2026-10-10T15:00:00.000Z'),
  description: 'Compra de mercado',
  category: 'Alimentação/Mercado',
  reserveId: null,
  tags: ['casa'],
  createdAt: new Date('2026-10-10T15:00:00.000Z'),
  updatedAt: null,
}

function renderTable(transactions: TransactionWithUser[], readOnly?: boolean) {
  const client = new QueryClient()
  return renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <TransactionsTable transactions={transactions} readOnly={readOnly} />
    </QueryClientProvider>,
  )
}

describe('TransactionsTable readOnly', () => {
  it('preserves transaction details and removes the actions column in read-only mode', () => {
    const html = renderTable([transaction], true)

    assert.ok(html.includes('Compra de mercado'))
    assert.ok(html.includes('Alimentação/Mercado'))
    assert.ok(html.includes('12,34'))
    assert.ok(html.includes('casa'))
    assert.equal(html.includes('Abrir menu'), false)
    assert.equal((html.match(/data-slot="table-cell"/g) ?? []).length, 6)
    assert.equal((html.match(/data-slot="table-head"/g) ?? []).length, 6)
  })

  it('preserves actions by default', () => {
    const html = renderTable([transaction])

    assert.ok(html.includes('Abrir menu'))
    assert.equal((html.match(/data-slot="table-cell"/g) ?? []).length, 7)
  })

  it('shows an empty budget without suggesting transaction creation', () => {
    const html = renderTable([], true)

    assert.ok(html.includes('Nenhuma saída neste orçamento.'))
    assert.equal(html.includes('Comece criando'), false)
  })
})
