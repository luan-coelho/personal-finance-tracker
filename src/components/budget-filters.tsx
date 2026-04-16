'use client'

import { AlertTriangle, CalendarIcon, CheckCircle2, Filter, Search, X, XCircle } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useTransactionCategories } from '@/hooks/use-transactions'

import { cn } from '@/lib/utils'

export interface BudgetFilters {
  search?: string
  category?: string
  monthFrom?: Date
  monthTo?: Date
  status?: 'all' | 'within' | 'near' | 'exceeded'
  amountFrom?: number
  amountTo?: number
}

interface BudgetFiltersProps {
  filters: BudgetFilters
  onFiltersChange: (filters: BudgetFilters) => void
  onClearFilters: () => void
}

export function BudgetFilters({ filters, onFiltersChange, onClearFilters }: BudgetFiltersProps) {
  const { selectedSpace } = useSelectedSpace()
  const [monthFromOpen, setMonthFromOpen] = useState(false)
  const [monthToOpen, setMonthToOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Buscar categorias existentes para sugestões
  const { data: categories = [] } = useTransactionCategories(selectedSpace?.id || '')

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '' && value !== 'all')

  const activeFiltersCount = Object.values(filters).filter(
    value => value !== undefined && value !== '' && value !== 'all',
  ).length

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search: search || undefined })
  }

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: category === 'all' ? undefined : category,
    })
  }

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status === 'all' ? undefined : (status as BudgetFilters['status']),
    })
  }

  const handleMonthFromChange = (date: Date | undefined) => {
    onFiltersChange({ ...filters, monthFrom: date })
    setMonthFromOpen(false)
  }

  const handleMonthToChange = (date: Date | undefined) => {
    onFiltersChange({ ...filters, monthTo: date })
    setMonthToOpen(false)
  }

  const handleAmountFromChange = (value: string) => {
    const amount = value ? parseFloat(value) : undefined
    onFiltersChange({ ...filters, amountFrom: amount })
  }

  const handleAmountToChange = (value: string) => {
    const amount = value ? parseFloat(value) : undefined
    onFiltersChange({ ...filters, amountTo: amount })
  }

  return (
    <div className="w-full space-y-4">
      {/* Barra de busca */}
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Buscar orçamentos por categoria..."
            value={filters.search || ''}
            onChange={e => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Botão de filtros */}
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative h-10 shrink-0 gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filtros</span>
              {activeFiltersCount > 0 && (
                <Badge className="flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="p-5">
            <SheetHeader className="p-0">
              <SheetTitle>Filtros de Orçamento</SheetTitle>
              <SheetDescription>Filtre os orçamentos por categoria, período, valor e status.</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Categoria */}
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={filters.category || 'all'} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status do Orçamento */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="within">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                        Dentro do orçamento
                      </div>
                    </SelectItem>
                    <SelectItem value="near">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                        Próximo do limite
                      </div>
                    </SelectItem>
                    <SelectItem value="exceeded">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600 dark:text-red-500" />
                        Excedido
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Período */}
              <div className="space-y-4">
                <Label>Período</Label>

                {/* Mês inicial */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm">A partir de</Label>
                  <Popover open={monthFromOpen} onOpenChange={setMonthFromOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !filters.monthFrom && 'text-muted-foreground',
                        )}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.monthFrom
                          ? filters.monthFrom.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })
                          : 'Selecione o mês inicial'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.monthFrom}
                        onSelect={handleMonthFromChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Mês final */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm">Até</Label>
                  <Popover open={monthToOpen} onOpenChange={setMonthToOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !filters.monthTo && 'text-muted-foreground',
                        )}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.monthTo
                          ? filters.monthTo.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })
                          : 'Selecione o mês final'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={filters.monthTo} onSelect={handleMonthToChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Faixa de Valor */}
              <div className="space-y-4">
                <Label>Faixa de Valor (R$)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-sm">Mínimo</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={filters.amountFrom || ''}
                      onChange={e => handleAmountFromChange(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-sm">Máximo</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="9999,99"
                      value={filters.amountTo || ''}
                      onChange={e => handleAmountToChange(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Botão limpar filtros */}
              {hasActiveFilters && (
                <Button variant="outline" onClick={onClearFilters} className="w-full">
                  <X className="mr-2 h-4 w-4" />
                  Limpar Filtros
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Botão limpar filtros (visível quando há filtros ativos) */}
        {hasActiveFilters && (
          <Button variant="outline" className="h-10 shrink-0" onClick={onClearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filtros ativos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.category && (
            <Badge variant="secondary">
              Categoria: {filters.category}
              <button onClick={() => handleCategoryChange('all')} className="hover:text-destructive ml-1">
                ×
              </button>
            </Badge>
          )}

          {filters.status && filters.status !== 'all' && (
            <Badge variant="secondary">
              Status:{' '}
              {filters.status === 'within'
                ? 'Dentro do orçamento'
                : filters.status === 'near'
                  ? 'Próximo do limite'
                  : 'Excedido'}
              <button onClick={() => handleStatusChange('all')} className="hover:text-destructive ml-1">
                ×
              </button>
            </Badge>
          )}

          {filters.monthFrom && (
            <Badge variant="secondary">
              A partir de: {filters.monthFrom.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' })}
              <button onClick={() => handleMonthFromChange(undefined)} className="hover:text-destructive ml-1">
                ×
              </button>
            </Badge>
          )}

          {filters.monthTo && (
            <Badge variant="secondary">
              Até: {filters.monthTo.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' })}
              <button onClick={() => handleMonthToChange(undefined)} className="hover:text-destructive ml-1">
                ×
              </button>
            </Badge>
          )}

          {filters.amountFrom && (
            <Badge variant="secondary">
              Valor mín: R$ {filters.amountFrom.toFixed(2)}
              <button onClick={() => handleAmountFromChange('')} className="hover:text-destructive ml-1">
                ×
              </button>
            </Badge>
          )}

          {filters.amountTo && (
            <Badge variant="secondary">
              Valor máx: R$ {filters.amountTo.toFixed(2)}
              <button onClick={() => handleAmountToChange('')} className="hover:text-destructive ml-1">
                ×
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
