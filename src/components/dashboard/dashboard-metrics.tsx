import { MetricCard } from '@/components/ui/metric-card'

import { formatCurrency } from '@/lib/currency'
import { dailyAllowance, dailyAverage, percentChange } from '@/lib/dashboard-insights'
import type { DashboardOverview } from '@/lib/dashboard-types'
import { getMonthLabel } from '@/lib/date-utils'

const formatPercent = (value: number) => `${Math.abs(Math.round(value))}%`

/** Pílula de variação: seta pelo sinal; o tom diz se a mudança é boa ou ruim. */
function delta(change: number | null, higherIsGood: boolean) {
  if (change === null || Math.round(change) === 0) return {}
  const up = change > 0
  return {
    delta: formatPercent(change),
    deltaTrend: up ? ('up' as const) : ('down' as const),
    deltaTone: up === higherIsGood ? ('success' as const) : ('error' as const),
  }
}

export function DashboardMetrics({ overview }: { overview: DashboardOverview }) {
  const { totals, period, monthlySeries, previousMonth } = overview
  const current = totals.current
  // No mês atual a comparação é com o mesmo ponto do mês anterior; fora dele, mês fechado contra mês fechado
  const comparison = period.isCurrentMonth ? totals.previousToDate : totals.previous
  const previousLabel = getMonthLabel(previousMonth)
  const comparisonNote = period.isCurrentMonth
    ? `vs. ${formatCurrency(comparison.saidas)} até o dia ${period.dayOfMonth} de ${previousLabel}`
    : `vs. ${formatCurrency(comparison.saidas)} em ${previousLabel}`

  const balanceTrend = monthlySeries.map(point => point.entradas - point.saidas - point.reservas)
  const allowance = dailyAllowance(overview)
  const average = dailyAverage(overview)

  return (
    <section aria-label="Resumo do mês" className="grid grid-cols-2 gap-3 max-sm:*:first:col-span-2 max-sm:*:last:col-span-2 sm:gap-4 xl:grid-cols-4">
      <MetricCard
        label="Saldo do mês"
        icon="wallet"
        value={formatCurrency(current.saldo)}
        tone={current.saldo < 0 ? 'error' : 'default'}
        trend={balanceTrend}
        trendTone={current.saldo < 0 ? 'error' : 'primary'}
        note={`Entradas menos saídas e reservas · ${current.count} ${current.count === 1 ? 'lançamento' : 'lançamentos'}`}
      />
      <MetricCard
        label="Entradas"
        icon="arrow-up-circle"
        value={formatCurrency(current.entradas)}
        tone="success"
        {...delta(percentChange(current.entradas, comparison.entradas), true)}
        note={
          period.isCurrentMonth
            ? `vs. ${formatCurrency(comparison.entradas)} até o dia ${period.dayOfMonth} de ${previousLabel}`
            : `vs. ${formatCurrency(comparison.entradas)} em ${previousLabel}`
        }
      />
      <MetricCard
        label="Saídas"
        icon="arrow-down-circle"
        value={formatCurrency(current.saidas)}
        tone="error"
        {...delta(percentChange(current.saidas, comparison.saidas), false)}
        note={comparisonNote}
      />
      {allowance ? (
        <MetricCard
          label="Pode gastar por dia"
          icon="calendar"
          value={formatCurrency(allowance.amount)}
          tone={allowance.amount === 0 ? 'error' : 'default'}
          note={`${allowance.daysLeft} ${allowance.daysLeft === 1 ? 'dia restante' : 'dias restantes'} · ${
            allowance.basis === 'budget' ? 'pelos orçamentos' : 'pelo saldo do mês'
          }`}
          noteTone={allowance.amount === 0 ? 'error' : undefined}
        />
      ) : (
        <MetricCard
          label="Média diária de saídas"
          icon="calendar"
          value={formatCurrency(average)}
          note={`${period.daysInMonth} dias em ${getMonthLabel(overview.month)}`}
        />
      )}
    </section>
  )
}
