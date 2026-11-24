'use client'

import Link from 'next/link'
import { useState } from 'react'

import type { BudgetWithSpending } from '@/app/db/schemas/budget-schema'

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
import { Badge } from '@/components/ui/badge'
import { Button, IconButton } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Icon, type IconName } from '@/components/ui/icon'
import { Progress } from '@/components/ui/progress'

import { useDeleteBudget } from '@/hooks/use-budgets'

import { type BudgetStatus, getBudgetStatus } from '@/lib/budget-status'
import { formatCurrency } from '@/lib/currency'
import { cn } from '@/lib/utils'

export { type BudgetStatus, getBudgetStatus }

export const budgetStatusMeta: Record<
  BudgetStatus,
  {
    label: string
    tone: 'success' | 'warning' | 'error'
    progressTone: 'primary' | 'warning' | 'error'
    icon: IconName
  }
> = {
  within: { label: 'Dentro do orçamento', tone: 'success', progressTone: 'primary', icon: 'check-circle' },
  near: { label: 'Perto do limite', tone: 'warning', progressTone: 'warning', icon: 'alert-triangle' },
  exceeded: { label: 'Estourado', tone: 'error', progressTone: 'error', icon: 'alert-circle' },
}

/** Status do orçamento sempre com ícone e rótulo, nunca só cor. */
export function BudgetStatusBadge({ percentage, className }: { percentage: number; className?: string }) {
  const meta = budgetStatusMeta[getBudgetStatus(percentage)]
  return (
    <Badge tone={meta.tone} icon={meta.icon} className={className}>
      {meta.label}
    </Badge>
  )
}

interface BudgetCardProps {
  budget: BudgetWithSpending
  onEdit?: (budget: BudgetWithSpending) => void
  onView?: (budget: BudgetWithSpending) => void
  className?: string
}

export function BudgetCard({ budget, onEdit, onView, className }: BudgetCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const deleteBudget = useDeleteBudget()

  const handleDelete = () => {
    deleteBudget.mutate(budget.id, {
      onSuccess: () => {
        setShowDeleteDialog(false)
      },
    })
  }

  const status = getBudgetStatus(budget.percentage)
  const isExceeded = budget.exceededAmount > 0

  return (
    <Card
      interactive
      className={cn(
        'relative',
        'has-[[data-slot=budget-card-link]:focus-visible]:border-border-strong has-[[data-slot=budget-card-link]:focus-visible]:shadow-[var(--sh-md),var(--focus-ring)]',
        className,
      )}>
      <CardHeader>
        <CardTitle className="flex min-w-0 items-center gap-2.5">
          <CategoryIconTile name={budget.category} />
          <Link
            href={`/admin/budgets/${budget.id}`}
            data-slot="budget-card-link"
            className="min-w-0 truncate outline-none after:absolute after:inset-0 after:rounded-lg">
            {budget.category}
          </Link>
        </CardTitle>
        <CardDescription className="mt-2">
          <BudgetStatusBadge percentage={budget.percentage} />
        </CardDescription>
        <CardAction className="relative z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton icon="more-horizontal" label={`Ações do orçamento ${budget.category}`} size="sm" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(budget)}>
                <Icon name="pencil" size={18} />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                <Icon name="trash" size={18} />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span
            className={cn(
              'text-xl leading-7 font-semibold tabular-nums',
              status === 'exceeded' ? 'text-error-text' : 'text-foreground',
            )}>
            {formatCurrency(budget.spent)}
          </span>
          <span className="text-muted-foreground text-sm tabular-nums">de {formatCurrency(Number(budget.amount))}</span>
        </div>

        <Progress
          value={budget.percentage}
          tone={budgetStatusMeta[status].progressTone}
          aria-label={`Uso do orçamento ${budget.category}`}
        />

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[13px] leading-5">
          <span className="font-medium tabular-nums">{budget.percentage.toFixed(1)}% usado</span>
          <span className={cn('tabular-nums', isExceeded ? 'text-error-text font-medium' : 'text-muted-foreground')}>
            {isExceeded
              ? `Excedido em ${formatCurrency(budget.exceededAmount)}`
              : `Restam ${formatCurrency(budget.remaining)}`}
          </span>
        </div>
      </CardContent>

      {onView && (
        <CardFooter className="justify-start">
          <Button
            size="sm"
            icon="list"
            className="relative z-10"
            data-budget-transactions-trigger={budget.id}
            onClick={() => onView(budget)}>
            Ver transações
          </Button>
        </CardFooter>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent destructive>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir orçamento?</AlertDialogTitle>
            <AlertDialogDescription>
              O orçamento de &quot;{budget.category}&quot; será excluído permanentemente. Essa ação não pode ser
              desfeita.
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
    </Card>
  )
}
