'use client'

import { ArrowDownCircle, ArrowUpCircle, Hash, Plus, Wallet } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import { Transaction } from '@/app/db/schemas'

import { MonthSelector } from '@/components/month-selector'
import { TransactionForm } from '@/components/transaction-form'
import { TransactionSummary } from '@/components/transaction-summary'
import { TransactionFilters, TransactionsFilters } from '@/components/transactions-filters'
import { TransactionsTable } from '@/components/transactions-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useTransactions } from '@/hooks/use-transactions'

export default function TransacoesPage() {
  const { selectedSpace } = useSelectedSpace()
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<TransactionFilters>({})
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [prefillTransaction, setPrefillTransaction] = useState<Transaction | null>(null)

  // Estado para controle de mês/ano
  const [showAllTransactions, setShowAllTransactions] = useState(false)
  const [monthStartDate, setMonthStartDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [monthEndDate, setMonthEndDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  })

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

  const { data, isLoading } = useTransactions(queryFilters, page, 20)

  // DEBUG: Remover depois
  console.log(
    'Page:',
    page,
    'Data transactions count:',
    data?.transactions?.length,
    'First item:',
    data?.transactions?.[0]?.description,
  )

  const handleFiltersChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters)
    setPage(1) // Reset para primeira página quando filtros mudam
    // Se o usuário definiu filtros de data, desabilitar o filtro mensal automático
    if (newFilters.dateFrom || newFilters.dateTo) {
      setShowAllTransactions(true)
    }
  }

  const handleClearFilters = () => {
    setFilters({})
    setPage(1)
  }

  // Verificar se há filtros ativos
  const hasActiveFilters = Object.values(filters).some(
    value => value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true),
  )

  const handleMonthChange = useCallback((monthSelectorState: any) => {
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

  const handleEditSuccess = () => {
    setEditingTransaction(null)
  }

  const totalPages = data ? Math.ceil(data.total / 20) : 0

  if (!selectedSpace) {
    return (
      <div className="container mx-auto">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Transações</h1>
          <p className="text-muted-foreground">Selecione um espaço para visualizar as transações.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="mb-3 flex flex-col items-center justify-between md:mb-8 md:flex-row">
        <div>
          <h1 className="text-3xl font-bold">Transações</h1>
          <p className="text-muted-foreground">Gerencie suas transações financeiras em {selectedSpace.name}</p>
        </div>

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
              className="w-full md:w-auto"
              onClick={() => {
                setPrefillTransaction(null)
              }}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md md:min-w-3xl">
            <DialogHeader>
              <DialogTitle>Nova Transação</DialogTitle>
            </DialogHeader>
            <TransactionForm
              transaction={prefillTransaction ?? undefined}
              mode={prefillTransaction ? 'copy' : 'create'}
              onSuccess={handleCreateSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Seletor de Mês/Ano */}
      {!showAllTransactions ? (
        <MonthSelector
          onMonthChange={handleMonthChange}
          showAllButton={true}
          onShowAll={handleShowAll}
          className="mb-6"
        />
      ) : (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Todas as Transações</h2>
                <Badge variant="outline">Sem filtro de data</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleShowMonthly} className="h-8">
                Filtrar por Mês
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo financeiro */}
      <div className="mb-8">
        <TransactionSummary
          dateFrom={showAllTransactions ? undefined : monthStartDate}
          dateTo={showAllTransactions ? undefined : monthEndDate}
        />
      </div>

      {/* Card principal com filtros, tabela e paginação */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="mb-6">
            <TransactionsFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Resumo das transações filtradas - só aparece quando há filtros aplicados */}
          {hasActiveFilters && data && data.transactions.length > 0 && (
            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              {/* Entradas */}
              <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900/30 dark:bg-green-950/20">
                <ArrowUpCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
                <div>
                  <p className="text-xs font-medium text-green-700 dark:text-green-400">Entradas</p>
                  <p className="text-sm font-bold text-green-600 dark:text-green-500">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      data.transactions.filter(t => t.type === 'entrada').reduce((sum, t) => sum + Number(t.amount), 0),
                    )}
                  </p>
                </div>
              </div>

              {/* Saídas */}
              <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/30 dark:bg-red-950/20">
                <ArrowDownCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
                <div>
                  <p className="text-xs font-medium text-red-700 dark:text-red-400">Saídas</p>
                  <p className="text-sm font-bold text-red-600 dark:text-red-500">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      data.transactions.filter(t => t.type === 'saida').reduce((sum, t) => sum + Number(t.amount), 0),
                    )}
                  </p>
                </div>
              </div>

              {/* Saldo */}
              {(() => {
                const entradas = data.transactions
                  .filter(t => t.type === 'entrada')
                  .reduce((sum, t) => sum + Number(t.amount), 0)
                const saidas = data.transactions
                  .filter(t => t.type === 'saida')
                  .reduce((sum, t) => sum + Number(t.amount), 0)
                const saldo = entradas - saidas
                const isPositive = saldo >= 0
                return (
                  <div
                    className={`flex items-center gap-3 rounded-lg border p-3 ${
                      isPositive
                        ? 'border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-950/20'
                        : 'border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20'
                    }`}>
                    <Wallet
                      className={`h-5 w-5 ${
                        isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
                      }`}
                    />
                    <div>
                      <p
                        className={`text-xs font-medium ${
                          isPositive ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                        }`}>
                        Saldo
                      </p>
                      <p
                        className={`text-sm font-bold ${
                          isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
                        }`}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldo)}
                      </p>
                    </div>
                  </div>
                )
              })()}

              {/* Total de Transações */}
              <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/30 dark:bg-blue-950/20">
                <Hash className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                <div>
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Transações</p>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-500">
                    {data.total} {data.total === 1 ? 'registro' : 'registros'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tabela de transações */}
          <div className="mb-6">
            <TransactionsTable
              transactions={data?.transactions || []}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              isLoading={isLoading}
            />
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={e => {
                        e.preventDefault()
                        if (page > 1) setPage(page - 1)
                      }}
                      aria-disabled={page === 1}
                      className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNumber = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={e => {
                            e.preventDefault()
                            setPage(pageNumber)
                          }}
                          isActive={pageNumber === page}
                          className="cursor-pointer">
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={e => {
                        e.preventDefault()
                        if (page < totalPages) setPage(page + 1)
                      }}
                      aria-disabled={page === totalPages}
                      className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de edição */}
      <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
        <DialogContent className="sm:max-w-md md:min-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
          </DialogHeader>
          {editingTransaction && <TransactionForm transaction={editingTransaction} onSuccess={handleEditSuccess} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
