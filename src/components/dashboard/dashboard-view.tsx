'use client'

import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'

import type { DashboardOverview } from '@/lib/dashboard-types'
import { getMonthLabel } from '@/lib/date-utils'

import { AttentionCard } from './attention-card'
import { BudgetsOverviewCard } from './budgets-overview-card'
import { CategoryBreakdownCard } from './category-breakdown-card'
import { DashboardMetrics } from './dashboard-metrics'
import { IncomeDestinationCard } from './income-destination-card'
import { MembersSplitCard } from './members-split-card'
import { MonthlyHistoryCard } from './monthly-history-card'
import { RecentTransactionsCard } from './recent-transactions-card'
import { ReservesOverviewCard } from './reserves-overview-card'
import { SpendingPaceCard } from './spending-pace-card'

interface DashboardViewProps {
  overview: DashboardOverview
  /** Troca o mês do painel ao clicar numa barra do histórico. */
  onSelectMonth?: (month: string) => void
  /** Abre o formulário de nova transação (estado vazio). */
  onCreateTransaction?: () => void
}

/**
 * Painel Início, só apresentação. Grade de 12 colunas no desktop; no celular os blocos
 * empilham na ordem de leitura (Atenção sobe para logo depois das métricas).
 */
export function DashboardView({ overview, onSelectMonth, onCreateTransaction }: DashboardViewProps) {
  const hasActivity = overview.totals.current.count > 0
  const showMembers = overview.members.length >= 2
  const showIncome = overview.totals.current.entradas > 0

  if (!hasActivity) {
    return (
      <div className="flex flex-col gap-6">
        <EmptyState
          bordered
          icon={overview.period.isFutureMonth ? 'calendar' : 'receipt'}
          title={
            overview.period.isFutureMonth
              ? `${capitalize(getMonthLabel(overview.month))} ainda não começou`
              : `Nenhuma transação em ${getMonthLabel(overview.month)}`
          }
          description={
            overview.period.isFutureMonth
              ? 'Lançamentos com data neste mês aparecem aqui.'
              : 'Registre a primeira entrada ou saída para ver o ritmo do mês, as categorias e os alertas.'
          }
          action={
            onCreateTransaction ? (
              <Button variant="primary" icon="plus" onClick={onCreateTransaction}>
                Nova transação
              </Button>
            ) : undefined
          }
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <MonthlyHistoryCard overview={overview} onSelectMonth={onSelectMonth} className="lg:col-span-8" />
          <ReservesOverviewCard overview={overview} className="lg:col-span-4" />
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-12">
        <DashboardMetrics overview={overview} />
      </div>

      {/* No celular, Atenção vem antes do ritmo */}
      <SpendingPaceCard overview={overview} className="order-2 lg:order-none lg:col-span-8" />
      <AttentionCard overview={overview} className="order-1 lg:order-none lg:col-span-4" />

      <CategoryBreakdownCard overview={overview} className="order-3 lg:order-none lg:col-span-6" />
      <BudgetsOverviewCard overview={overview} className="order-3 lg:order-none lg:col-span-6" />

      <RecentTransactionsCard
        overview={overview}
        className={`order-3 lg:order-none ${showMembers ? 'lg:col-span-6' : 'lg:col-span-8'}`}
      />
      <ReservesOverviewCard
        overview={overview}
        className={`order-3 lg:order-none ${showMembers ? 'lg:col-span-3' : 'lg:col-span-4'}`}
      />
      {showMembers ? <MembersSplitCard overview={overview} className="order-3 lg:order-none lg:col-span-3" /> : null}

      <MonthlyHistoryCard
        overview={overview}
        onSelectMonth={onSelectMonth}
        className={`order-3 lg:order-none ${showIncome ? 'lg:col-span-8' : 'lg:col-span-12'}`}
      />
      {showIncome ? <IncomeDestinationCard overview={overview} className="order-3 lg:order-none lg:col-span-4" /> : null}
    </div>
  )
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
