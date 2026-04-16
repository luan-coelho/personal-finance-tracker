'use client'

import { Edit2, MoreHorizontal, Trash2, Wallet } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { BudgetWithSpendingAndUser } from '@/app/db/schemas/budget-schema'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UserAvatarDisplay } from '@/components/user-avatar-display'

import { useDeleteBudget } from '@/hooks/use-budgets'

import { formatCurrency } from '@/lib/currency'
import { cn } from '@/lib/utils'

interface BudgetsTableProps {
  budgets: BudgetWithSpendingAndUser[]
  onEdit?: (budget: BudgetWithSpendingAndUser) => void
  onView?: (budget: BudgetWithSpendingAndUser) => void
  isLoading?: boolean
}

export function BudgetsTable({ budgets, onEdit, onView, isLoading }: BudgetsTableProps) {
  const [budgetToDelete, setBudgetToDelete] = useState<BudgetWithSpendingAndUser | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const deleteBudget = useDeleteBudget()

  const handleDelete = async () => {
    if (!budgetToDelete) return
    setDeletingId(budgetToDelete.id)
    try {
      await deleteBudget.mutateAsync(budgetToDelete.id)
    } finally {
      setDeletingId(null)
      setBudgetToDelete(null)
    }
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
    })
  }

  const getStatusBadge = (percentage: number) => {
    if (percentage > 100) {
      return (
        <Badge variant="destructive" className="font-semibold">
          Excedido
        </Badge>
      )
    }
    if (percentage >= 80) {
      return (
        <Badge variant="default" className="bg-yellow-500 font-semibold text-zinc-900 hover:bg-yellow-600">
          Atenção
        </Badge>
      )
    }
    return (
      <Badge variant="default" className="bg-green-500 font-semibold hover:bg-green-600">
        Normal
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-muted h-16 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (budgets.length === 0) {
    return (
      <div className="py-12 text-center">
        <Wallet className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-semibold">Nenhum orçamento encontrado</h3>
        <p className="text-muted-foreground">Comece criando seu primeiro orçamento para controlar seus gastos.</p>
      </div>
    )
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Criado por</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Mês</TableHead>
            <TableHead className="text-right">Orçamento</TableHead>
            <TableHead className="text-right">Gasto</TableHead>
            <TableHead className="text-right">Restante</TableHead>
            <TableHead>Progresso</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {budgets.map(budget => {
            const isOverBudget = budget.percentage > 100
            const progressValue = Math.min(100, budget.percentage)

            return (
              <TableRow key={budget.id}>
                <TableCell>
                  <UserAvatarDisplay user={budget.createdBy} size="sm" />
                </TableCell>
                <TableCell>
                  <Link href={`/admin/budgets/${budget.id}`} className="hover:underline">
                    <div className="font-medium">{budget.category}</div>
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">{formatMonth(budget.month)}</span>
                </TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(budget.amount)}</TableCell>
                <TableCell className="text-right font-mono">
                  <span className={cn(isOverBudget && 'text-destructive font-semibold')}>
                    {formatCurrency(budget.spent)}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono">
                  <span className={cn('font-semibold', budget.remaining <= 0 ? 'text-destructive' : 'text-green-600')}>
                    {budget.remaining <= 0 ? '−' : ''}
                    {formatCurrency(Math.abs(budget.remaining))}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={progressValue}
                      className={cn('h-2 w-24', isOverBudget && '[&>div]:bg-destructive')}
                    />
                    <span className={cn('text-sm font-medium', isOverBudget && 'text-destructive')}>
                      {budget.percentage.toFixed(0)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(budget.percentage)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/budgets/${budget.id}`}>Visualizar Detalhes</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit?.(budget)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setBudgetToDelete(budget)}
                        className="text-destructive"
                        disabled={deletingId === budget.id}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deletingId === budget.id ? 'Excluindo...' : 'Excluir'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <AlertDialog open={!!budgetToDelete} onOpenChange={() => setBudgetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O orçamento da categoria &quot;{budgetToDelete?.category}&quot; será
              excluído permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {deleteBudget.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
