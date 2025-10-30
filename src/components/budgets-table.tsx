'use client'

import { Edit2, Eye, MoreVertical, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Budget } from '@/app/db/schemas/budget-schema'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { useDeleteBudget } from '@/hooks/use-budgets'

import { cn } from '@/lib/utils'

interface BudgetsTableProps {
  budgets: Budget[]
  onEdit?: (budget: Budget) => void
  onView?: (budget: Budget) => void
  isLoading?: boolean
  showActions?: boolean
}

export function BudgetsTable({ budgets, onEdit, onView, isLoading = false, showActions = true }: BudgetsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const deleteBudget = useDeleteBudget()

  const handleDelete = async (budget: Budget) => {
    if (deletingId) return

    const confirmed = window.confirm(`Tem certeza que deseja excluir o orçamento da categoria "${budget.category}"?`)

    if (confirmed) {
      setDeletingId(budget.id)
      deleteBudget.mutate(budget.id, {
        onSettled: () => {
          setDeletingId(null)
        },
      })
    }
  }

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue)
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
    })
  }

  const getStatusBadge = (percentage: number) => {
    if (percentage > 100) {
      return <Badge variant="destructive">Excedido</Badge>
    }
    if (percentage >= 80) {
      return <Badge variant="secondary">Próximo do limite</Badge>
    }
    return <Badge variant="default">Dentro do orçamento</Badge>
  }

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              <TableHead>Mês</TableHead>
              <TableHead>Orçamento</TableHead>
              <TableHead>Gasto</TableHead>
              <TableHead>Restante</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead>Status</TableHead>
              {showActions && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="bg-muted h-4 w-16 animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="bg-muted h-4 w-16 animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="bg-muted h-4 w-16 animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="bg-muted h-6 w-20 animate-pulse rounded" />
                </TableCell>
                {showActions && (
                  <TableCell>
                    <div className="bg-muted float-right h-8 w-8 animate-pulse rounded" />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (budgets.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              <TableHead>Mês</TableHead>
              <TableHead>Orçamento</TableHead>
              <TableHead>Gasto</TableHead>
              <TableHead>Restante</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead>Status</TableHead>
              {showActions && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={showActions ? 8 : 7} className="text-muted-foreground py-8 text-center">
                Nenhum orçamento encontrado
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Categoria</TableHead>
            <TableHead>Mês</TableHead>
            <TableHead>Orçamento</TableHead>
            <TableHead>Gasto</TableHead>
            <TableHead>Restante</TableHead>
            <TableHead>Progresso</TableHead>
            <TableHead>Status</TableHead>
            {showActions && <TableHead className="text-right">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {budgets.map(budget => {
            // Calcular dados se for BudgetWithSpending
            const budgetAmount = Number(budget.amount)
            const spent = 'spent' in budget ? budget.spent : 0
            const remaining = 'remaining' in budget ? budget.remaining : budgetAmount
            const percentage = 'percentage' in budget ? budget.percentage : 0
            const isOverBudget = percentage > 100

            return (
              <TableRow key={budget.id}>
                <TableCell className="font-medium">{budget.category}</TableCell>
                <TableCell>{formatMonth(budget.month)}</TableCell>
                <TableCell>{formatCurrency(budgetAmount)}</TableCell>
                <TableCell className={cn(isOverBudget && 'text-destructive font-medium')}>
                  {formatCurrency(spent)}
                </TableCell>
                <TableCell className={cn(remaining <= 0 ? 'text-destructive' : 'text-green-600', 'font-medium')}>
                  {remaining <= 0 ? '−' : ''}
                  {formatCurrency(Math.abs(remaining))}
                </TableCell>
                <TableCell className="min-w-[150px]">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground text-xs">{percentage.toFixed(1)}%</span>
                    </div>
                    <Progress
                      value={Math.min(100, percentage)}
                      className={cn('h-2', isOverBudget && 'progress-destructive')}
                    />
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(percentage)}</TableCell>
                {showActions && (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={deletingId === budget.id}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(budget)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(budget)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(budget)}
                          disabled={deletingId === budget.id}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          {deletingId === budget.id ? 'Excluindo...' : 'Excluir'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
