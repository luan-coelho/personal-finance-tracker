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
      <div className="group relative overflow-hidden rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm transition-all dark:border-green-900/30 dark:from-green-950/20 dark:to-emerald-950/20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">Entradas</p>
            <h3 className="mt-2 text-3xl font-bold text-green-600 dark:text-green-500">
              {formatCurrency(summary.totalEntradas)}
            </h3>
            <p className="mt-1 text-xs text-green-600/70 dark:text-green-400/70">Entradas no período</p>
          </div>
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
            <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-500" />
          </div>
        </div>
        <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-green-200/30 blur-2xl dark:bg-green-800/20" />
      </div>

      {/* Total de Saídas */}
      <div className="group relative overflow-hidden rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-6 shadow-sm transition-all dark:border-red-900/30 dark:from-red-950/20 dark:to-rose-950/20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">Saídas</p>
            <h3 className="mt-2 text-3xl font-bold text-red-600 dark:text-red-500">
              {formatCurrency(summary.totalSaidas)}
            </h3>
            <p className="mt-1 text-xs text-red-600/70 dark:text-red-400/70">Saídas no período</p>
          </div>
          <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
            <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-500" />
          </div>
        </div>
        <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-red-200/30 blur-2xl dark:bg-red-800/20" />
      </div>

      {/* Saldo */}
      <div
        className={`group relative overflow-hidden rounded-xl border p-6 shadow-sm transition-all ${
          balance >= 0
            ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-900/30 dark:from-green-950/20 dark:to-emerald-950/20'
            : 'border-red-200 bg-gradient-to-br from-red-50 to-rose-50 dark:border-red-900/30 dark:from-red-950/20 dark:to-rose-950/20'
        }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                balance >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
              }`}>
              Saldo
            </p>
            <h3
              className={`mt-2 text-3xl font-bold ${
                balance >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
              }`}>
              {formatCurrency(balance)}
            </h3>
            <p
              className={`mt-1 text-xs ${
                balance >= 0 ? 'text-green-600/70 dark:text-green-400/70' : 'text-red-600/70 dark:text-red-400/70'
              }`}>
              {balance >= 0 ? 'Positivo' : 'Negativo'}
            </p>
          </div>
          <div
            className={`rounded-full p-3 ${
              balance >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
            }`}>
            <Wallet
              className={`h-6 w-6 ${balance >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}
            />
          </div>
        </div>
        <div
          className={`absolute -top-6 -right-6 h-24 w-24 rounded-full blur-2xl ${
            balance >= 0 ? 'bg-green-200/30 dark:bg-green-800/20' : 'bg-red-200/30 dark:bg-red-800/20'
          }`}
        />
      </div>

      {/* Total de Transações */}
      <div className="group relative overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm transition-all dark:border-blue-900/30 dark:from-blue-950/20 dark:to-indigo-950/20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Total de Transações</p>
            <h3 className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-500">{summary.count}</h3>
            <p className="mt-1 text-xs text-blue-600/70 dark:text-blue-400/70">
              Transação{summary.count !== 1 ? 'ões' : ''} no período
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-500">{summary.count}</span>
          </div>
        </div>
        <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-blue-200/30 blur-2xl dark:bg-blue-800/20" />
      </div>
    </div>
  )
}
