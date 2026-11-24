'use client'

import { EmptyState } from '@/components/ui/empty-state'
import { MetricCard } from '@/components/ui/metric-card'

import type { BudgetSummary as BudgetSummaryType } from '@/hooks/use-budgets'

import { formatCurrency } from '@/lib/currency'

interface BudgetSummaryProps {
  summary: BudgetSummaryType | undefined
  isLoading?: boolean
  month: string
}

function plural(count: number, singular: string, pluralForm: string) {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

export function BudgetSummary({ summary, isLoading, month }: BudgetSummaryProps) {
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCard key={i} label="" value="" loading />
        ))}
      </div>
    )
  }

  if (!summary) {
    return (
      <EmptyState
        bordered
        icon="wallet"
        title="Nenhum orçamento definido"
        description={`Não há orçamentos para ${formatMonth(month)}.`}
      />
    )
  }

  const overallPercentage = summary.totalBudget > 0 ? (summary.totalSpent / summary.totalBudget) * 100 : 0

  const isOverBudget = overallPercentage > 100
  const isNearLimit = overallPercentage >= 80 && overallPercentage <= 100

  const categoryAlerts = [
    summary.categoriesOverBudget > 0 && plural(summary.categoriesOverBudget, 'estourada', 'estouradas'),
    summary.categoriesNearLimit > 0 && `${summary.categoriesNearLimit} perto do limite`,
  ].filter(Boolean)

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        icon="wallet"
        label="Orçado"
        value={formatCurrency(summary.totalBudget)}
        note={plural(summary.categoriesCount, 'categoria', 'categorias')}
      />

      <MetricCard
        icon="trending-down"
        label="Gasto"
        value={formatCurrency(summary.totalSpent)}
        tone={isOverBudget ? 'error' : 'default'}
        progress={overallPercentage}
        note={`${overallPercentage.toFixed(1)}% do orçado`}
        noteTone={isOverBudget ? 'error' : isNearLimit ? 'warning' : undefined}
      />

      <MetricCard
        icon={isOverBudget ? 'alert-circle' : 'piggy-bank'}
        label={isOverBudget ? 'Excedido' : 'Disponível'}
        value={formatCurrency(Math.abs(summary.totalRemaining))}
        tone={isOverBudget ? 'error' : 'success'}
        note={
          summary.totalExceeded > 0
            ? `${formatCurrency(summary.totalExceeded)} acima do limite nas categorias estouradas`
            : 'Disponível para gastos'
        }
        noteTone={summary.totalExceeded > 0 ? 'error' : undefined}
      />

      <MetricCard
        icon="target"
        label="Uso médio"
        value={summary.averagePercentage.toFixed(1)}
        unit="%"
        note={categoryAlerts.length > 0 ? categoryAlerts.join(' · ') : 'Média entre categorias'}
        noteTone={summary.categoriesOverBudget > 0 ? 'error' : summary.categoriesNearLimit > 0 ? 'warning' : undefined}
      />
    </div>
  )
}
