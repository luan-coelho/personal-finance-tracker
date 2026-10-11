import { ilike, sql } from 'drizzle-orm'

import { transactionsTable } from '@/app/db/schemas/transaction-schema'

export function transactionDescriptionSearch(search: string) {
  const normalizedSearch = search.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const normalizedDescription = sql`regexp_replace(
    normalize(${transactionsTable.description}, NFD),
    ${'[\u0300-\u036f]'},
    '',
    'g'
  )`

  return ilike(normalizedDescription, `%${normalizedSearch}%`)
}
