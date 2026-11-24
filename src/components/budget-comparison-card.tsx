'use client'

import { budgetStatusMeta, getBudgetStatus } from '@/components/budget-card'
import { CategoryIcon } from '@/components/category-icon'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

import { formatCurrency } from '@/lib/currency'

interface BudgetComparison {
  category: string
  currentAmount: number
  currentSpent: number
  currentPercentage: number
  previousAmount?: number
  previousSpent?: number
  previousPercentage?: number
}

interface BudgetComparisonCardProps {
  comparisons: BudgetComparison[]
  currentMonth: string
  previousMonth: string
  isLoading?: boolean
}

function MonthColumn({
  label,
  spent,
  percentage,
  category,
}: {
  label: string
  spent?: number
  percentage?: number
  category: string
}) {
  const hasValue = spent !== undefined

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-muted-foreground text-xs leading-4 font-medium">{label}</span>
      <span className="font-semibold tabular-nums">{hasValue ? formatCurrency(spent) : '—'}</span>
      {hasValue && (
        <Progress
          size="sm"
          value={percentage || 0}
          tone={budgetStatusMeta[getBudgetStatus(percentage || 0)].progressTone}
          aria-label={`${label}: uso do orçamento ${category}`}
        />
      )}
    </div>
  )
}

export function BudgetComparisonCard({
  comparisons,
  currentMonth,
  previousMonth,
  isLoading,
}: BudgetComparisonCardProps) {
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
    })
  }

  const header = (
    <CardHeader>
      <CardTitle>Comparação com o mês anterior</CardTitle>
      <CardDescription>
        Gastos de {formatMonth(currentMonth)} e {formatMonth(previousMonth)}
      </CardDescription>
    </CardHeader>
  )

  if (isLoading) {
    return (
      <Card aria-busy="true">
        {header}
        <CardContent className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-md" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (comparisons.length === 0) {
    return (
      <Card>
        {header}
        <CardContent>
          <EmptyState
            icon="chart-bar"
            title="Sem dados para comparar"
            description="Os orçamentos filtrados não têm correspondência no mês anterior."
            className="py-8"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      {header}
      <CardContent>
        <ul className="divide-border flex flex-col divide-y">
          {comparisons.map(comparison => {
            const hasComparison = comparison.previousSpent !== undefined
            const spentDiff = hasComparison ? comparison.currentSpent - (comparison.previousSpent || 0) : 0
            const percentageDiff = hasComparison
              ? comparison.currentPercentage - (comparison.previousPercentage || 0)
              : 0
            const isWorse = spentDiff > 0

            return (
              <li key={comparison.category} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="flex min-w-0 items-center gap-2.5 text-sm font-semibold">
                    <CategoryIcon name={comparison.category} size={16} className="shrink-0" />
                    <span className="truncate">{comparison.category}</span>
                  </h4>
                  {hasComparison && (
                    <Badge
                      tone={isWorse ? 'error' : 'success'}
                      icon={isWorse ? 'trending-up' : 'trending-down'}
                      className="tabular-nums">
                      {isWorse ? 'Aumento de ' : 'Redução de '}
                      {Math.abs(percentageDiff).toFixed(1)}%
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <MonthColumn
                    label="Mês atual"
                    spent={comparison.currentSpent}
                    percentage={comparison.currentPercentage}
                    category={comparison.category}
                  />
                  <MonthColumn
                    label="Mês anterior"
                    spent={hasComparison ? comparison.previousSpent || 0 : undefined}
                    percentage={comparison.previousPercentage}
                    category={comparison.category}
                  />
                </div>

                {hasComparison && (
                  <p className="text-muted-foreground text-xs leading-4">
                    {isWorse ? 'Aumento' : 'Redução'} de{' '}
                    <span className="tabular-nums">{formatCurrency(Math.abs(spentDiff))}</span> em relação ao mês
                    anterior
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
