'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { ReserveForm } from '@/components/reserve-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { useReserve } from '@/hooks/use-reserves'
import { useSelectedSpace } from '@/hooks/use-selected-space'

import { routes } from '@/lib/routes'

export default function EditReservePage() {
  const params = useParams()
  const reserveId = params.id as string
  const { selectedSpace } = useSelectedSpace()
  const { data: reserve, isLoading } = useReserve(reserveId)

  if (!selectedSpace) {
    return (
      <div className="container py-6">
        <Card>
          <CardHeader>
            <CardTitle>Nenhum Espaço Selecionado</CardTitle>
            <CardDescription>Selecione um espaço para editar uma reserva</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container max-w-2xl space-y-6 py-6">
        <Card>
          <CardContent className="py-10 text-center">
            <p>Carregando reserva...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!reserve) {
    return (
      <div className="container max-w-2xl space-y-6 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Reserva não encontrada</CardTitle>
            <CardDescription>A reserva que você está procurando não existe</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl space-y-6 py-6">
      <div className="flex items-center gap-4">
        <Link href={routes.frontend.admin.reserves.index}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Reserva</h1>
          <p className="text-muted-foreground">Atualize as informações da reserva</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Reserva</CardTitle>
          <CardDescription>Edite os dados da reserva {reserve.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <ReserveForm spaceId={selectedSpace.id} reserve={reserve} mode="edit" />
        </CardContent>
      </Card>
    </div>
  )
}
