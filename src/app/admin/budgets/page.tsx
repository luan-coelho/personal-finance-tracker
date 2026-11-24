'use client'

import { useEffect, useRef, useState } from 'react'

import type { BudgetWithSpending } from '@/app/db/schemas/budget-schema'

import { BudgetCard } from '@/components/budget-card'
import { BudgetComparisonCard } from '@/components/budget-comparison-card'
import { BudgetFilters, type BudgetFilters as BudgetFiltersType } from '@/components/budget-filters'
import { BudgetForm } from '@/components/budget-form'
import { BudgetSummary } from '@/components/budget-summary'
import { BudgetTransactionsDialog } from '@/components/budget-transactions-dialog'
import { BudgetsTable } from '@/components/budgets-table'
import { CopyBudgetDialog } from '@/components/copy-budget-dialog'
import { MonthSelector } from '@/components/month-selector'
import { QueryErrorCard } from '@/components/query-error-card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { PageActions } from '@/components/ui/page-actions'
import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { useBudgetSummary, useBudgetsWithSpending } from '@/hooks/use-budgets'
import { useSelectedSpace } from '@/hooks/use-selected-space'

import { getBudgetStatus } from '@/lib/budget-status'
import { addMonths, toMonthString } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

import { useMonthSelectorContext } from '@/providers/month-selector-provider'

export default function OrcamentosPage() {
  const { selectedSpace } = useSelectedSpace()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetWithSpending | null>(null)
  const [viewingBudgetId, setViewingBudgetId] = useState<string | null>(null)
  const viewingBudgetTriggerRef = useRef<HTMLButtonElement | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [filters, setFilters] = useState<BudgetFiltersType>({})

  // Hook para controle de mês/ano do contexto global
  const monthSelector = useMonthSelectorContext()
  const currentMonthString = toMonthString(monthSelector.selectedYear, monthSelector.selectedMonth)

  // Calcular mês anterior
  const previousMonthString = addMonths(currentMonthString, -1)

  // Queries para dados do orçamento
  const {
    data: budgets = [],
    isLoading: budgetsLoading,
    isError: budgetsError,
    refetch: refetchBudgets,
  } = useBudgetsWithSpending(selectedSpace?.id || '', currentMonthString)
  const {
    data: summary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useBudgetSummary(selectedSpace?.id || '', currentMonthString)

  // Buscar orçamentos do mês anterior para comparação
  const { data: previousBudgets = [] } = useBudgetsWithSpending(selectedSpace?.id || '', previousMonthString)

  useEffect(() => {
    setViewingBudgetId(null)
  }, [selectedSpace?.id, currentMonthString])

  const viewingBudget = budgets.find(
    budget =>
      budget.id === viewingBudgetId && budget.spaceId === selectedSpace?.id && budget.month === currentMonthString,
  )

  // Aplicar filtros aos orçamentos
  const filteredBudgets = budgets.filter(budget => {
    // Filtro de busca
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      if (!budget.category.toLowerCase().includes(searchLower)) {
        return false
      }
    }

    // Filtro de categoria
    if (filters.category && budget.category !== filters.category) {
      return false
    }

    // Filtro de status
    if (filters.status && filters.status !== 'all' && getBudgetStatus(budget.percentage) !== filters.status) {
      return false
    }

    // Filtro de valor
    if (filters.amountFrom && Number(budget.amount) < filters.amountFrom) return false
    if (filters.amountTo && Number(budget.amount) > filters.amountTo) return false

    return true
  })

  const handleMonthChange = () => {
    // Não precisa fazer nada específico, as queries serão refetch automaticamente
  }

  const handleEdit = (budget: BudgetWithSpending) => {
    setEditingBudget(budget)
  }

  const handleView = (budget: BudgetWithSpending) => {
    viewingBudgetTriggerRef.current = document.querySelector<HTMLButtonElement>(
      `[data-budget-transactions-trigger="${budget.id}"]`,
    )
    setViewingBudgetId(budget.id)
    void refetchBudgets()
    void refetchSummary()
  }

  function handleCompositionCloseAutoFocus(event: Event) {
    event.preventDefault()
    viewingBudgetTriggerRef.current?.focus()
  }

  const handleCreateSuccess = () => {
    setIsCreateOpen(false)
  }

  const handleEditSuccess = () => {
    setEditingBudget(null)
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  // Preparar dados de comparação
  const budgetComparisons = filteredBudgets.map(current => {
    const previous = previousBudgets.find(p => p.category === current.category)
    return {
      category: current.category,
      currentAmount: Number(current.amount),
      currentSpent: current.spent,
      currentPercentage: current.percentage,
      previousAmount: previous ? Number(previous.amount) : undefined,
      previousSpent: previous?.spent,
      previousPercentage: previous?.percentage,
    }
  })

  if (!selectedSpace) {
    return (
      <>
        <PageHeader title="Orçamentos" />
        <EmptyState
          bordered
          icon="wallet"
          title="Nenhum espaço selecionado"
          description="Selecione um espaço para gerenciar os orçamentos."
        />
      </>
    )
  }

  const renderList = () => {
    if (budgetsError && budgets.length === 0) {
      return <QueryErrorCard message="Não foi possível carregar os orçamentos." onRetry={() => refetchBudgets()} />
    }

    if (!budgetsLoading && filteredBudgets.length === 0) {
      return budgets.length === 0 ? (
        <EmptyState
          bordered
          icon="wallet"
          title="Nenhum orçamento definido"
          description="Crie o primeiro orçamento do mês para controlar os gastos por categoria."
          action={
            <Button variant="secondary" icon="plus" onClick={() => setIsCreateOpen(true)}>
              Criar orçamento
            </Button>
          }
        />
      ) : (
        <EmptyState
          bordered
          icon="search"
          title="Nenhum orçamento encontrado"
          description="Ajuste ou limpe os filtros para ver outros orçamentos."
          action={<Button onClick={handleClearFilters}>Limpar filtros</Button>}
        />
      )
    }

    // A tabela (9 colunas) só existe a partir de `md`; no celular a visão é sempre em cards.
    return (
      <>
        {viewMode === 'table' && (
          <div className="max-md:hidden">
            <BudgetsTable
              budgets={filteredBudgets}
              onEdit={handleEdit}
              onView={handleView}
              isLoading={budgetsLoading}
            />
          </div>
        )}
        <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-3', viewMode === 'table' && 'md:hidden')}>
          {budgetsLoading
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-lg" />)
            : filteredBudgets.map(budget => (
                <BudgetCard key={budget.id} budget={budget} onEdit={handleEdit} onView={handleView} />
              ))}
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Orçamentos" description={`Limites de gastos por categoria em ${selectedSpace.name}`} />

      <PageActions
        actions={
          <>
            <CopyBudgetDialog currentMonth={currentMonthString} />
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button variant="primary" icon="plus">
                  Novo orçamento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo orçamento</DialogTitle>
                </DialogHeader>
                <BudgetForm layout="dialog" onSuccess={handleCreateSuccess} onCancel={() => setIsCreateOpen(false)} />
              </DialogContent>
            </Dialog>
          </>
        }>
        <MonthSelector onMonthChange={handleMonthChange} />
        <ToggleGroup
          className="max-md:hidden"
          type="single"
          value={viewMode}
          onValueChange={value => setViewMode(value as 'cards' | 'table')}
          aria-label="Visualização dos orçamentos">
          <ToggleGroupItem value="cards" icon="grid">
            Cards
          </ToggleGroupItem>
          <ToggleGroupItem value="table" icon="table">
            Tabela
          </ToggleGroupItem>
        </ToggleGroup>
      </PageActions>

      <BudgetSummary summary={summary} isLoading={summaryLoading} month={currentMonthString} />

      <section aria-label="Orçamentos por categoria" className="flex flex-col gap-4">
        <BudgetFilters filters={filters} onFiltersChange={setFilters} onClearFilters={handleClearFilters} />
        {renderList()}
      </section>

      {/* Comparação com Mês Anterior */}
      {budgets.length > 0 && (
        <BudgetComparisonCard
          comparisons={budgetComparisons}
          currentMonth={currentMonthString}
          previousMonth={previousMonthString}
          isLoading={budgetsLoading}
        />
      )}

      {viewingBudget && (
        <BudgetTransactionsDialog
          key={viewingBudget.id}
          budget={viewingBudget}
          onClose={() => setViewingBudgetId(null)}
          onCloseAutoFocus={handleCompositionCloseAutoFocus}
        />
      )}

      {/* Dialog de edição */}
      <Dialog open={!!editingBudget} onOpenChange={() => setEditingBudget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar orçamento</DialogTitle>
          </DialogHeader>
          {editingBudget && (
            <BudgetForm
              layout="dialog"
              budget={editingBudget}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingBudget(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
