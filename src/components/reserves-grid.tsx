'use client'

import { Reserve } from '@/app/db/schemas/reserve-schema'

import { ReserveCard } from '@/components/reserve-card'

interface ReservesGridProps {
  reserves: Reserve[]
  spaceId: string
}

export function ReservesGrid({ reserves, spaceId }: ReservesGridProps) {
  if (reserves.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Nenhuma reserva encontrada</p>
        <p className="text-muted-foreground mt-2 text-sm">
          Crie sua primeira reserva para começar a organizar suas finanças
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {reserves.map(reserve => (
        <ReserveCard key={reserve.id} reserve={reserve} spaceId={spaceId} />
      ))}
    </div>
  )
}
