'use client'

import type { Reserve } from '@/app/db/schemas/reserve-schema'

import { ReserveCard } from '@/components/reserve-card'
import { EmptyState } from '@/components/ui/empty-state'

interface ReservesGridProps {
  reserves: Reserve[]
  spaceId: string
}

export function ReservesGrid({ reserves, spaceId }: ReservesGridProps) {
  if (reserves.length === 0) {
    return (
      <EmptyState
        bordered
        icon="piggy-bank"
        title="Nenhuma reserva criada"
        description="Use Nova reserva para separar dinheiro por objetivo."
      />
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {reserves.map(reserve => (
        <ReserveCard key={reserve.id} reserve={reserve} spaceId={spaceId} />
      ))}
    </div>
  )
}
