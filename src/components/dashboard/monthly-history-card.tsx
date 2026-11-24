'use client'

import { BarChart } from '@/components/ui/bar-chart'

import { formatCurrency } from '@/lib/currency'
import type { DashboardOverview } from '@/lib/dashboard-types'
import { getMonthLabel } from '@/lib/date-utils'

import { DashboardCard, formatAmountCompact } from './dashboard-shared'

interface MonthlyHistoryCardProps {
  overview: DashboardOverview
  /** Clicar numa barra troca o mês do painel ('YYYY-MM'). */
  onSelectMonth?: (month: string) => void
  className?: string
}

/** Saídas dos últimos 6 meses; o mês selecionado fica cheio e os outros esmaecidos. */
export function MonthlyHistoryCard({ overview, onSelectMonth, className }: MonthlyHistoryCardProps) {
  const { monthlySeries, month } = overview
  const activeIndex = monthlySeries.findIndex(point => point.month === month)
  const values = monthlySeries.map(point => point.saidas)
  const withData = values.filter(value => value > 0)
  const average = withData.length ? withData.reduce((sum, value) => sum + value, 0) / withData.length : 0

  return (
    <DashboardCard
      title="Últimos 6 meses"
      description={average > 0 ? `Saídas em reais · média de ${formatCurrency(average)} por mês` : 'Saídas por mês'}
      className={className}>
      <BarChart
        aria-label={`Saídas por mês: ${monthlySeries
          .map(point => `${getMonthLabel(point.month)} ${formatCurrency(point.saidas)}`)
          .join(', ')}`}
        data={monthlySeries.map(point => ({ label: getMonthLabel(point.month, 'short'), value: point.saidas }))}
        format={formatAmountCompact}
        height={160}
        activeIndex={activeIndex >= 0 ? activeIndex : null}
        onBarClick={onSelectMonth ? index => onSelectMonth(monthlySeries[index].month) : undefined}
      />
    </DashboardCard>
  )
}
