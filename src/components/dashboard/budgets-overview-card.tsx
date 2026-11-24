import Link from 'next/link'

import type { BudgetWithSpending } from '@/app/db/schemas'

import { budgetStatusMeta } from '@/components/budget-card'
import { CategoryIconTile } from '@/components/category-icon'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Progress } from '@/components/ui/progress'

import { getBudgetStatus } from '@/lib/budget-status'
import { formatCurrency } from '@/lib/currency'
import { expectedPaceRatio } from '@/lib/dashboard-insights'
import type { DashboardOverview } from '@/lib/dashboard-types'
import { routes } from '@/lib/routes'
import { cn } from '@/lib/utils'

import { DashboardCard } from './dashboard-shared'

const TOP_BUDGETS = 4

function BudgetRow({ budget }: { budget: BudgetWithSpending }) {
  const status = getBudgetStatus(budget.percentage)
  const meta = budgetStatusMeta[status]

  return (
    <Link
      href={`${routes.frontend.admin.budgets.index}/${budget.id}`}
      className="hover:bg-accent focus-visible:shadow-focus-ring flex min-w-0 items-center gap-3 rounded-md px-2 py-2 transition-colors duration-120 outline-none">
      <CategoryIconTile name={budget.category} />
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="flex min-w-0 items-baseline justify-between gap-3">
          <span className="truncate text-sm leading-5 font-medium">{budget.category}</span>
          <span className="text-muted-foreground text-xs leading-4 whitespace-nowrap tabular-nums">
            <span className="text-foreground text-sm font-medium">{formatCurrency(budget.spent)}</span> de{' '}
            {formatCurrency(budget.amount)}
          </span>
        </span>
        <span className="flex items-center gap-3">
          <Progress
            size="sm"
            value={Math.min(budget.percentage, 100)}
            tone={meta.progressTone}
            className="flex-1"
            aria-label={`${Math.round(budget.percentage)}% de ${budget.category}`}
          />
          <span
            className={cn(
              'inline-flex w-14 shrink-0 items-center justify-end gap-1 text-xs leading-4 font-medium tabular-nums',
              status === 'within' && 'text-muted-foreground',
              status === 'near' && 'text-warning-text',
              status === 'exceeded' && 'text-error-text',
            )}>
            {status !== 'within' ? <Icon name={meta.icon} size={12} /> : null}
            {Math.round(budget.percentage)}%
          </span>
        </span>
      </span>
    </Link>
  )
}

/**
 * Orçamentos do mês: barra do total com o risco de ritmo (onde o gasto deveria estar hoje)
 * e os orçamentos mais apertados.
 */
export function BudgetsOverviewCard({ overview, className }: { overview: DashboardOverview; className?: string }) {
  const { budgets, period } = overview

  if (budgets.length === 0) {
    return (
      <DashboardCard title="Orçamentos do mês" className={className}>
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-muted-foreground max-w-72 text-sm leading-5">
            Defina limites por categoria para acompanhar o ritmo e receber alertas antes de estourar.
          </p>
          <Button asChild size="sm" icon="plus">
            <Link href={routes.frontend.admin.budgets.create}>Criar orçamento</Link>
          </Button>
        </div>
      </DashboardCard>
    )
  }

  const totalBudget = budgets.reduce((sum, budget) => sum + Number(budget.amount), 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0)
  const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
  const status = getBudgetStatus(percentage)
  const pace = expectedPaceRatio(period)
  const pacePercent = pace === null ? null : pace * 100
  const aheadOfPace = pacePercent !== null && percentage > pacePercent

  const tightest = [...budgets].sort((a, b) => b.percentage - a.percentage).slice(0, TOP_BUDGETS)

  return (
    <DashboardCard
      title="Orçamentos do mês"
      description={`${budgets.length} ${budgets.length === 1 ? 'categoria' : 'categorias'} com limite`}
      href={routes.frontend.admin.budgets.index}
      className={className}>
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-2xl leading-8 font-bold tracking-[-0.02em] tabular-nums">
            {formatCurrency(totalSpent)}
          </span>
          <span className="text-muted-foreground text-[13px] leading-5 tabular-nums">
            de {formatCurrency(totalBudget)} · {Math.round(percentage)}%
          </span>
        </div>
        <div className="relative">
          <Progress
            value={Math.min(percentage, 100)}
            tone={budgetStatusMeta[status].progressTone}
            aria-label={`${Math.round(percentage)}% do total dos orçamentos`}
          />
          {pacePercent !== null ? (
            <span
              aria-hidden
              className="bg-foreground absolute -top-1 -bottom-1 w-0.5 rounded-full"
              style={{ left: `calc(${Math.min(pacePercent, 100)}% - 1px)` }}
            />
          ) : null}
        </div>
        {pacePercent !== null ? (
          <p className={cn('text-xs leading-4', aheadOfPace ? 'text-warning-text font-medium' : 'text-muted-foreground')}>
            {aheadOfPace
              ? `Acima do ritmo: o esperado até hoje era ${Math.round(pacePercent)}% do limite.`
              : `Dentro do ritmo: o risco marca ${Math.round(pacePercent)}% do mês.`}
          </p>
        ) : null}
      </div>

      <div className="-mx-2 flex flex-col gap-0.5">
        {tightest.map(budget => (
          <BudgetRow key={budget.id} budget={budget} />
        ))}
      </div>
    </DashboardCard>
  )
}
