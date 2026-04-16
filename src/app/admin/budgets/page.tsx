'use client'

import { useMonthSelectorContext } from '@/providers/month-selector-provider'
import { Grid3X3, Plus, Table2 } from 'lucide-react'
import { useState } from 'react'

import { BudgetWithSpending } from '@/app/db/schemas/budget-schema'

import { BudgetCard } from '@/components/budget-card'
import { BudgetComparisonCard } from '@/components/budget-comparison-card'
import { BudgetFilters, BudgetFilters as BudgetFiltersType } from '@/components/budget-filters'
import { BudgetForm } from '@/components/budget-form'
import { BudgetSummary } from '@/components/budget-summary'
import { BudgetsTable } from '@/components/budgets-table'
import { CopyBudgetDialog } from '@/components/copy-budget-dialog'
import { MonthSelector } from '@/components/month-selector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent } from '@/components/ui/tabs'

import { useBudgetSummary, useBudgetsWithSpending } from '@/hooks/use-budgets'
import { useIsMobile } from '@/hooks/use-mobile'
import { useSelectedSpace } from '@/hooks/use-selected-space'

export default function OrcamentosPage() {
  const isMobile = useIsMobile()
  const { selectedSpace } = useSelectedSpace()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetWithSpending | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [filters, setFilters] = useState<BudgetFiltersType>({})

  // Hook para controle de mês/ano do contexto global
  const monthSelector = useMonthSelectorContext()
  const currentMonthString = `${monthSelector.selectedYear}-${String(monthSelector.selectedMonth + 1).padStart(2, '0')}`

  // Calcular mês anterior
  const previousDate = new Date(monthSelector.selectedYear, monthSelector.selectedMonth - 1)
  const previousMonthString = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, '0')}`

  // Queries para dados do orçamento
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgetsWithSpending(
    selectedSpace?.id || '',
    currentMonthString,
  )
  const { data: summary, isLoading: summaryLoading } = useBudgetSummary(selectedSpace?.id || '', currentMonthString)

  // Buscar orçamentos do mês anterior para comparação
  const { data: previousBudgets = [] } = useBudgetsWithSpending(selectedSpace?.id || '', previousMonthString)

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
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'exceeded' && budget.percentage <= 100) return false
      if (filters.status === 'near' && (budget.percentage < 80 || budget.percentage > 100)) return false
      if (filters.status === 'within' && budget.percentage >= 80) return false
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
    // Navegar para página de detalhes (implementar se necessário)
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
      <div className="container mx-auto">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Orçamentos</h1>
          <p className="text-muted-foreground">Selecione um espaço para gerenciar os orçamentos.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      {/* Header da página */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Orçamentos</h1>
        {!isMobile && (
          <p className="text-muted-foreground">Gerencie os limites de gastos por categoria em {selectedSpace.name}</p>
        )}
      </div>

      {/* Seletor de Mês/Ano */}
      <MonthSelector onMonthChange={handleMonthChange} className="mb-6" />

      {/* Resumo dos Orçamentos */}
      <div className="mb-8">
        <BudgetSummary summary={summary} isLoading={summaryLoading} month={currentMonthString} />
      </div>

      {/* Lista de Orçamentos */}
      <Card>
        <CardHeader className="flex flex-col gap-3 space-y-0 p-4 md:flex-row md:items-center md:justify-between md:gap-4 md:p-6">
          <CardTitle className="shrink-0">Orçamentos por Categoria</CardTitle>

          <div className="flex w-full min-w-0 items-center gap-2 md:w-auto">
            <div className="min-w-0 flex-1 md:flex-none">
              <BudgetFilters filters={filters} onFiltersChange={setFilters} onClearFilters={handleClearFilters} />
            </div>

            {/* Toggle de visualização */}
            <div className="hidden h-10 shrink-0 items-center rounded-lg border p-1 md:flex">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="h-8 px-3">
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="h-8 px-3">
                <Table2 className="h-4 w-4" />
              </Button>
            </div>

            <CopyBudgetDialog currentMonth={currentMonthString} />

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="h-10 shrink-0">
                  <Plus className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Novo Orçamento</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Criar Novo Orçamento</DialogTitle>
                </DialogHeader>
                <BudgetForm onSuccess={handleCreateSuccess} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={viewMode} onValueChange={value => setViewMode(value as 'cards' | 'table')}>
            <TabsContent value="cards" className="mt-0 p-4 md:p-6">
              {budgetsLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-muted h-48 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : filteredBudgets.length === 0 ? (
                <div className="py-4 text-center md:py-12">
                  <div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full md:h-24 md:w-24">
                    <Plus className="text-muted-foreground h-4 w-4 md:h-12 md:w-12" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">
                    {budgets.length === 0 ? 'Nenhum orçamento definido' : 'Nenhum orçamento encontrado'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {budgets.length === 0
                      ? 'Crie seu primeiro orçamento para começar a controlar os gastos por categoria'
                      : 'Tente ajustar os filtros ou criar um novo orçamento'}
                  </p>
                  <div className="flex justify-center">
                    <Button onClick={() => setIsCreateOpen(true)} className="w-full md:w-auto">
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Primeiro Orçamento
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredBudgets.map(budget => (
                    <BudgetCard key={budget.id} budget={budget} onEdit={handleEdit} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="table" className="mt-0">
              <BudgetsTable
                budgets={filteredBudgets}
                onEdit={handleEdit}
                onView={handleView}
                isLoading={budgetsLoading}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Comparação com Mês Anterior */}
      {budgets.length > 0 && (
        <div className="mb-8">
          <BudgetComparisonCard
            comparisons={budgetComparisons}
            currentMonth={currentMonthString}
            previousMonth={previousMonthString}
            isLoading={budgetsLoading}
          />
        </div>
      )}

      {/* Dialog de edição */}
      <Dialog open={!!editingBudget} onOpenChange={() => setEditingBudget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Orçamento</DialogTitle>
          </DialogHeader>
          {editingBudget && <BudgetForm budget={editingBudget} onSuccess={handleEditSuccess} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
