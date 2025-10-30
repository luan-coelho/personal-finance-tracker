'use client'

import { AlertTriangle, TrendingDown, TrendingUp, Wallet } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

import { BudgetSummary as BudgetSummaryType } from '@/hooks/use-budgets'

import { cn } from '@/lib/utils'

interface BudgetSummaryProps {
  summary: BudgetSummaryType | undefined
  isLoading?: boolean
  month: string
}

export function BudgetSummary({ summary, isLoading, month }: BudgetSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="bg-muted h-4 w-20 animate-pulse rounded" />
              <div className="bg-muted h-4 w-4 animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="bg-muted mb-2 h-8 w-24 animate-pulse rounded" />
              <div className="bg-muted h-3 w-16 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-muted-foreground text-center">
            <Wallet className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p className="text-sm">Nenhum orçamento definido para {formatMonth(month)}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const overallPercentage = summary.totalBudget > 0 ? (summary.totalSpent / summary.totalBudget) * 100 : 0

  const isOverBudget = overallPercentage > 100
  const isNearLimit = overallPercentage >= 80 && overallPercentage <= 100

  return (
    <div className="space-y-6">
      {/* Título e Status Geral */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Resumo do Orçamento</h2>
          <p className="text-muted-foreground">{formatMonth(month)}</p>
        </div>
        <div className="flex items-center gap-2">
          {summary.categoriesOverBudget > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {summary.categoriesOverBudget} categoria(s) excedida(s)
            </Badge>
          )}
          {summary.categoriesNearLimit > 0 && (
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              {summary.categoriesNearLimit} próxima(s) do limite
            </Badge>
          )}
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Orçado */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orçado</CardTitle>
            <Wallet className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalBudget)}</div>
            <p className="text-muted-foreground text-xs">{summary.categoriesCount} categoria(s)</p>
          </CardContent>
        </Card>

        {/* Total Gasto */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
            <TrendingDown className={cn('h-4 w-4', isOverBudget ? 'text-destructive' : 'text-muted-foreground')} />
          </CardHeader>
          <CardContent>
            <div className={cn('text-2xl font-bold', isOverBudget && 'text-destructive')}>
              {formatCurrency(summary.totalSpent)}
            </div>
            <p className="text-muted-foreground text-xs">{overallPercentage.toFixed(1)}% do orçamento</p>
          </CardContent>
        </Card>

        {/* Restante */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restante</CardTitle>
            <TrendingUp
              className={cn('h-4 w-4', summary.totalRemaining <= 0 ? 'text-destructive' : 'text-green-600')}
            />
          </CardHeader>
          <CardContent>
            <div
              className={cn('text-2xl font-bold', summary.totalRemaining <= 0 ? 'text-destructive' : 'text-green-600')}>
              {summary.totalRemaining <= 0 ? '−' : ''}
              {formatCurrency(Math.abs(summary.totalRemaining))}
            </div>
            <p className="text-muted-foreground text-xs">
              {summary.totalRemaining <= 0 ? 'Orçamento excedido' : 'Disponível para gastos'}
            </p>
          </CardContent>
        </Card>

        {/* Progresso Médio */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
            <div
              className={cn(
                'h-4 w-4 rounded-full',
                isOverBudget ? 'bg-destructive' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500',
              )}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.averagePercentage.toFixed(1)}%</div>
            <p className="text-muted-foreground text-xs">Média entre categorias</p>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Progresso Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progresso Geral do Orçamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>Gasto: {formatCurrency(summary.totalSpent)}</span>
            <span>Orçamento: {formatCurrency(summary.totalBudget)}</span>
          </div>
          <Progress
            value={Math.min(100, overallPercentage)}
            className={cn('h-3', isOverBudget && 'progress-destructive')}
          />
          <div className="text-center">
            <Badge variant={isOverBudget ? 'destructive' : isNearLimit ? 'secondary' : 'default'}>
              {isOverBudget
                ? `${(overallPercentage - 100).toFixed(1)}% acima do orçamento`
                : `${(100 - overallPercentage).toFixed(1)}% restante`}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
