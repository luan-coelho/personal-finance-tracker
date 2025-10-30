'use client'

import { TrendingDown, TrendingUp } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

import { cn } from '@/lib/utils'

interface BudgetComparison {
  category: string
  currentAmount: number
  currentSpent: number
  currentPercentage: number
  previousAmount?: number
  previousSpent?: number
  previousPercentage?: number
}

interface BudgetComparisonCardProps {
  comparisons: BudgetComparison[]
  currentMonth: string
  previousMonth: string
  isLoading?: boolean
}

export function BudgetComparisonCard({
  comparisons,
  currentMonth,
  previousMonth,
  isLoading,
}: BudgetComparisonCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparação com Mês Anterior</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-muted h-20 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (comparisons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparação com Mês Anterior</CardTitle>
          <CardDescription>
            Compare seus gastos de {formatMonth(currentMonth)} com {formatMonth(previousMonth)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center text-sm">Não há dados suficientes para comparação</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparação com Mês Anterior</CardTitle>
        <CardDescription>
          Compare seus gastos de {formatMonth(currentMonth)} com {formatMonth(previousMonth)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {comparisons.map(comparison => {
            const hasComparison = comparison.previousSpent !== undefined
            const spentDiff = hasComparison ? comparison.currentSpent - (comparison.previousSpent || 0) : 0
            const percentageDiff = hasComparison
              ? comparison.currentPercentage - (comparison.previousPercentage || 0)
              : 0
            const isWorse = spentDiff > 0

            return (
              <div key={comparison.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{comparison.category}</h4>
                  {hasComparison && (
                    <div
                      className={cn(
                        'flex items-center gap-1 text-sm font-medium',
                        isWorse ? 'text-red-600' : 'text-green-600',
                      )}>
                      {isWorse ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {Math.abs(percentageDiff).toFixed(1)}%
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Mês Atual</p>
                    <p className="font-semibold">{formatCurrency(comparison.currentSpent)}</p>
                    <Progress
                      value={Math.min(100, comparison.currentPercentage)}
                      className={cn('mt-1 h-1.5', comparison.currentPercentage > 100 && '[&>div]:bg-destructive')}
                    />
                  </div>

                  <div>
                    <p className="text-muted-foreground mb-1">Mês Anterior</p>
                    <p className="font-semibold">
                      {hasComparison ? formatCurrency(comparison.previousSpent || 0) : '-'}
                    </p>
                    {hasComparison && (
                      <Progress
                        value={Math.min(100, comparison.previousPercentage || 0)}
                        className={cn(
                          'mt-1 h-1.5',
                          (comparison.previousPercentage || 0) > 100 && '[&>div]:bg-destructive',
                        )}
                      />
                    )}
                  </div>
                </div>

                {hasComparison && (
                  <p className="text-muted-foreground text-xs">
                    {isWorse ? 'Aumento' : 'Redução'} de {formatCurrency(Math.abs(spentDiff))} em relação ao mês
                    anterior
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
