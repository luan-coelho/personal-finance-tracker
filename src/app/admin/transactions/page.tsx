'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useMemo, useState } from 'react'

import type { Transaction } from '@/app/db/schemas'

import { MonthSelector } from '@/components/month-selector'
import { QueryErrorCard } from '@/components/query-error-card'
import { TransactionForm } from '@/components/transaction-form'
import { TransactionSummary } from '@/components/transaction-summary'
import { type TransactionFilters, TransactionsFilters } from '@/components/transactions-filters'
import { TransactionsTable } from '@/components/transactions-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { PageActions } from '@/components/ui/page-actions'
import { PageHeader } from '@/components/ui/page-header'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

import type { UseMonthSelectorReturn } from '@/hooks/use-month-selector'
import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useTransactionSummary, useTransactions } from '@/hooks/use-transactions'

import { formatCurrency } from '@/lib/currency'
import { buildTransactionUrlQuery, parseTransactionUrlFilters } from '@/lib/transaction-filter-utils'
import { cn } from '@/lib/utils'

import { useMonthSelectorContext } from '@/providers/month-selector-provider'

import TransacoesLoading from './loading'

// `useSearchParams` exige Suspense para a rota continuar pré-renderizável.
export default function TransacoesPage() {
  return (
    <Suspense fallback={<TransacoesLoading />}>
      <TransacoesContent />
    </Suspense>
  )
}

function TransacoesContent() {
  const { selectedSpace, isLoading: isSpaceLoading } = useSelectedSpace()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const monthSelector = useMonthSelectorContext()
  const [page, setPage] = useState(1)
  // Filtros iniciais vindos da URL (ex.: link "ver transações de Mercado" no Início)
  const [filters, setFilters] = useState<TransactionFilters>(() => parseTransactionUrlFilters(searchParams))
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [prefillTransaction, setPrefillTransaction] = useState<Transaction | null>(null)

  // Mês/ano começa no mês do seletor compartilhado (o mesmo escolhido no Início)
  const [showAllTransactions, setShowAllTransactions] = useState(false)
  const [monthStartDate, setMonthStartDate] = useState(monthSelector.monthStartDate)
  const [monthEndDate, setMonthEndDate] = useState(monthSelector.monthEndDate)

  // Mantém na URL só os filtros linkáveis, para recarregar ou compartilhar a mesma visão
  const syncUrlFilters = (nextFilters: TransactionFilters) => {
    const query = buildTransactionUrlQuery({
      type: nextFilters.type,
      category: nextFilters.category,
      userId: nextFilters.userId,
    })
    if (query !== (searchParams.size ? `?${searchParams.toString()}` : '')) {
      router.replace(`${pathname}${query}`, { scroll: false })
    }
  }

  // Adicionar spaceId e filtro mensal condicional aos filtros - memoizado para evitar recriação
  const queryFilters = useMemo(
    () => ({
      ...filters,
      spaceId: selectedSpace?.id || '',
      // Se o usuário definiu filtros de data manualmente, usar eles; senão usar filtro mensal
      dateFrom: filters.dateFrom || (showAllTransactions ? undefined : monthStartDate),
      dateTo: filters.dateTo || (showAllTransactions ? undefined : monthEndDate),
    }),
    [filters, selectedSpace?.id, showAllTransactions, monthStartDate, monthEndDate],
  )

  // Verificar se há filtros ativos
  const hasActiveFilters = Object.values(filters).some(
    value => value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true),
  )

  const { data, isLoading, error, refetch } = useTransactions(queryFilters, page, 20)
  const { data: filteredSummary } = useTransactionSummary(queryFilters)

  const handleFiltersChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters)
    syncUrlFilters(newFilters)
    setPage(1) // Reset para primeira página quando filtros mudam
    // Se o usuário definiu filtros de data, desabilitar o filtro mensal automático
    if (newFilters.dateFrom || newFilters.dateTo) {
      setShowAllTransactions(true)
    }
  }

  const handleClearFilters = () => {
    setFilters({})
    syncUrlFilters({})
    setPage(1)
  }

  const handleMonthChange = useCallback((monthSelectorState: UseMonthSelectorReturn) => {
    setMonthStartDate(monthSelectorState.monthStartDate)
    setMonthEndDate(monthSelectorState.monthEndDate)
    setPage(1) // Reset página ao mudar mês
  }, [])

  const handleShowAll = () => {
    setShowAllTransactions(true)
    setPage(1)
  }

  const handleShowMonthly = () => {
    setShowAllTransactions(false)
    setPage(1)
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
  }

  const handleDuplicate = (transaction: Transaction) => {
    setPrefillTransaction(transaction)
    setIsCreateOpen(true)
  }

  const handleCreateSuccess = () => {
    setIsCreateOpen(false)
    setPrefillTransaction(null)
  }

  const handleCreateCancel = () => {
    setIsCreateOpen(false)
    setPrefillTransaction(null)
  }

  const handleEditSuccess = () => {
    setEditingTransaction(null)
  }

  const totalPages = data ? Math.ceil(data.total / 20) : 0

  if (isSpaceLoading && !selectedSpace) {
    return <TransacoesLoading />
  }

  if (!selectedSpace) {
    return (
      <>
        <PageHeader title="Transações" />
        <EmptyState
          bordered
          icon="wallet"
          title="Nenhum espaço selecionado"
          description="Selecione um espaço para visualizar as transações."
        />
      </>
    )
  }

  return (
    <>
      <PageHeader title="Transações" description={`Entradas, saídas e reservas de ${selectedSpace.name}`} />

      <PageActions
        actions={
          <Dialog
            open={isCreateOpen}
            onOpenChange={open => {
              setIsCreateOpen(open)
              if (!open) {
                setPrefillTransaction(null)
              }
            }}>
            <DialogTrigger asChild>
              <Button
                variant="primary"
                icon="plus"
                onClick={() => {
                  setPrefillTransaction(null)
                }}>
                Nova transação
              </Button>
            </DialogTrigger>
            <DialogContent size="md" onInteractOutside={e => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle>Nova transação</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <TransactionForm
                  transaction={prefillTransaction ?? undefined}
                  mode={prefillTransaction ? 'copy' : 'create'}
                  onSuccess={handleCreateSuccess}
                  onCancel={handleCreateCancel}
                  existingTransactions={data?.transactions}
                />
              </DialogBody>
            </DialogContent>
          </Dialog>
        }>
        {/* Seletor de mês/ano */}
        {!showAllTransactions ? (
          <MonthSelector onMonthChange={handleMonthChange} showAllButton={true} onShowAll={handleShowAll} />
        ) : (
          <div className="h-control-md flex flex-wrap items-center gap-2">
            <span className="text-sm leading-5 font-medium">Todas as transações</span>
            <Badge>Sem filtro de data</Badge>
            <Button variant="ghost" icon="calendar" onClick={handleShowMonthly}>
              Filtrar por mês
            </Button>
          </div>
        )}
      </PageActions>

      {/* Resumo financeiro */}
      <TransactionSummary
        dateFrom={showAllTransactions ? undefined : monthStartDate}
        dateTo={showAllTransactions ? undefined : monthEndDate}
      />

      {/* Filtros, resultado filtrado, tabela e paginação */}
      <section aria-label="Lista de transações" className="flex min-w-0 flex-col gap-4">
        <TransactionsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        {/* Resumo das transações filtradas - só aparece quando há filtros aplicados */}
        {hasActiveFilters && filteredSummary && filteredSummary.count > 0 && (
          <dl
            aria-label="Resumo das transações filtradas"
            className="flex flex-wrap items-baseline gap-x-6 gap-y-1 px-1 text-sm leading-5">
            <div className="flex items-baseline gap-1.5">
              <dt className="text-muted-foreground">Resultado</dt>
              <dd className="font-medium tabular-nums">
                {filteredSummary.count} {filteredSummary.count === 1 ? 'registro' : 'registros'}
              </dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="text-muted-foreground">Entradas</dt>
              <dd className="text-success-text font-medium tabular-nums">
                {formatCurrency(filteredSummary.totalEntradas)}
              </dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="text-muted-foreground">Saídas</dt>
              <dd className="text-error-text font-medium tabular-nums">
                {formatCurrency(filteredSummary.totalSaidas)}
              </dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="text-muted-foreground">Saldo</dt>
              <dd
                className={cn(
                  'font-medium tabular-nums',
                  filteredSummary.saldo >= 0 ? 'text-success-text' : 'text-error-text',
                )}>
                {formatCurrency(filteredSummary.saldo)}
              </dd>
            </div>
          </dl>
        )}

        {/* Tabela de transações */}
        {error ? (
          <QueryErrorCard message="Erro ao carregar transações." onRetry={refetch} />
        ) : (
          <TransactionsTable
            transactions={data?.transactions || []}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            isLoading={isLoading}
          />
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={e => {
                    e.preventDefault()
                    if (page > 1) setPage(page - 1)
                  }}
                  aria-disabled={page === 1 || undefined}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      onClick={e => {
                        e.preventDefault()
                        setPage(pageNumber)
                      }}
                      isActive={pageNumber === page}>
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={e => {
                    e.preventDefault()
                    if (page < totalPages) setPage(page + 1)
                  }}
                  aria-disabled={page === totalPages || undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </section>

      {/* Dialog de edição */}
      <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Editar transação</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {editingTransaction && (
              <TransactionForm
                transaction={editingTransaction}
                onSuccess={handleEditSuccess}
                onCancel={() => setEditingTransaction(null)}
                existingTransactions={data?.transactions}
              />
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  )
}
