import type { Budget } from '@/app/db/schemas/budget-schema'

import type { TransactionFilters } from '@/services/transaction-service'

import { getMonthRangeBrazil } from './date-utils'

export function getBudgetTransactionFilters(
  budget: Pick<Budget, 'spaceId' | 'category' | 'month'>,
): TransactionFilters {
  const [year, month] = budget.month.split('-').map(Number)
  const { start, end } = getMonthRangeBrazil(year, month - 1)

  return {
    spaceId: budget.spaceId,
    category: budget.category,
    type: 'saida',
    dateFrom: start,
    dateTo: end,
  }
}
