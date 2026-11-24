'use client'

import { MetricCard } from '@/components/ui/metric-card'

import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useTransactionSummary } from '@/hooks/use-transactions'

import { formatCurrency } from '@/lib/currency'

interface TransactionSummaryProps {
  dateFrom?: Date
  dateTo?: Date
}

// Abaixo de `sm`: saldo em destaque na largura toda, entradas e saídas lado a lado; a contagem vai na nota do saldo.
const gridClassName = 'grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'

export function TransactionSummary({ dateFrom, dateTo }: TransactionSummaryProps) {
  const { selectedSpace } = useSelectedSpace()
  const { data: summary, isLoading } = useTransactionSummary({
    spaceId: selectedSpace?.id || '',
    dateFrom,
    dateTo,
  })

  if (isLoading) {
    return (
      <div className={gridClassName}>
        {Array.from({ length: 4 }, (_, index) => (
          <MetricCard
            key={index}
            label=""
            value=""
            loading
            className={index === 0 ? 'max-sm:col-span-2' : index === 3 ? 'max-sm:hidden' : undefined}
          />
        ))}
      </div>
    )
  }

  if (!summary) {
    return null
  }

  // O saldo já vem calculado do backend como: entradas - saídas - reservas
  const balance = summary.saldo

  return (
    <div className={gridClassName}>
      <MetricCard
        label="Entradas"
        icon="arrow-up-circle"
        tone="success"
        value={formatCurrency(summary.totalEntradas)}
        note="Entradas no período"
      />
      <MetricCard
        label="Saídas"
        icon="arrow-down-circle"
        tone="error"
        value={formatCurrency(summary.totalSaidas)}
        note="Saídas no período"
      />
      <MetricCard
        label="Saldo"
        icon="wallet"
        tone={balance >= 0 ? 'success' : 'error'}
        value={formatCurrency(balance)}
        note={
          <>
            {balance >= 0 ? 'Positivo' : 'Negativo'}
            <span className="sm:hidden">
              {' · '}
              {summary.count} {summary.count === 1 ? 'transação' : 'transações'}
            </span>
          </>
        }
        className="max-sm:order-first max-sm:col-span-2"
      />
      <MetricCard
        label="Transações"
        icon="hash"
        value={summary.count}
        note={summary.count === 1 ? 'Transação no período' : 'Transações no período'}
        className="max-sm:hidden"
      />
    </div>
  )
}
