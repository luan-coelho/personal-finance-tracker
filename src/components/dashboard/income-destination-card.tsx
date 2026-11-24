import { DonutChart } from '@/components/ui/donut-chart'

import { formatCurrency } from '@/lib/currency'
import type { DashboardOverview } from '@/lib/dashboard-types'

import { DashboardCard, formatAmountCompact, formatCurrencyCompact } from './dashboard-shared'

/** Destino das entradas: quanto virou gasto, quanto foi guardado e quanto sobrou. */
export function IncomeDestinationCard({ overview, className }: { overview: DashboardOverview; className?: string }) {
  const { entradas, saidas, reservas } = overview.totals.current
  const leftover = entradas - saidas - reservas

  return (
    <DashboardCard title="Destino das entradas" description={`De ${formatCurrency(entradas)} recebidos`} className={className}>
      <DonutChart
        aria-label={`Das entradas, ${formatCurrency(saidas)} viraram gasto, ${formatCurrency(reservas)} foram guardados e ${formatCurrency(Math.max(leftover, 0))} sobraram`}
        segments={[
          { label: 'Gasto', value: saidas, tone: 'error' },
          { label: 'Reserva', value: reservas, tone: 'info' },
          { label: 'Sobra', value: Math.max(leftover, 0), tone: 'success' },
        ]}
        total={entradas}
        // Miolo de 88px e legenda estreita no celular: valores compactos; os exatos ficam no aria-label
        totalLabel={formatAmountCompact(entradas)}
        unit="reais"
        format={formatCurrencyCompact}
      />
      {leftover < 0 ? (
        <p className="text-error-text text-xs leading-4 font-medium">
          Saídas e reservas passaram das entradas em {formatCurrency(-leftover)}.
        </p>
      ) : null}
    </DashboardCard>
  )
}
