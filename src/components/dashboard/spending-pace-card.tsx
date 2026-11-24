import { LineChart } from '@/components/ui/line-chart'

import { formatCurrency } from '@/lib/currency'
import { buildPaceSummary, cumulative, cumulativeUntil } from '@/lib/dashboard-insights'
import type { DashboardOverview } from '@/lib/dashboard-types'
import { getMonthLabel } from '@/lib/date-utils'

import { DashboardCard, transactionsHref } from './dashboard-shared'

/**
 * Ritmo de gastos: saídas acumuladas dia a dia do mês selecionado (contínua, para em hoje)
 * contra o mês anterior (tracejada), com a frase-resumo e a projeção de fechamento.
 */
export function SpendingPaceCard({ overview, className }: { overview: DashboardOverview; className?: string }) {
  const { period, dailySpending, month, previousMonth } = overview
  // "24/11": curto o bastante para 6 rótulos no eixo em 320px
  const monthNumber = month.slice(5)
  const labels = Array.from({ length: period.daysInMonth }, (_, index) => `${index + 1}/${monthNumber}`)

  const current = cumulativeUntil(dailySpending.current, period.dayOfMonth)
  // Mês anterior alinhado pelo dia: corta o excedente e completa com vazio se for mais curto
  const previousCumulative = cumulative(dailySpending.previous)
  const previous = labels.map((_, index) => previousCumulative[index] ?? null)

  const { headline, projection } = buildPaceSummary(overview)
  const markerIndex = period.dayOfMonth ? period.dayOfMonth - 1 : period.daysInMonth - 1

  return (
    <DashboardCard
      title="Ritmo de gastos"
      description="Saídas acumuladas no mês"
      href={transactionsHref({ type: 'saida' })}
      hrefLabel="Ver saídas"
      className={className}>
      <div className="flex flex-col gap-1">
        <p className="text-sm leading-5 font-medium">{headline}</p>
        {projection ? <p className="text-muted-foreground text-[13px] leading-5">{projection}</p> : null}
      </div>
      <LineChart
        aria-label={`Saídas acumuladas por dia em ${getMonthLabel(month)} comparadas com ${getMonthLabel(previousMonth)}. ${headline}`}
        series={[
          { name: getMonthLabel(month), values: current },
          { name: getMonthLabel(previousMonth), values: previous, tone: 'previous', dashed: true },
        ]}
        labels={labels}
        labelEvery={5}
        format={formatCurrency}
        height={180}
        marker={{ index: markerIndex, series: 0 }}
      />
    </DashboardCard>
  )
}
