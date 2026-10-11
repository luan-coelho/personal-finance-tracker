import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { Transaction } from '@/app/db/schemas/transaction-schema'

import { getTransactionFormContextDefaults } from './transaction-form-utils'

const monthStartDate = new Date('2026-10-01T03:00:00.000Z')
const initialDate = new Date('2026-10-11T03:00:00.000Z')
const currentUserId = 'current-user'
const transaction: Transaction = {
  id: 'transaction-1',
  type: 'saida',
  amount: '30.00',
  date: new Date('2026-10-02T03:00:00.000Z'),
  description: 'Bônus celular Ester',
  category: 'Bônus celular',
  reserveId: null,
  tags: [],
  spaceId: 'space-1',
  userId: 'original-author',
  createdAt: monthStartDate,
  updatedAt: null,
}
const context = {
  existingTransactions: [],
  monthStartDate,
  userId: currentUserId,
  mode: 'create' as const,
}

describe('getTransactionFormContextDefaults', () => {
  it('preserves existing creation defaults when no initial values are provided', () => {
    const defaults = getTransactionFormContextDefaults(context)

    assert.equal(defaults.type, 'saida')
    assert.equal(defaults.category, undefined)
    assert.equal(defaults.date, monthStartDate)
    assert.equal(defaults.userId, currentUserId)
  })

  it('prefills the budget category, type and date before considering existing transactions', () => {
    const defaults = getTransactionFormContextDefaults({
      ...context,
      initialValues: { type: 'saida', category: 'Alimentação/Mercado', date: initialDate },
      existingTransactions: [{ ...transaction, date: new Date('2026-10-20T03:00:00.000Z') }],
    })

    assert.equal(defaults.type, 'saida')
    assert.equal(defaults.category, 'Alimentação/Mercado')
    assert.equal(defaults.date, initialDate)
    assert.equal(defaults.userId, currentUserId)
  })

  it('uses the latest existing transaction when no explicit date is provided without sorting the input', () => {
    const latestDate = new Date('2026-10-20T03:00:00.000Z')
    const existingTransactions = [transaction, { ...transaction, id: 'transaction-2', date: latestDate }]
    const defaults = getTransactionFormContextDefaults({ ...context, existingTransactions })

    assert.equal(defaults.date.getTime(), latestDate.getTime())
    assert.equal(existingTransactions[0], transaction)
  })

  it('keeps transaction fields and original author when editing another member transaction', () => {
    const defaults = getTransactionFormContextDefaults({
      ...context,
      mode: 'edit',
      transaction,
      initialValues: { type: 'entrada', category: 'Outro orçamento', date: initialDate },
    })

    assert.equal(defaults.type, transaction.type)
    assert.equal(defaults.category, transaction.category)
    assert.equal(defaults.date.getTime(), transaction.date.getTime())
    assert.equal(defaults.userId, transaction.userId)
  })

  it('does not replace an existing empty category with a budget default', () => {
    const defaults = getTransactionFormContextDefaults({
      ...context,
      mode: 'edit',
      transaction: { ...transaction, type: 'reserva', category: null },
      initialValues: { category: 'Outro orçamento' },
    })

    assert.equal(defaults.type, 'reserva')
    assert.equal(defaults.category, undefined)
  })

  it('assigns a copied transaction to the current user while retaining its field values', () => {
    const defaults = getTransactionFormContextDefaults({ ...context, mode: 'copy', transaction })

    assert.equal(defaults.type, transaction.type)
    assert.equal(defaults.category, transaction.category)
    assert.equal(defaults.date.getTime(), transaction.date.getTime())
    assert.equal(defaults.userId, currentUserId)
  })
})
