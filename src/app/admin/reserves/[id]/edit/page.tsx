'use client'

import { useParams } from 'next/navigation'

import { ReserveForm } from '@/components/reserve-form'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'

import { useReserve } from '@/hooks/use-reserves'
import { useSelectedSpace } from '@/hooks/use-selected-space'

import { routes } from '@/lib/routes'

const reservesCrumb = { label: 'Reservas', href: routes.frontend.admin.reserves.index }

export default function EditReservePage() {
  const params = useParams()
  const reserveId = params.id as string
  const { selectedSpace } = useSelectedSpace()
  const { data: reserve, isLoading } = useReserve(reserveId)

  if (!selectedSpace) {
    return (
      <>
        <PageHeader variant="route" breadcrumb={[reservesCrumb]} title="Editar reserva" />
        <EmptyState
          bordered
          icon="layers"
          title="Nenhum espaço selecionado"
          description="Selecione um espaço na barra lateral para editar a reserva."
          className="max-w-3xl"
        />
      </>
    )
  }

  if (isLoading) {
    return (
      <>
        <PageHeader variant="route" breadcrumb={[reservesCrumb]} title="Editar reserva" />
        <Skeleton className="h-[560px] w-full max-w-3xl rounded-lg" />
      </>
    )
  }

  if (!reserve) {
    return (
      <>
        <PageHeader variant="route" breadcrumb={[reservesCrumb]} title="Editar reserva" />
        <EmptyState
          bordered
          icon="search"
          title="Reserva não encontrada"
          description="Ela pode ter sido excluída. Volte para Reservas e escolha outra."
          className="max-w-3xl"
        />
      </>
    )
  }

  return (
    <>
      <PageHeader
        variant="route"
        breadcrumb={[reservesCrumb, { label: reserve.name, href: routes.frontend.admin.reserves.movements(reserveId) }]}
        title="Editar reserva"
        description="Atualize nome, meta, ícone e cor"
      />
      <ReserveForm spaceId={selectedSpace.id} reserve={reserve} mode="edit" />
    </>
  )
}
