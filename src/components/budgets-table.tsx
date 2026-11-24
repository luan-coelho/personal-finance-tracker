'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'

import type { BudgetWithSpendingAndUser } from '@/app/db/schemas/budget-schema'

import { BudgetStatusBadge, budgetStatusMeta, getBudgetStatus } from '@/components/budget-card'
import { CategoryIconTile } from '@/components/category-icon'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button, IconButton } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { Icon } from '@/components/ui/icon'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
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
  const pendingViewBudgetRef = useRef<BudgetWithSpendingAndUser | null>(null)
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

  const head = (
    <TableHeader>
      <TableRow>
        <TableHead>Categoria</TableHead>
        <TableHead numeric>Mês</TableHead>
        <TableHead numeric>Orçado</TableHead>
        <TableHead numeric>Gasto</TableHead>
        <TableHead numeric>Saldo</TableHead>
        <TableHead>Uso</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="w-[72px]">Criado por</TableHead>
        <TableHead className="w-14">
          <span className="sr-only">Ações</span>
        </TableHead>
      </TableRow>
    </TableHeader>
  )

  if (isLoading) {
    return (
      <Table aria-busy="true">
        {head}
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              {Array.from({ length: 4 }).map((__, j) => (
                <TableCell key={j} numeric>
                  <Skeleton className="ml-auto h-4 w-20" />
                </TableCell>
              ))}
              <TableCell>
                <Skeleton className="h-2 w-24 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-24 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="size-6 rounded-full" />
              </TableCell>
              <TableCell />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  if (budgets.length === 0) {
    return (
      <EmptyState
        bordered
        icon="wallet"
        title="Nenhum orçamento encontrado"
        description="Crie um orçamento para controlar os gastos de uma categoria."
      />
    )
  }

  return (
    <>
      <Table>
        {head}
        <TableBody>
          {budgets.map(budget => {
            const status = getBudgetStatus(budget.percentage)
            const isOverBudget = status === 'exceeded'

            return (
              <TableRow key={budget.id}>
                <TableCell>
                  <div className="flex min-w-0 items-center gap-3">
                    <CategoryIconTile name={budget.category} />
                    <Link
                      href={`/admin/budgets/${budget.id}`}
                      className="focus-visible:shadow-focus-ring rounded-xs font-medium outline-none hover:underline hover:underline-offset-4">
                      {budget.category}
                    </Link>
                  </div>
                </TableCell>
                <TableCell numeric className="text-muted-foreground whitespace-nowrap">
                  {formatMonth(budget.month)}
                </TableCell>
                <TableCell numeric className="whitespace-nowrap">
                  {formatCurrency(budget.amount)}
                </TableCell>
                <TableCell numeric className={cn('whitespace-nowrap', isOverBudget && 'text-error-text font-medium')}>
                  {formatCurrency(budget.spent)}
                </TableCell>
                <TableCell
                  numeric
                  className={cn(
                    'font-medium whitespace-nowrap',
                    budget.exceededAmount > 0 ? 'text-error-text' : 'text-success-text',
                  )}>
                  {budget.exceededAmount > 0
                    ? `Excedido ${formatCurrency(budget.exceededAmount)}`
                    : formatCurrency(budget.remaining)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Progress
                      value={budget.percentage}
                      tone={budgetStatusMeta[status].progressTone}
                      className="w-24"
                      aria-label={`Uso do orçamento ${budget.category}`}
                    />
                    <span className="w-12 text-right text-[13px] font-medium tabular-nums">
                      {budget.percentage.toFixed(0)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <BudgetStatusBadge percentage={budget.percentage} />
                </TableCell>
                <TableCell>
                  <UserAvatarDisplay user={budget.createdBy} size="sm" />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <IconButton
                        icon="more-horizontal"
                        label={`Ações do orçamento ${budget.category}`}
                        size="sm"
                        data-budget-transactions-trigger={budget.id}
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      onCloseAutoFocus={event => {
                        // Abre o modal depois que o menu libera o bloqueio de cliques externos.
                        const pendingBudget = pendingViewBudgetRef.current
                        if (pendingBudget?.id !== budget.id) return

                        pendingViewBudgetRef.current = null
                        event.preventDefault()
                        onView?.(pendingBudget)
                      }}>
                      {onView && (
                        <DropdownMenuItem onSelect={() => (pendingViewBudgetRef.current = budget)}>
                          <Icon name="list" size={18} />
                          Ver transações
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/budgets/${budget.id}`}>
                          <Icon name="eye" size={18} />
                          Ver detalhes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit?.(budget)}>
                        <Icon name="pencil" size={18} />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setBudgetToDelete(budget)}
                        disabled={deletingId === budget.id}>
                        <Icon name="trash" size={18} />
                        {deletingId === budget.id ? 'Excluindo' : 'Excluir'}
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
        <AlertDialogContent destructive>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir orçamento?</AlertDialogTitle>
            <AlertDialogDescription>
              O orçamento de &quot;{budgetToDelete?.category}&quot; será excluído permanentemente. Essa ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBudget.isPending} />
            <Button variant="destructive" loading={deleteBudget.isPending} onClick={handleDelete}>
              {deleteBudget.isPending ? 'Excluindo' : 'Excluir orçamento'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
