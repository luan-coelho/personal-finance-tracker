'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { QueryErrorCard } from '@/components/query-error-card'
import { formatReserveProgress, ReserveIconTile } from '@/components/reserve-card'
import { ReserveTransactionsTable } from '@/components/reserve-transactions-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { PageActions } from '@/components/ui/page-actions'
import { PageHeader } from '@/components/ui/page-header'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

import { useReserve } from '@/hooks/use-reserves'
import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useTransactionsByReserve } from '@/hooks/use-transactions'

import { formatCurrency } from '@/lib/currency'
import { routes } from '@/lib/routes'

const reservesCrumb = { label: 'Reservas', href: routes.frontend.admin.reserves.index }

export default function ReserveMovementsPage() {
  const params = useParams()
  const reserveId = params.id as string
  const { selectedSpace } = useSelectedSpace()
  const { data: reserve, isLoading: isLoadingReserve } = useReserve(reserveId)
  const {
    data: reserveTransactions = [],
    isLoading: isLoadingTransactions,
    isError: isTransactionsError,
    refetch: refetchTransactions,
  } = useTransactionsByReserve(reserveId, selectedSpace?.id)

  if (!selectedSpace) {
    return (
      <>
        <PageHeader variant="route" breadcrumb={[reservesCrumb]} title="Movimentações" />
        <EmptyState
          bordered
          icon="layers"
          title="Nenhum espaço selecionado"
          description="Selecione um espaço na barra lateral para ver as movimentações."
        />
      </>
    )
  }

  if (isLoadingReserve || isLoadingTransactions) {
    return (
      <>
        <PageHeader variant="route" breadcrumb={[reservesCrumb]} title="Movimentações" />
        <Skeleton className="h-control-md rounded-control w-full max-w-sm" />
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </>
    )
  }

  if (!reserve) {
    return (
      <>
        <PageHeader variant="route" breadcrumb={[reservesCrumb]} title="Movimentações" />
        <EmptyState
          bordered
          icon="search"
          title="Reserva não encontrada"
          description="Ela pode ter sido excluída. Volte para Reservas e escolha outra."
        />
      </>
    )
  }

  const currentAmount = parseFloat(reserve.currentAmount)
  const targetAmount = reserve.targetAmount ? parseFloat(reserve.targetAmount) : null
  const progress = targetAmount ? (currentAmount / targetAmount) * 100 : 0
  const count = reserveTransactions.length

  return (
    <>
      <PageHeader
        variant="route"
        breadcrumb={[reservesCrumb]}
        title={
          <span className="flex min-w-0 items-center gap-3">
            <ReserveIconTile icon={reserve.icon} color={reserve.color} size={32} />
            <span className="min-w-0">{reserve.name}</span>
          </span>
        }
        status={!reserve.active ? <Badge dot>Inativa</Badge> : undefined}
        description={reserve.description || undefined}
        meta={
          <div className="flex flex-col gap-2">
            <span className="tabular-nums">
              Saldo {formatCurrency(currentAmount)}
              {targetAmount
                ? ` · Meta ${formatCurrency(targetAmount)} · ${formatReserveProgress(progress)} da meta`
                : ' · Sem meta definida'}
            </span>
            {targetAmount ? (
              <Progress
                value={Math.min(progress, 100)}
                tone={progress >= 100 ? 'success' : 'primary'}
                aria-label="Progresso da meta"
                className="w-full max-w-xs"
              />
            ) : null}
          </div>
        }
      />

      <PageActions
        actions={
          <>
            <Button icon="pencil" asChild>
              <Link href={routes.frontend.admin.reserves.edit(reserveId)}>Editar reserva</Link>
            </Button>
            <Button variant="primary" icon="plus" asChild>
              <Link href={routes.frontend.admin.transactions.index}>Registrar em transações</Link>
            </Button>
          </>
        }>
        <p className="text-muted-foreground text-sm tabular-nums">
          {count} {count === 1 ? 'movimentação registrada' : 'movimentações registradas'}
        </p>
      </PageActions>

      {isTransactionsError ? (
        <QueryErrorCard onRetry={() => refetchTransactions()} />
      ) : (
        <ReserveTransactionsTable transactions={reserveTransactions} />
      )}
    </>
  )
}
