'use client'

import { ReserveForm } from '@/components/reserve-form'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'

import { useSelectedSpace } from '@/hooks/use-selected-space'

import { routes } from '@/lib/routes'

export default function NewReservePage() {
  const { selectedSpace } = useSelectedSpace()

  return (
    <>
      <PageHeader
        variant="route"
        breadcrumb={[{ label: 'Reservas', href: routes.frontend.admin.reserves.index }]}
        title="Nova reserva"
        description="Crie uma reserva para separar dinheiro para um objetivo"
      />

      {selectedSpace ? (
        <ReserveForm spaceId={selectedSpace.id} mode="create" />
      ) : (
        <EmptyState
          bordered
          icon="layers"
          title="Nenhum espaço selecionado"
          description="Selecione um espaço na barra lateral para criar uma reserva."
          className="max-w-3xl"
        />
      )}
    </>
  )
}
