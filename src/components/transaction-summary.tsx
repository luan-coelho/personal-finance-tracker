'use client'

import { TrendingDown, TrendingUp, Wallet } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useTransactionSummary } from '@/hooks/use-transactions'

interface TransactionSummaryProps {
  dateFrom?: Date
  dateTo?: Date
}

export function TransactionSummary({ dateFrom, dateTo }: TransactionSummaryProps) {
  const { selectedSpace } = useSelectedSpace()
  const { data: summary, isLoading } = useTransactionSummary({
    spaceId: selectedSpace?.id || '',
    dateFrom,
    dateTo,
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-8 w-24" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!summary) {
    return null
  }

  const balance = summary.totalEntradas - summary.totalSaidas

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total de Entradas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Entradas</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalEntradas)}</div>
          <p className="text-muted-foreground text-xs">Entradas no período</p>
        </CardContent>
      </Card>

      {/* Total de Saídas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saídas</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalSaidas)}</div>
          <p className="text-muted-foreground text-xs">Saídas no período</p>
        </CardContent>
      </Card>

      {/* Saldo */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          <Wallet className={`h-4 w-4 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(balance)}
          </div>
          <p className="text-muted-foreground text-xs">{balance >= 0 ? 'Positivo' : 'Negativo'}</p>
        </CardContent>
      </Card>

      {/* Total de Transações */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <div className="bg-primary flex h-4 w-4 items-center justify-center rounded-full">
            <span className="text-primary-foreground text-xs font-bold">{summary.count}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.count}</div>
          <p className="text-muted-foreground text-xs">Transação{summary.count !== 1 ? 'ões' : ''} no período</p>
        </CardContent>
      </Card>
    </div>
  )
}
