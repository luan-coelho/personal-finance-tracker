'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'

import type { BudgetWithSpending } from '@/app/db/schemas/budget-schema'
import type { TransactionWithUser } from '@/app/db/schemas/transaction-schema'

import { QueryErrorCard } from '@/components/query-error-card'
import { TransactionForm } from '@/components/transaction-form'
import { TransactionsTable } from '@/components/transactions-table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

import { useTransactionSummary, useTransactions } from '@/hooks/use-transactions'

import { getBudgetTransactionFilters } from '@/lib/budget-transaction-utils'
import { formatCurrency } from '@/lib/currency'
import { getMonthNameInPortuguese } from '@/lib/date-utils'
import type { TransactionInitialValues } from '@/lib/transaction-form-utils'

interface BudgetTransactionsDialogProps {
  budget: BudgetWithSpending
  onClose: () => void
  onCloseAutoFocus: (event: Event) => void
}

const PAGE_SIZE = 20

type TransactionEditor =
  | { mode: 'create'; initialValues: TransactionInitialValues }
  | { mode: 'edit'; transaction: TransactionWithUser }

function SummaryTile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-border flex min-w-0 flex-col gap-1 rounded-md border px-4 py-3">
      <dt className="text-muted-foreground text-[13px] leading-5 font-medium">{label}</dt>
      <dd className="text-foreground text-xl leading-7 font-semibold tabular-nums">{children}</dd>
    </div>
  )
}

export function BudgetTransactionsDialog({ budget, onClose, onCloseAutoFocus }: BudgetTransactionsDialogProps) {
  const [page, setPage] = useState(1)
  const [editor, setEditor] = useState<TransactionEditor | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const addButtonRef = useRef<HTMLButtonElement>(null)
  const editOriginRef = useRef<string | null>(null)
  const restoreFocusRef = useRef(false)
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

  useEffect(() => {
    if (editor) {
      contentRef.current?.querySelector('textarea')?.focus()
    } else if (restoreFocusRef.current) {
      restoreFocusRef.current = false
      const editButton = Array.from(
        contentRef.current?.querySelectorAll<HTMLButtonElement>('[data-transaction-edit-trigger]') ?? [],
      ).find(button => button.dataset.transactionEditTrigger === editOriginRef.current)
      const focusTarget = editButton ?? addButtonRef.current
      focusTarget?.focus()
    }
  }, [editor])

  function closeEditor() {
    restoreFocusRef.current = true
    setEditor(null)
  }

  function handleSaved() {
    editOriginRef.current = null
    if (editor?.mode === 'create') setPage(1)
    closeEditor()
  }

  function handleCreate() {
    editOriginRef.current = null
    setEditor({
      mode: 'create',
      initialValues: { type: 'saida', category: budget.category, date: filters.dateFrom },
    })
  }

  function handleEdit(transaction: TransactionWithUser) {
    editOriginRef.current = transaction.id
    setEditor({ mode: 'edit', transaction })
  }

  function handleRetry() {
    void transactionsQuery.refetch()
    void summaryQuery.refetch()
  }

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent size="lg" onCloseAutoFocus={onCloseAutoFocus}>
        <DialogHeader>
          <DialogTitle>
            {editor ? (editor.mode === 'create' ? 'Nova transação' : 'Editar transação') : 'Transações do orçamento'}
          </DialogTitle>
          <DialogDescription>
            {budget.category} · {getMonthNameInPortuguese(month - 1)} de {year}
          </DialogDescription>
        </DialogHeader>

        <DialogBody ref={contentRef} className="gap-4">
          {editor ? (
            <TransactionForm
              mode={editor.mode}
              transaction={editor.mode === 'edit' ? editor.transaction : undefined}
              initialValues={editor.mode === 'create' ? editor.initialValues : undefined}
              onSuccess={handleSaved}
              onCancel={closeEditor}
            />
          ) : (
            <>
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <SummaryTile label="Valor orçado">{formatCurrency(budget.amount)}</SummaryTile>
                <SummaryTile label="Gasto total">
                  {summaryQuery.isPending ? (
                    <Skeleton className="h-7 w-28" />
                  ) : hasError ? (
                    '—'
                  ) : (
                    formatCurrency(summaryQuery.data?.totalSaidas ?? 0)
                  )}
                </SummaryTile>
                <SummaryTile label="Transações">
                  {summaryQuery.isPending ? (
                    <Skeleton className="h-7 w-12" />
                  ) : hasError ? (
                    '—'
                  ) : (
                    (summaryQuery.data?.count ?? 0)
                  )}
                </SummaryTile>
              </dl>

              {hasError ? (
                <QueryErrorCard message="Erro ao carregar a composição do orçamento." onRetry={handleRetry} />
              ) : (
                <TransactionsTable
                  transactions={transactionsQuery.data?.transactions ?? []}
                  isLoading={isLoading}
                  actions="edit"
                  onEdit={handleEdit}
                />
              )}
            </>
          )}
        </DialogBody>

        {!editor && (
          <DialogFooter className="justify-between">
            {!hasError && totalPages > 1 ? (
              <nav aria-label="Paginação das transações do orçamento" className="flex items-center gap-2">
                <Button
                  size="sm"
                  icon="chevron-left"
                  disabled={page === 1 || transactionsQuery.isFetching}
                  onClick={() => setPage(current => current - 1)}>
                  Anterior
                </Button>
                <span aria-live="polite" className="text-muted-foreground text-[13px] tabular-nums">
                  Página {page} de {totalPages}
                </span>
                <Button
                  size="sm"
                  iconRight="chevron-right"
                  disabled={page >= totalPages || transactionsQuery.isFetching}
                  onClick={() => setPage(current => current + 1)}>
                  Próxima
                </Button>
              </nav>
            ) : (
              <span />
            )}
            <Button ref={addButtonRef} variant="primary" icon="plus" onClick={handleCreate}>
              Adicionar transação
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
