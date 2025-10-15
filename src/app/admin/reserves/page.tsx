'use client'

import { Plus } from 'lucide-react'
import Link from 'next/link'

import { ReservesGrid } from '@/components/reserves-grid'
import { ReservesSummary } from '@/components/reserves-summary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { useReserves } from '@/hooks/use-reserves'
import { useSelectedSpace } from '@/hooks/use-selected-space'

import { routes } from '@/lib/routes'

export default function ReservesPage() {
  const { selectedSpace } = useSelectedSpace()
  const { data: reserves = [], isLoading } = useReserves(selectedSpace?.id || '')

  if (!selectedSpace) {
    return (
      <div className="container py-6">
        <Card>
          <CardHeader>
            <CardTitle>Nenhum Espaço Selecionado</CardTitle>
            <CardDescription>Selecione um espaço para visualizar as reservas</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
          <p className="text-muted-foreground">Organize seu dinheiro em caixinhas para diferentes objetivos</p>
        </div>
        <Link href={routes.frontend.admin.reserves.create}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Reserva
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p>Carregando reservas...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {reserves.length > 0 && <ReservesSummary reserves={reserves} />}

          <ReservesGrid reserves={reserves} spaceId={selectedSpace.id} />
        </>
      )}
    </div>
  )
}
