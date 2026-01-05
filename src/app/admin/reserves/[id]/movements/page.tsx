'use client'

import { ArrowLeft } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { ReserveTransactionsTable } from '@/components/reserve-transactions-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

import { useReserve } from '@/hooks/use-reserves'
import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useTransactionsByReserve } from '@/hooks/use-transactions'

import { routes } from '@/lib/routes'

export default function ReserveMovementsPage() {
  const params = useParams()
  const reserveId = params.id as string
  const { selectedSpace } = useSelectedSpace()
  const { data: reserve, isLoading: isLoadingReserve } = useReserve(reserveId)
  const { data: reserveTransactions = [], isLoading: isLoadingTransactions } = useTransactionsByReserve(
    reserveId,
    selectedSpace?.id,
  )

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

  if (isLoadingReserve || isLoadingTransactions) {
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
          <h1 className="text-3xl font-bold tracking-tight">Transações da Reserva</h1>
          <p className="text-muted-foreground">Histórico de depósitos e retiradas</p>
        </div>
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

      {/* Tabela de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
          <CardDescription>
            {reserveTransactions.length} {reserveTransactions.length === 1 ? 'transação' : 'transações'} registrada
            {reserveTransactions.length === 1 ? '' : 's'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReserveTransactionsTable transactions={reserveTransactions} />
        </CardContent>
      </Card>
    </div>
  )
}
