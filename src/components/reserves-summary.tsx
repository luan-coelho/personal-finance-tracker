'use client'

import { ArrowDownIcon, ArrowUpIcon, PiggyBank, Target } from 'lucide-react'

import { Reserve } from '@/app/db/schemas/reserve-schema'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ReservesSummaryProps {
  reserves: Reserve[]
}

export function ReservesSummary({ reserves }: ReservesSummaryProps) {
  const activeReserves = reserves.filter(r => r.active)

  const totalBalance = activeReserves.reduce((sum, reserve) => {
    return sum + parseFloat(reserve.currentAmount)
  }, 0)

  const totalTarget = activeReserves.reduce((sum, reserve) => {
    return sum + (reserve.targetAmount ? parseFloat(reserve.targetAmount) : 0)
  }, 0)

  const reservesWithTarget = activeReserves.filter(r => r.targetAmount)
  const totalProgress =
    reservesWithTarget.length > 0
      ? reservesWithTarget.reduce((sum, reserve) => {
          const target = parseFloat(reserve.targetAmount!)
          const current = parseFloat(reserve.currentAmount)
          return sum + (current / target) * 100
        }, 0) / reservesWithTarget.length
      : 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Reservado</CardTitle>
          <PiggyBank className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
          <p className="text-muted-foreground text-xs">
            Em {activeReserves.length} {activeReserves.length === 1 ? 'reserva' : 'reservas'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Meta Total</CardTitle>
          <Target className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalTarget)}</div>
          <p className="text-muted-foreground text-xs">
            {reservesWithTarget.length} {reservesWithTarget.length === 1 ? 'reserva' : 'reservas'} com meta
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
          <ArrowUpIcon className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProgress.toFixed(1)}%</div>
          <p className="text-muted-foreground text-xs">Das metas estabelecidas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Falta Atingir</CardTitle>
          <ArrowDownIcon className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(Math.max(0, totalTarget - totalBalance))}</div>
          <p className="text-muted-foreground text-xs">Para alcançar todas as metas</p>
        </CardContent>
      </Card>
    </div>
  )
}
