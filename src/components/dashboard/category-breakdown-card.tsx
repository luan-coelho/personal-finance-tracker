import Link from 'next/link'

import { CategoryIconTile } from '@/components/category-icon'
import { Icon } from '@/components/ui/icon'
import { Progress } from '@/components/ui/progress'

import { formatCurrency } from '@/lib/currency'
import { percentChange } from '@/lib/dashboard-insights'
import type { DashboardCategory, DashboardOverview } from '@/lib/dashboard-types'
import { getMonthLabel } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

import { DashboardCard, DashboardCardEmpty, transactionsHref } from './dashboard-shared'

const TOP_CATEGORIES = 5
const UNCATEGORIZED = 'Sem categoria'

function ChangeLabel({ change }: { change: number | null }) {
  if (change === null || Math.round(change) === 0) {
    return <span className="text-muted-foreground">—</span>
  }
  const up = change > 0
  return (
    <span className={cn('inline-flex items-center gap-0.5', up ? 'text-error-text' : 'text-success-text')}>
      <Icon name={up ? 'arrow-up' : 'arrow-down'} size={12} strokeWidth={2.5} />
      {Math.abs(Math.round(change))}%
    </span>
  )
}

function CategoryRow({
  category,
  share,
  change,
  href,
  others = false,
}: {
  category: DashboardCategory
  share: number
  change: number | null
  href?: string
  /** Linha que agrupa as categorias fora do top. */
  others?: boolean
}) {
  const content = (
    <>
      {!others ? (
        <CategoryIconTile name={category.category} />
      ) : (
        <span className="bg-muted text-muted-foreground rounded-control inline-flex size-8 shrink-0 items-center justify-center">
          <Icon name="more-horizontal" size={16} />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="flex min-w-0 items-baseline justify-between gap-3">
          <span className="truncate text-sm leading-5 font-medium">{category.category}</span>
          <span className="text-sm leading-5 font-medium whitespace-nowrap tabular-nums">
            {formatCurrency(category.total)}
          </span>
        </span>
        <span className="flex items-center gap-3">
          <Progress size="sm" value={share} className="flex-1" aria-label={`${Math.round(share)}% das saídas`} />
          <span className="text-muted-foreground flex w-24 shrink-0 justify-end gap-2 text-xs leading-4 tabular-nums">
            <span>{Math.round(share)}%</span>
            <ChangeLabel change={change} />
          </span>
        </span>
      </span>
    </>
  )

  const rowClassName = 'flex min-w-0 items-center gap-3 rounded-md px-2 py-2'
  return href ? (
    <Link
      href={href}
      className={cn(
        rowClassName,
        'hover:bg-accent focus-visible:shadow-focus-ring transition-colors duration-120 outline-none',
      )}>
      {content}
    </Link>
  ) : (
    <div className={rowClassName}>{content}</div>
  )
}

/** Para onde foi o dinheiro: top 5 categorias de saída, participação e variação contra o mês anterior. */
export function CategoryBreakdownCard({ overview, className }: { overview: DashboardOverview; className?: string }) {
  const { categories, totals, period, previousMonth } = overview
  const spent = categories.filter(category => category.total > 0)
  const total = totals.current.saidas
  const top = spent.slice(0, TOP_CATEGORIES)
  const rest = spent.slice(TOP_CATEGORIES)

  const compare = (category: DashboardCategory) =>
    percentChange(category.total, period.isCurrentMonth ? category.previousToDateTotal : category.previousTotal)

  const others: DashboardCategory | null = rest.length
    ? {
        category: `Outras ${rest.length} ${rest.length === 1 ? 'categoria' : 'categorias'}`,
        total: rest.reduce((sum, category) => sum + category.total, 0),
        previousTotal: rest.reduce((sum, category) => sum + category.previousTotal, 0),
        previousToDateTotal: rest.reduce((sum, category) => sum + category.previousToDateTotal, 0),
        count: rest.reduce((sum, category) => sum + category.count, 0),
      }
    : null

  const share = (value: number) => (total > 0 ? (value / total) * 100 : 0)

  return (
    <DashboardCard
      title="Para onde foi o dinheiro"
      description={
        period.isCurrentMonth
          ? `Saídas por categoria · variação vs. mesmo ponto de ${getMonthLabel(previousMonth)}`
          : `Saídas por categoria · variação vs. ${getMonthLabel(previousMonth)}`
      }
      href={transactionsHref({ type: 'saida' })}
      className={className}
      contentClassName="gap-0">
      {top.length === 0 ? (
        <DashboardCardEmpty>Nenhuma saída neste mês.</DashboardCardEmpty>
      ) : (
        <div className="-mx-2 flex flex-col gap-0.5">
          {top.map(category => (
            <CategoryRow
              key={category.category}
              category={category}
              share={share(category.total)}
              change={compare(category)}
              // "Sem categoria" não filtra pelo nome, então fica sem link
              href={
                category.category === UNCATEGORIZED
                  ? undefined
                  : transactionsHref({ type: 'saida', category: category.category })
              }
            />
          ))}
          {others ? <CategoryRow others category={others} share={share(others.total)} change={compare(others)} /> : null}
        </div>
      )}
    </DashboardCard>
  )
}
