'use client'

import type { Reserve } from '@/app/db/schemas/reserve-schema'

import { MetricCard } from '@/components/ui/metric-card'

import { formatCurrency } from '@/lib/currency'

interface ReservesSummaryProps {
  reserves: Reserve[]
}

function pluralizeReserves(count: number) {
  return `${count} ${count === 1 ? 'reserva' : 'reservas'}`
}

export function ReservesSummary({ reserves }: ReservesSummaryProps) {
  const activeReserves = reserves.filter(r => r.active)

  const totalBalance = activeReserves.reduce((sum, reserve) => {
    return sum + parseFloat(reserve.currentAmount)
  }, 0)

  const totalTarget = activeReserves.reduce((sum, reserve) => {
    return sum + (reserve.targetAmount ? parseFloat(reserve.targetAmount) : 0)
  }, 0)

  const reservesWithTarget = activeReserves.filter(r => r.targetAmount)
  const totalProgress =
    reservesWithTarget.length > 0
      ? reservesWithTarget.reduce((sum, reserve) => {
          const target = parseFloat(reserve.targetAmount!)
          const current = parseFloat(reserve.currentAmount)
          return sum + (current / target) * 100
        }, 0) / reservesWithTarget.length
      : 0

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      <MetricCard
        icon="piggy-bank"
        label="Total reservado"
        value={formatCurrency(totalBalance)}
        note={`Em ${pluralizeReserves(activeReserves.length)}`}
      />
      <MetricCard
        icon="target"
        label="Meta total"
        value={formatCurrency(totalTarget)}
        note={`${pluralizeReserves(reservesWithTarget.length)} com meta`}
      />
      <MetricCard
        icon="trending-up"
        label="Progresso médio"
        value={totalProgress.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
        unit="%"
        progress={totalProgress}
        note="Média das metas definidas"
      />
      <MetricCard
        icon="arrow-up-circle"
        label="Falta atingir"
        value={formatCurrency(Math.max(0, totalTarget - totalBalance))}
        note="Para alcançar todas as metas"
      />
    </div>
  )
}
