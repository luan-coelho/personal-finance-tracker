import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { renderToStaticMarkup } from 'react-dom/server'

import type { TransactionWithUser } from '@/app/db/schemas'

import { groupTransactionsByDay, TransactionsList } from './transactions-list'

const base: TransactionWithUser = {
  id: 'transaction-1',
  spaceId: 'space-1',
  userId: 'user-1',
  type: 'saida',
  amount: '12.34',
  date: new Date(2026, 9, 10, 12),
  description: 'Compra de mercado',
  category: 'Alimentação/Mercado',
  reserveId: null,
  tags: ['casa'],
  createdAt: new Date(2026, 9, 10, 12),
  updatedAt: null,
  user: { id: 'user-1', name: 'Ana Souza', email: 'ana@example.com', image: null },
}

describe('groupTransactionsByDay', () => {
  it('groups by local day in the received order and nets income against expenses', () => {
    const groups = groupTransactionsByDay([
      base,
      { ...base, id: 'transaction-2', type: 'entrada', amount: '100.00' },
      { ...base, id: 'transaction-3', type: 'reserva', amount: '50.00' },
      { ...base, id: 'transaction-4', date: new Date(2026, 9, 9, 8) },
    ])

    assert.deepEqual(
      groups.map(group => [group.key, group.transactions.length]),
      [
        ['2026-10-10', 3],
        ['2026-10-09', 1],
      ],
    )
    assert.equal(groups[0].net.toFixed(2), '87.66')
    assert.equal(groups[1].net.toFixed(2), '-12.34')
  })

  it('shows no day balance when the day only has reserve movements', () => {
    const [group] = groupTransactionsByDay([{ ...base, type: 'reserva' }])

    assert.equal(group.hasNet, false)
  })
})

describe('TransactionsList', () => {
  it('renders one tappable row per transaction with category, tag, author and signed amount', () => {
    const html = renderToStaticMarkup(<TransactionsList transactions={[base]} />)

    assert.equal((html.match(/data-slot="list-item"/g) ?? []).length, 1)
    assert.ok(html.includes('<button'), 'a linha inteira é o alvo de toque')
    assert.ok(html.includes('Compra de mercado'))
    assert.ok(html.includes('Alimentação/Mercado · casa · Ana'))
    assert.ok(html.includes('-R$'))
    assert.ok(html.includes('text-error-text'))
  })

  it('renders rows without actions in read-only mode', () => {
    const html = renderToStaticMarkup(<TransactionsList transactions={[base]} readOnly />)

    assert.equal(html.includes('<button'), false)
  })
})
