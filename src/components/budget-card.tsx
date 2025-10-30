'use client'

import { Edit2, MoreVertical, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { BudgetWithSpending } from '@/app/db/schemas/budget-schema'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'

import { useDeleteBudget } from '@/hooks/use-budgets'

import { cn } from '@/lib/utils'

interface BudgetCardProps {
  budget: BudgetWithSpending
  onEdit?: (budget: BudgetWithSpending) => void
  className?: string
}

export function BudgetCard({ budget, onEdit, className }: BudgetCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const deleteBudget = useDeleteBudget()

  const handleDelete = () => {
    deleteBudget.mutate(budget.id, {
      onSuccess: () => {
        setShowConfirmDelete(false)
      },
    })
  }

  const getStatusColor = (percentage: number) => {
    if (percentage > 100) return 'destructive'
    if (percentage >= 80) return 'secondary'
    return 'default'
  }

  const getStatusText = (percentage: number) => {
    if (percentage > 100) return 'Excedido'
    if (percentage >= 80) return 'Próximo do limite'
    if (percentage >= 50) return 'No meio do caminho'
    return 'Dentro do orçamento'
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const progressValue = Math.min(100, budget.percentage)
  const isOverBudget = budget.percentage > 100

  return (
    <Card className={cn('relative', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{budget.category}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(budget)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => setShowConfirmDelete(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Valores */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Orçamento:</span>
            <span className="font-medium">{formatCurrency(Number(budget.amount))}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Gasto:</span>
            <span className={cn('font-medium', isOverBudget ? 'text-destructive' : 'text-foreground')}>
              {formatCurrency(budget.spent)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Restante:</span>
            <span className={cn('font-medium', budget.remaining <= 0 ? 'text-destructive' : 'text-green-600')}>
              {budget.remaining <= 0 ? '−' : ''}
              {formatCurrency(Math.abs(budget.remaining))}
            </span>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">Progresso</span>
            <span className="text-xs font-medium">{budget.percentage.toFixed(1)}%</span>
          </div>
          <Progress value={progressValue} className={cn('h-2', isOverBudget && 'progress-destructive')} />
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge variant={getStatusColor(budget.percentage)}>{getStatusText(budget.percentage)}</Badge>
        </div>
      </CardContent>

      {/* Confirmação de Delete */}
      {showConfirmDelete && (
        <div className="bg-background/80 absolute inset-0 flex items-center justify-center rounded-lg backdrop-blur-sm">
          <div className="space-y-3 p-4 text-center">
            <p className="text-sm font-medium">Excluir orçamento?</p>
            <p className="text-muted-foreground text-xs">Esta ação não pode ser desfeita.</p>
            <div className="flex justify-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowConfirmDelete(false)}>
                Cancelar
              </Button>
              <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleteBudget.isPending}>
                {deleteBudget.isPending ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
