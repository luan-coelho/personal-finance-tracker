'use client'

import Link from 'next/link'

import { QueryErrorCard } from '@/components/query-error-card'
import { ReservesGrid } from '@/components/reserves-grid'
import { ReservesSummary } from '@/components/reserves-summary'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { MetricCard } from '@/components/ui/metric-card'
import { PageActions } from '@/components/ui/page-actions'
import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'

import { useReserves } from '@/hooks/use-reserves'
import { useSelectedSpace } from '@/hooks/use-selected-space'

import { routes } from '@/lib/routes'

const DESCRIPTION = 'Separe o dinheiro em caixinhas para cada objetivo'

export default function ReservesPage() {
  const { selectedSpace } = useSelectedSpace()
  const { data: reserves = [], isLoading, isError, refetch } = useReserves(selectedSpace?.id || '')

  if (!selectedSpace) {
    return (
      <>
        <PageHeader title="Reservas" description={DESCRIPTION} />
        <EmptyState
          bordered
          icon="layers"
          title="Nenhum espaço selecionado"
          description="Selecione um espaço na barra lateral para ver as reservas."
        />
      </>
    )
  }

  return (
    <>
      <PageHeader title="Reservas" description={DESCRIPTION} />
      <PageActions
        actions={
          <Button variant="primary" icon="plus" asChild>
            <Link href={routes.frontend.admin.reserves.create}>Nova reserva</Link>
          </Button>
        }
      />

      {isLoading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {['balance', 'target', 'progress', 'remaining'].map(key => (
              <MetricCard key={key} label="" value="" loading />
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {['first', 'second', 'third'].map(key => (
              <Skeleton key={key} className="h-[188px] rounded-lg" />
            ))}
          </div>
        </>
      ) : isError ? (
        <QueryErrorCard onRetry={() => refetch()} />
      ) : (
        <>
          {reserves.length > 0 && <ReservesSummary reserves={reserves} />}
          <ReservesGrid reserves={reserves} spaceId={selectedSpace.id} />
        </>
      )}
    </>
  )
}
