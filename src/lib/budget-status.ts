/** Percentual a partir do qual o orçamento está perto do limite. */
export const BUDGET_NEAR_LIMIT = 80

/** Percentual acima do qual o orçamento está estourado. */
export const BUDGET_EXCEEDED = 100

export type BudgetStatus = 'within' | 'near' | 'exceeded'

/** Acima de 100% está estourado; de 80% a 100% (inclusive) está perto do limite. */
export function getBudgetStatus(percentage: number): BudgetStatus {
  if (percentage > BUDGET_EXCEEDED) return 'exceeded'
  if (percentage >= BUDGET_NEAR_LIMIT) return 'near'
  return 'within'
}
