'use client'

import { ArrowLeft, Plus } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'

import { ReserveMovementForm } from '@/components/reserve-movement-form'
import { ReserveMovementsTable } from '@/components/reserve-movements-table'
import { ReserveTransactionsCard } from '@/components/reserve-transactions-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'

import { useReserveMovements } from '@/hooks/use-reserve-movements'
import { useReserve } from '@/hooks/use-reserves'
import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useTransactionsByReserve } from '@/hooks/use-transactions'

import { routes } from '@/lib/routes'

export default function ReserveMovementsPage() {
  const params = useParams()
  const reserveId = params.id as string
  const { selectedSpace } = useSelectedSpace()
  const { data: reserve, isLoading: isLoadingReserve } = useReserve(reserveId)
  const { data: movements = [], isLoading: isLoadingMovements } = useReserveMovements(reserveId)
  const { data: reserveTransactions = [], isLoading: isLoadingTransactions } = useTransactionsByReserve(reserveId)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (!selectedSpace) {
    return (
      <div className="container py-6">
        <Card>
          <CardHeader>
            <CardTitle>Nenhum Espaço Selecionado</CardTitle>
            <CardDescription>Selecione um espaço para visualizar movimentações</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (isLoadingReserve || isLoadingMovements) {
    return (
      <div className="container space-y-6 py-6">
        <Card>
          <CardContent className="py-10 text-center">
            <p>Carregando...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!reserve) {
    return (
      <div className="container space-y-6 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Reserva não encontrada</CardTitle>
            <CardDescription>A reserva que você está procurando não existe</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const currentAmount = parseFloat(reserve.currentAmount)
  const targetAmount = reserve.targetAmount ? parseFloat(reserve.targetAmount) : null
  const progress = targetAmount ? (currentAmount / targetAmount) * 100 : 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Obter componente do ícone
  const IconComponent = reserve.icon
    ? ((LucideIcons as any)[
        reserve.icon
          .split('-')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join('')
      ] as React.ElementType | undefined)
    : LucideIcons.PiggyBank

  return (
    <div className="container space-y-6 py-6">
      <div className="flex items-center gap-4">
        <Link href={routes.frontend.admin.reserves.index}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Movimentações</h1>
          <p className="text-muted-foreground">Gerencie depósitos e retiradas da reserva</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Movimentação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Movimentação</DialogTitle>
            </DialogHeader>
            <ReserveMovementForm
              reserveId={reserveId}
              spaceId={selectedSpace.id}
              onSuccess={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Card da Reserva */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg"
                style={{ backgroundColor: reserve.color || '#3b82f6' }}>
                {IconComponent && <IconComponent className="h-6 w-6 text-white" />}
              </div>
              <div>
                <CardTitle>{reserve.name}</CardTitle>
                <CardDescription>{reserve.description || 'Sem descrição'}</CardDescription>
              </div>
            </div>
            <Link href={routes.frontend.admin.reserves.edit(reserveId)}>
              <Button variant="outline" size="sm">
                Editar Reserva
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Saldo Atual</p>
              <p className="text-2xl font-bold">{formatCurrency(currentAmount)}</p>
            </div>
            {targetAmount && (
              <div className="text-right">
                <p className="text-muted-foreground text-sm">Meta</p>
                <p className="text-2xl font-bold">{formatCurrency(targetAmount)}</p>
              </div>
            )}
          </div>
          {targetAmount && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progresso</span>
                <span className="font-medium">{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Transações de Reserva */}
      <ReserveTransactionsCard transactions={reserveTransactions} isLoading={isLoadingTransactions} />

      {/* Tabela de Movimentações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Movimentações</CardTitle>
          <CardDescription>
            {movements.length} {movements.length === 1 ? 'movimentação' : 'movimentações'} registrada
            {movements.length === 1 ? '' : 's'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReserveMovementsTable movements={movements} reserveId={reserveId} spaceId={selectedSpace.id} />
        </CardContent>
      </Card>
    </div>
  )
}
