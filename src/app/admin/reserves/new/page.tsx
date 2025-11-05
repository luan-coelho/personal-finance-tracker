'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { ReserveForm } from '@/components/reserve-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { useSelectedSpace } from '@/hooks/use-selected-space'

import { routes } from '@/lib/routes'

export default function NewReservePage() {
  const { selectedSpace } = useSelectedSpace()

  if (!selectedSpace) {
    return (
      <div className="container py-6">
        <Card>
          <CardHeader>
            <CardTitle>Nenhum Espaço Selecionado</CardTitle>
            <CardDescription>Selecione um espaço para criar uma reserva</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl space-y-6 py-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nova Reserva</h1>
          <p className="text-muted-foreground">Crie uma nova reserva para organizar seu dinheiro</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Reserva</CardTitle>
          <CardDescription>Preencha os dados para criar sua reserva</CardDescription>
        </CardHeader>
        <CardContent>
          <ReserveForm spaceId={selectedSpace.id} mode="create" />
        </CardContent>
      </Card>
    </div>
  )
}
