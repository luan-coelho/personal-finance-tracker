'use client'

import { Edit2, Eye, Grid3X3, Plus, Table2 } from 'lucide-react'
import Link from 'next/link'
import { use, useState } from 'react'

import { BudgetWithSpending } from '@/app/db/schemas/budget-schema'

import { BudgetCard } from '@/components/budget-card'
import { BudgetForm } from '@/components/budget-form'
import { BudgetSummary } from '@/components/budget-summary'
import { BudgetsTable } from '@/components/budgets-table'
import { MonthSelector } from '@/components/month-selector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useBudgetSummary, useBudgetsWithSpending } from '@/hooks/use-budgets'
import { useIsMobile } from '@/hooks/use-mobile'
import { useMonthSelector } from '@/hooks/use-month-selector'
import { useSelectedSpace } from '@/hooks/use-selected-space'

export default function OrcamentosPage() {
  const isMobile = useIsMobile()
  const { selectedSpace } = useSelectedSpace()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetWithSpending | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')

  // Hook para controle de mês/ano
  const monthSelector = useMonthSelector()
  const currentMonthString = `${monthSelector.selectedYear}-${String(monthSelector.selectedMonth + 1).padStart(2, '0')}`

  // Queries para dados do orçamento
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgetsWithSpending(
    selectedSpace?.id || '',
    currentMonthString,
  )
  const { data: summary, isLoading: summaryLoading } = useBudgetSummary(selectedSpace?.id || '', currentMonthString)

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
      <div className="mb-8 flex flex-col items-center justify-between gap-3 md:flex-row md:gap-0">
        <div>
          <h1 className="text-3xl font-bold">Orçamentos</h1>
          {!isMobile && (
            <p className="text-muted-foreground">Gerencie os limites de gastos por categoria em {selectedSpace.name}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/admin/budgets/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Orçamento
            </Link>
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Criar Rápido
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Orçamento</DialogTitle>
              </DialogHeader>
              <BudgetForm defaultMonth={currentMonthString} onSuccess={handleCreateSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Seletor de Mês/Ano */}
      <MonthSelector onMonthChange={handleMonthChange} className="mb-6" />

      {/* Resumo dos Orçamentos */}
      <div className="mb-8">
        <BudgetSummary summary={summary} isLoading={summaryLoading} month={currentMonthString} />
      </div>

      {/* Lista de Orçamentos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Orçamentos por Categoria</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border p-1">
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
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={viewMode} onValueChange={value => setViewMode(value as 'cards' | 'table')}>
            <TabsContent value="cards" className="mt-0">
              {budgetsLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-muted h-48 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : budgets.length === 0 ? (
                <div className="py-4 text-center md:py-12">
                  <div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full md:h-24 md:w-24">
                    <Plus className="text-muted-foreground h-4 w-4 md:h-12 md:w-12" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">Nenhum orçamento definido</h3>
                  <p className="text-muted-foreground mb-4">
                    Crie seu primeiro orçamento para começar a controlar os gastos por categoria
                  </p>
                  <div className="flex flex-col justify-center gap-2 md:flex-row">
                    <Button asChild>
                      <Link href="/admin/budgets/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Primeiro Orçamento
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Rápido
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {budgets.map(budget => (
                    <BudgetCard key={budget.id} budget={budget} onEdit={handleEdit} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="table" className="mt-0">
              <BudgetsTable budgets={budgets} onEdit={handleEdit} onView={handleView} isLoading={budgetsLoading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

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
