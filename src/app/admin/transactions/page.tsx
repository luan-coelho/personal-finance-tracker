'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useMemo, useState } from 'react'

import type { Transaction } from '@/app/db/schemas'

import { MonthSelector } from '@/components/month-selector'
import { QueryErrorCard } from '@/components/query-error-card'
import { useTransactionComposer } from '@/components/transaction-composer'
import { TransactionForm } from '@/components/transaction-form'
import { TransactionSummary } from '@/components/transaction-summary'
import { type TransactionFilters, TransactionsFilters } from '@/components/transactions-filters'
import { TransactionsTable } from '@/components/transactions-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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

import { PHONE_QUERY, useMediaQuery } from '@/hooks/use-media-query'
import type { UseMonthSelectorReturn } from '@/hooks/use-month-selector'
import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useTransactionSummary, useTransactions } from '@/hooks/use-transactions'

import { formatCurrency } from '@/lib/currency'
import { buildTransactionUrlQuery, parseTransactionUrlFilters } from '@/lib/transaction-filter-utils'
import { cn } from '@/lib/utils'

import TransacoesLoading from './loading'

const PAGE_SIZE = 20

import { useMonthSelectorContext } from '@/providers/month-selector-provider'

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
  // No celular a lista cresce com "Carregar mais" (Radar) em vez de trocar de página.
  const isPhone = useMediaQuery(PHONE_QUERY)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const resetPaging = useCallback(() => {
    setPage(1)
    setVisibleCount(PAGE_SIZE)
  }, [])
  // Filtros iniciais vindos da URL (ex.: link "ver transações de Mercado" no Início)
  const [filters, setFilters] = useState<TransactionFilters>(() => parseTransactionUrlFilters(searchParams))
  const { openComposer } = useTransactionComposer()
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  // Mês/ano começa no mês do seletor compartilhado (o mesmo escolhido no Início).
  // Com período na URL, o filtro de data manda e o seletor de mês sai.
  const [showAllTransactions, setShowAllTransactions] = useState(() => Boolean(filters.dateFrom || filters.dateTo))
  const [monthStartDate, setMonthStartDate] = useState(monthSelector.monthStartDate)
  const [monthEndDate, setMonthEndDate] = useState(monthSelector.monthEndDate)

  // Mantém os filtros na URL, para recarregar, voltar ou reabrir o app na mesma visão
  const syncUrlFilters = (nextFilters: TransactionFilters) => {
    const query = buildTransactionUrlQuery(nextFilters)
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

  const { data, isLoading, error, refetch, isFetching, isPlaceholderData } = useTransactions(
    queryFilters,
    isPhone ? 1 : page,
    isPhone ? visibleCount : PAGE_SIZE,
    { keepPrevious: true },
  )
  const { data: filteredSummary } = useTransactionSummary(queryFilters)

  const handleFiltersChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters)
    syncUrlFilters(newFilters)
    resetPaging() // Volta ao início quando os filtros mudam
    // Se o usuário definiu filtros de data, desabilitar o filtro mensal automático
    if (newFilters.dateFrom || newFilters.dateTo) {
      setShowAllTransactions(true)
    }
  }

  const handleClearFilters = () => {
    setFilters({})
    syncUrlFilters({})
    resetPaging()
  }

  const handleMonthChange = useCallback(
    (monthSelectorState: UseMonthSelectorReturn) => {
      setMonthStartDate(monthSelectorState.monthStartDate)
      setMonthEndDate(monthSelectorState.monthEndDate)
      resetPaging() // Volta ao início ao mudar o mês
    },
    [resetPaging],
  )

  const handleShowAll = () => {
    setShowAllTransactions(true)
    resetPaging()
  }

  const handleShowMonthly = () => {
    setShowAllTransactions(false)
    resetPaging()
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
  }

  const handleDuplicate = (transaction: Transaction) => {
    openComposer({ duplicateOf: transaction, existingTransactions: data?.transactions })
  }

  const handleEditSuccess = () => {
    setEditingTransaction(null)
  }

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0
  const shownCount = data?.transactions.length ?? 0
  const hasMore = !!data && shownCount < data.total

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
          // No mobile a mesma ação é o FAB.
          <Button
            variant="primary"
            icon="plus"
            className="max-lg:hidden"
            onClick={() => openComposer({ existingTransactions: data?.transactions })}>
            Nova transação
          </Button>
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
          // Com filtro ou página nova a caminho, a lista anterior fica visível e esmaecida
          <div
            aria-busy={isPlaceholderData || undefined}
            className={cn('transition-opacity duration-200', isPlaceholderData && 'opacity-60')}>
            <TransactionsTable
              transactions={data?.transactions || []}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Celular: carregar mais */}
        {!error && data && data.total > PAGE_SIZE && (
          <div className="flex flex-col items-center gap-2 md:hidden">
            <p aria-live="polite" className="text-muted-foreground text-[13px] leading-5 tabular-nums">
              {shownCount} de {data.total} transações
            </p>
            {hasMore && (
              <Button
                className="w-full"
                loading={isFetching}
                onClick={() => setVisibleCount(count => count + PAGE_SIZE)}>
                {isFetching ? 'Carregando' : 'Carregar mais'}
              </Button>
            )}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <Pagination className="max-md:hidden">
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
        {/* Tocar fora não fecha: evita perder a edição por um toque acidental. */}
        <DialogContent size="md" onInteractOutside={event => event.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Editar transação</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <TransactionForm
              layout="dialog"
              transaction={editingTransaction}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingTransaction(null)}
              existingTransactions={data?.transactions}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
