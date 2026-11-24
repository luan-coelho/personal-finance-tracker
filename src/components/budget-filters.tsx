'use client'

import { useState } from 'react'

import { budgetStatusMeta } from '@/components/budget-card'
import { getCategoryIconName } from '@/components/category-icon'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import { CurrencyInput } from '@/components/ui/currency-input'
import {
  FilterBar,
  FilterBarApplied,
  FilterBarAppliedChip,
  FilterBarFiltersButton,
  FilterBarQuick,
  FilterBarRow,
  FilterBarSearch,
} from '@/components/ui/filter-bar'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useTransactionCategories } from '@/hooks/use-transactions'

import { normalizeBrazilianAmount } from '@/lib/amount-utils'
import { formatCurrency } from '@/lib/currency'

export interface BudgetFilters {
  search?: string
  category?: string
  status?: 'all' | 'within' | 'near' | 'exceeded'
  amountFrom?: number
  amountTo?: number
}

interface BudgetFiltersProps {
  filters: BudgetFilters
  onFiltersChange: (filters: BudgetFilters) => void
  onClearFilters: () => void
}

const STATUS_OPTIONS = ['within', 'near', 'exceeded'] as const

function formatAmountInput(amount: number | undefined) {
  return amount
    ? amount.toLocaleString('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : ''
}

export function BudgetFilters({ filters, onFiltersChange, onClearFilters }: BudgetFiltersProps) {
  const { selectedSpace } = useSelectedSpace()
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Buscar categorias existentes para sugestões
  const { data: categories = [] } = useTransactionCategories(selectedSpace?.id || '')

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '' && value !== 'all')

  // Filtros avançados (no Sheet); busca e status ficam na própria barra.
  const sheetFiltersCount = [filters.category, filters.amountFrom, filters.amountTo].filter(Boolean).length

  const categoryOptions = [
    { value: 'all', label: 'Todas as categorias' },
    ...categories.map(category => ({ value: category, label: category, icon: getCategoryIconName(category) })),
  ]

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

  const handleAmountFromChange = (value: string) => {
    const amount = value ? parseFloat(normalizeBrazilianAmount(value)) : undefined
    onFiltersChange({ ...filters, amountFrom: amount })
  }

  const handleAmountToChange = (value: string) => {
    const amount = value ? parseFloat(normalizeBrazilianAmount(value)) : undefined
    onFiltersChange({ ...filters, amountTo: amount })
  }

  return (
    <FilterBar>
      <FilterBarRow>
        <FilterBarSearch
          placeholder="Buscar por categoria"
          value={filters.search || ''}
          onValueChange={handleSearchChange}
        />

        {STATUS_OPTIONS.map(status => {
          const selected = filters.status === status
          return (
            <FilterBarQuick
              key={status}
              selected={selected}
              icon={budgetStatusMeta[status].icon}
              onClick={() => handleStatusChange(selected ? 'all' : status)}>
              {budgetStatusMeta[status].label}
            </FilterBarQuick>
          )
        })}

        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild>
            <FilterBarFiltersButton count={sheetFiltersCount} />
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>Filtre os orçamentos por categoria, período e valor.</SheetDescription>
            </SheetHeader>

            <SheetBody>
              <div className="flex flex-col gap-1.5">
                <Label id="budget-filter-category-label">Categoria</Label>
                <Combobox
                  aria-labelledby="budget-filter-category-label"
                  options={categoryOptions}
                  value={filters.category || 'all'}
                  onChange={handleCategoryChange}
                  placeholder="Todas as categorias"
                  searchPlaceholder="Buscar categoria"
                  emptyText="Nenhuma categoria encontrada"
                />
              </div>

              <fieldset className="flex flex-col gap-1.5">
                <legend className="mb-1.5 text-sm font-medium">Faixa de valor</legend>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="budget-filter-amount-from" className="text-muted-foreground text-[13px]">
                      Mínimo
                    </Label>
                    <CurrencyInput
                      id="budget-filter-amount-from"
                      value={formatAmountInput(filters.amountFrom)}
                      onChange={handleAmountFromChange}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="budget-filter-amount-to" className="text-muted-foreground text-[13px]">
                      Máximo
                    </Label>
                    <CurrencyInput
                      id="budget-filter-amount-to"
                      placeholder="9.999,99"
                      value={formatAmountInput(filters.amountTo)}
                      onChange={handleAmountToChange}
                    />
                  </div>
                </div>
              </fieldset>
            </SheetBody>

            <SheetFooter>
              <Button variant="ghost" onClick={onClearFilters} disabled={!hasActiveFilters}>
                Limpar filtros
              </Button>
              <SheetClose asChild>
                <Button variant="primary">Ver orçamentos</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </FilterBarRow>

      <FilterBarApplied onClear={onClearFilters}>
        {filters.category && (
          <FilterBarAppliedChip onRemove={() => handleCategoryChange('all')}>
            Categoria: {filters.category}
          </FilterBarAppliedChip>
        )}
        {filters.amountFrom && (
          <FilterBarAppliedChip onRemove={() => handleAmountFromChange('')}>
            Valor mínimo: {formatCurrency(filters.amountFrom)}
          </FilterBarAppliedChip>
        )}
        {filters.amountTo && (
          <FilterBarAppliedChip onRemove={() => handleAmountToChange('')}>
            Valor máximo: {formatCurrency(filters.amountTo)}
          </FilterBarAppliedChip>
        )}
      </FilterBarApplied>
    </FilterBar>
  )
}
