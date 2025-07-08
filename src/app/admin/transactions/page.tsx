'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'

import { Transaction } from '@/app/db/schemas'

import { TransactionForm } from '@/components/transaction-form'
import { TransactionSummary } from '@/components/transaction-summary'
import { TransactionFilters, TransactionsFilters } from '@/components/transactions-filters'
import { TransactionsTable } from '@/components/transactions-table'
import { Button } from '@/components/ui/button'
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

  // Adicionar spaceId aos filtros
  const queryFilters = {
    ...filters,
    spaceId: selectedSpace?.id || '',
  }

  const { data, isLoading } = useTransactions(queryFilters, page, 20)

  const handleFiltersChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters)
    setPage(1) // Reset para primeira página quando filtros mudam
  }

  const handleClearFilters = () => {
    setFilters({})
    setPage(1)
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
  }

  const handleCreateSuccess = () => {
    setIsCreateOpen(false)
  }

  const handleEditSuccess = () => {
    setEditingTransaction(null)
  }

  const totalPages = data ? Math.ceil(data.total / 20) : 0

  if (!selectedSpace) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Transações</h1>
          <p className="text-muted-foreground">Selecione um espaço para visualizar as transações.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transações</h1>
          <p className="text-muted-foreground">Gerencie suas transações financeiras em {selectedSpace.name}</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Transação</DialogTitle>
            </DialogHeader>
            <TransactionForm onSuccess={handleCreateSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo financeiro */}
      <div className="mb-8">
        <TransactionSummary dateFrom={filters.dateFrom} dateTo={filters.dateTo} />
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <TransactionsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Tabela de transações */}
      <div className="mb-6">
        <TransactionsTable transactions={data?.transactions || []} onEdit={handleEdit} isLoading={isLoading} />
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(Math.max(1, page - 1))}
                  className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => setPage(pageNumber)}
                      isActive={pageNumber === page}
                      className="cursor-pointer">
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Dialog de edição */}
      <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
          </DialogHeader>
          {editingTransaction && <TransactionForm transaction={editingTransaction} onSuccess={handleEditSuccess} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
