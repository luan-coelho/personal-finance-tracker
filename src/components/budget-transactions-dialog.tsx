'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'

import type { BudgetWithSpending } from '@/app/db/schemas/budget-schema'

import { QueryErrorCard } from '@/components/query-error-card'
import { TransactionsTable } from '@/components/transactions-table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

import { useTransactions, useTransactionSummary } from '@/hooks/use-transactions'

import { getBudgetTransactionFilters } from '@/lib/budget-transaction-utils'
import { formatCurrency } from '@/lib/currency'
import { getMonthNameInPortuguese } from '@/lib/date-utils'

interface BudgetTransactionsDialogProps {
  budget: BudgetWithSpending
  onClose: () => void
  onCloseAutoFocus: (event: Event) => void
}

const PAGE_SIZE = 20

export function BudgetTransactionsDialog({ budget, onClose, onCloseAutoFocus }: BudgetTransactionsDialogProps) {
  const [page, setPage] = useState(1)
  const filters = getBudgetTransactionFilters(budget)
  const transactionsQuery = useTransactions(filters, page, PAGE_SIZE, { staleTime: 0 })
  const summaryQuery = useTransactionSummary(filters, { staleTime: 0 })
  const [year, month] = budget.month.split('-').map(Number)
  const totalPages = Math.max(
    1,
    Math.ceil((transactionsQuery.data?.total ?? summaryQuery.data?.count ?? 0) / PAGE_SIZE),
  )
  const hasError = transactionsQuery.isError || summaryQuery.isError
  const isLoading = transactionsQuery.isPending || summaryQuery.isPending

  useEffect(() => {
    if (transactionsQuery.data && page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages, transactionsQuery.data])

  function handleRetry() {
    void transactionsQuery.refetch()
    void summaryQuery.refetch()
  }

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent
        className="flex max-h-[calc(100dvh-2rem)] flex-col sm:max-w-5xl"
        onCloseAutoFocus={onCloseAutoFocus}>
        <DialogHeader className="shrink-0 pr-6">
          <DialogTitle>Transações do orçamento</DialogTitle>
          <DialogDescription>
            {budget.category} · {getMonthNameInPortuguese(month - 1)} de {year}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 space-y-4 overflow-y-auto">
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-3">
              <dt className="text-muted-foreground text-sm">Valor orçado</dt>
              <dd className="mt-1 font-semibold">{formatCurrency(budget.amount)}</dd>
            </div>
            <div className="rounded-lg border p-3">
              <dt className="text-muted-foreground text-sm">Gasto total</dt>
              <dd className="mt-1 font-semibold">
                {summaryQuery.isPending ? (
                  <Skeleton className="h-6 w-28" />
                ) : hasError ? (
                  '—'
                ) : (
                  formatCurrency(summaryQuery.data?.totalSaidas ?? 0)
                )}
              </dd>
            </div>
            <div className="rounded-lg border p-3">
              <dt className="text-muted-foreground text-sm">Transações</dt>
              <dd className="mt-1 font-semibold">
                {summaryQuery.isPending ? (
                  <Skeleton className="h-6 w-12" />
                ) : hasError ? (
                  '—'
                ) : (
                  (summaryQuery.data?.count ?? 0)
                )}
              </dd>
            </div>
          </dl>

          {hasError ? (
            <QueryErrorCard message="Erro ao carregar a composição do orçamento." onRetry={handleRetry} />
          ) : (
            <TransactionsTable
              transactions={transactionsQuery.data?.transactions ?? []}
              isLoading={isLoading}
              readOnly
            />
          )}
        </div>

        {!hasError && totalPages > 1 && (
          <nav
            aria-label="Paginação das transações do orçamento"
            className="flex shrink-0 items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || transactionsQuery.isFetching}
              onClick={() => setPage(current => current - 1)}>
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span aria-live="polite" className="text-muted-foreground text-center text-sm">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || transactionsQuery.isFetching}
              onClick={() => setPage(current => current + 1)}>
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </nav>
        )}
      </DialogContent>
    </Dialog>
  )
}
