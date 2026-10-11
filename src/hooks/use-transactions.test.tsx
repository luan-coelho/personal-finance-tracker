import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'

import { budgetKeys } from './use-budgets'
import { transactionKeys, useCreateTransaction, useDeleteTransaction, useUpdateTransaction } from './use-transactions'

function renderMutations(client: QueryClient) {
  let mutations:
    | {
        create: ReturnType<typeof useCreateTransaction>
        update: ReturnType<typeof useUpdateTransaction>
        delete: ReturnType<typeof useDeleteTransaction>
      }
    | undefined

  function CaptureMutations() {
    mutations = {
      create: useCreateTransaction(),
      update: useUpdateTransaction(),
      delete: useDeleteTransaction(),
    }
    return null
  }

  renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <CaptureMutations />
    </QueryClientProvider>,
  )

  assert.ok(mutations)
  return mutations
}

describe('transaction mutation cache invalidation', () => {
  for (const operation of ['create', 'update', 'delete'] as const) {
    it(`invalidates budget and transaction caches after ${operation}`, async t => {
      const client = new QueryClient({ defaultOptions: { mutations: { retry: false, gcTime: 0 } } })
      t.after(() => client.clear())

      const keys = [
        budgetKeys.withSpending('space-1', '2026-10'),
        budgetKeys.summary('space-1', '2026-10'),
        transactionKeys.list({ spaceId: 'space-1' }, 1, 20),
        transactionKeys.summary({ spaceId: 'space-1' }),
      ]
      for (const key of keys) client.setQueryData(key, { cached: true })
      const unrelatedKey = ['unrelated']
      client.setQueryData(unrelatedKey, { cached: true })

      const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json({ id: 'transaction-1' }))
      const mutations = renderMutations(client)
      const transaction = {
        type: 'saida' as const,
        amount: '125.50',
        date: new Date('2026-10-11T03:00:00.000Z'),
        description: 'Mercado',
        category: 'Alimentação',
        spaceId: 'space-1',
        userId: 'user-1',
        tags: [],
      }

      if (operation === 'create') {
        await mutations.create.mutateAsync(transaction)
      } else if (operation === 'update') {
        await mutations.update.mutateAsync({
          id: 'transaction-1',
          data: { id: 'transaction-1', amount: '125.50' },
        })
      } else {
        await mutations.delete.mutateAsync('transaction-1')
      }

      assert.equal(fetchMock.mock.callCount(), 1)
      for (const key of keys) {
        assert.equal(client.getQueryState(key)?.isInvalidated, true, JSON.stringify(key))
      }
      assert.equal(client.getQueryState(unrelatedKey)?.isInvalidated, false)
    })
  }
})
