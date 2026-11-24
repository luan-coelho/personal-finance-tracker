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

function renderTable(transactions: TransactionWithUser[], readOnly?: boolean, actions?: 'all' | 'edit') {
  const client = new QueryClient()
  return renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <TransactionsTable transactions={transactions} readOnly={readOnly} actions={actions} />
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
    assert.ok(html.includes('-R$'), 'saída mostra o sinal negativo')
    assert.ok(html.includes('text-error-text'), 'saída usa o tom de erro')
    assert.equal(html.includes('Mais ações'), false)
    assert.equal((html.match(/data-slot="table-cell"/g) ?? []).length, 5)
    assert.equal((html.match(/data-slot="table-head"/g) ?? []).length, 5)
  })

  it('shows income with a positive sign in the success tone', () => {
    const html = renderTable([{ ...transaction, type: 'entrada' }], true)

    assert.ok(html.includes('+R$'))
    assert.ok(html.includes('text-success-text'))
    assert.equal(html.includes('text-error-text'), false)
  })

  it('preserves actions by default', () => {
    const html = renderTable([transaction])

    assert.ok(html.includes('aria-label="Mais ações: Compra de mercado"'))
    assert.ok(html.includes('data-slot="dropdown-menu-trigger"'))
    assert.equal((html.match(/data-slot="table-cell"/g) ?? []).length, 6)
    assert.equal((html.match(/data-slot="table-head"/g) ?? []).length, 6)
  })

  it('shows only a directly accessible edit action in edit-only mode', () => {
    const html = renderTable([transaction], false, 'edit')

    assert.ok(html.includes('aria-label="Editar transação: Compra de mercado"'))
    assert.ok(html.includes('data-transaction-edit-trigger="transaction-1"'))
    assert.equal(html.includes('Mais ações'), false)
    assert.equal(html.includes('data-slot="dropdown-menu-trigger"'), false)
    assert.equal(html.includes('Duplicar'), false)
    assert.equal(html.includes('Excluir'), false)
    assert.equal((html.match(/data-slot="table-cell"/g) ?? []).length, 6)
    assert.equal((html.match(/data-slot="table-head"/g) ?? []).length, 6)
  })

  it('keeps edit actions hidden when read-only mode is also enabled', () => {
    const html = renderTable([transaction], true, 'edit')

    assert.equal(html.includes('Editar transação:'), false)
    assert.equal(html.includes('data-transaction-edit-trigger'), false)
    assert.equal(html.includes('Mais ações'), false)
    assert.equal((html.match(/data-slot="table-cell"/g) ?? []).length, 5)
  })

  it('shows an empty budget without suggesting transaction creation', () => {
    const html = renderTable([], true)

    assert.ok(html.includes('data-slot="empty-state"'))
    assert.ok(html.includes('Nenhuma saída neste orçamento.'))
    assert.equal(html.includes('Comece criando'), false)
  })
})
