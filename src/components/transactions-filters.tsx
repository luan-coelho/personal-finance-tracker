'use client'

import { useEffect, useRef, useState } from 'react'

import type { TransactionType } from '@/app/db/schemas'

import { getCategoryIconClassName, getCategoryIconName } from '@/components/category-icon'
import { Button } from '@/components/ui/button'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import { CurrencyInput } from '@/components/ui/currency-input'
import { DateRangeField } from '@/components/ui/date-range-field'
import {
  FilterBar,
  FilterBarApplied,
  FilterBarAppliedChip,
  FilterBarChips,
  FilterBarFiltersButton,
  FilterBarQuick,
  FilterBarRow,
  FilterBarSearch,
} from '@/components/ui/filter-bar'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useSpaceMembers } from '@/hooks/use-space-members'
import { useTags } from '@/hooks/use-tags'
import { useTransactionCategories } from '@/hooks/use-transactions'

import { useSession } from '@/lib/auth-client'
import { formatCurrency } from '@/lib/currency'
import { getActiveTransactionFiltersCount, parseAmountFilterParam } from '@/lib/transaction-filter-utils'
import { transactionTypeMeta, transactionTypes } from '@/lib/transaction-type-meta'

export interface TransactionFilters {
  search?: string
  type?: TransactionType
  category?: string
  tags?: string[]
  dateFrom?: Date
  dateTo?: Date
  amountFrom?: number
  amountTo?: number
  userId?: string
}

interface TransactionsFiltersProps {
  filters: TransactionFilters
  onFiltersChange: (filters: TransactionFilters) => void
  onClearFilters: () => void
  hideBadges?: boolean
}

const ALL = 'all'
/** Espera depois da última tecla antes de buscar: digitar não dispara uma consulta por letra. */
const SEARCH_DEBOUNCE_MS = 300

function formatAmountFilterValue(value: number | undefined) {
  if (value === undefined) {
    return ''
  }

  return value.toLocaleString('pt-BR', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** Data inicial às 00:00:00.000 e final às 23:59:59.999, como os filtros sempre enviaram. */
function startOfFilterDay(date: Date | undefined) {
  if (!date) return undefined
  const adjustedDate = new Date(date)
  adjustedDate.setHours(0, 0, 0, 0)
  return adjustedDate
}

function endOfFilterDay(date: Date | undefined) {
  if (!date) return undefined
  const adjustedDate = new Date(date)
  adjustedDate.setHours(23, 59, 59, 999)
  return adjustedDate
}

export function TransactionsFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  hideBadges,
}: TransactionsFiltersProps) {
  const { selectedSpace } = useSelectedSpace()
  const { data: session } = useSession()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<TransactionFilters>(filters)

  // Queries para categorias, tags e membros do espaço
  const { data: categories = [] } = useTransactionCategories(selectedSpace?.id || '')
  const { data: tagsData = [] } = useTags(selectedSpace?.id || '')
  const { data: spaceMembers = [] } = useSpaceMembers(selectedSpace?.id || '')
  const tags = tagsData.map(tag => tag.name)

  const activeFiltersCount = getActiveTransactionFiltersCount(filters)
  const draftFiltersCount = getActiveTransactionFiltersCount(draftFilters)
  const hasActiveFilters = activeFiltersCount > 0
  const hasDraftFilters = draftFiltersCount > 0
  const currentUserId = session?.user?.id

  const categoryOptions: ComboboxOption[] = [
    { value: ALL, label: 'Todas as categorias', icon: 'grid' },
    ...categories.map(category => ({
      value: category,
      label: category,
      icon: getCategoryIconName(category),
      iconClassName: getCategoryIconClassName(category),
    })),
  ]
  const userOptions: ComboboxOption[] = [
    { value: ALL, label: 'Todos os usuários', icon: 'users' },
    ...spaceMembers.map(({ user }) => ({ value: user.id, label: user.name || 'Sem nome', icon: 'user' as const })),
  ]
  const tagOptions: ComboboxOption[] = tags.map(tag => ({ value: tag, label: tag }))

  const handleFiltersOpenChange = (open: boolean) => {
    setFiltersOpen(open)

    if (open) {
      setDraftFilters(filters)
    }
  }

  // Busca: o campo responde na hora e o filtro só muda quando a digitação para.
  const [searchDraft, setSearchDraft] = useState(filters.search ?? '')
  const appliedSearchRef = useRef(filters.search ?? '')
  const latestRef = useRef({ filters, onFiltersChange })
  latestRef.current = { filters, onFiltersChange }

  // Mudança vinda de fora (limpar filtros, link): o campo acompanha.
  useEffect(() => {
    const applied = filters.search ?? ''
    if (applied !== appliedSearchRef.current) {
      appliedSearchRef.current = applied
      setSearchDraft(applied)
    }
  }, [filters.search])

  useEffect(() => {
    if (searchDraft === appliedSearchRef.current) return
    const timeout = window.setTimeout(() => {
      appliedSearchRef.current = searchDraft
      latestRef.current.onFiltersChange({ ...latestRef.current.filters, search: searchDraft || undefined })
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timeout)
  }, [searchDraft])

  const handleTypeChange = (type: string) => {
    onFiltersChange({
      ...filters,
      type: type === ALL ? undefined : (type as TransactionType),
    })
  }

  const handleDraftTypeChange = (type: string) => {
    setDraftFilters(currentFilters => ({
      ...currentFilters,
      type: type === ALL ? undefined : (type as TransactionType),
    }))
  }

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: category === ALL ? undefined : category,
    })
  }

  const handleDraftCategoryChange = (category: string) => {
    setDraftFilters(currentFilters => ({
      ...currentFilters,
      category: category === ALL ? undefined : category,
    }))
  }

  const handleUserChange = (userId: string) => {
    onFiltersChange({
      ...filters,
      userId: userId === ALL ? undefined : userId,
    })
  }

  const handleDraftUserChange = (userId: string) => {
    setDraftFilters(currentFilters => ({
      ...currentFilters,
      userId: userId === ALL ? undefined : userId,
    }))
  }

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tag) ? currentTags.filter(t => t !== tag) : [...currentTags, tag]

    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined,
    })
  }

  const handleDraftTagsChange = (newTags: string[]) => {
    setDraftFilters(currentFilters => ({
      ...currentFilters,
      tags: newTags.length > 0 ? newTags : undefined,
    }))
  }

  const handleDraftDateRangeChange = ({ from, to }: { from?: Date; to?: Date }) => {
    setDraftFilters(currentFilters => ({
      ...currentFilters,
      dateFrom: startOfFilterDay(from),
      dateTo: endOfFilterDay(to),
    }))
  }

  // O CurrencyInput já entrega o valor mascarado por formatBrazilianAmountInput.
  const handleDraftAmountFromChange = (maskedValue: string) => {
    setDraftFilters(currentFilters => ({
      ...currentFilters,
      amountFrom: parseAmountFilterParam(maskedValue),
    }))
  }

  const handleDraftAmountToChange = (maskedValue: string) => {
    setDraftFilters(currentFilters => ({
      ...currentFilters,
      amountTo: parseAmountFilterParam(maskedValue),
    }))
  }

  const handleApplyFilters = () => {
    onFiltersChange(draftFilters)
    setFiltersOpen(false)
  }

  const handleClearAllFilters = () => {
    setDraftFilters({})
    onClearFilters()
  }

  const userName = (userId: string) => spaceMembers.find(m => m.user.id === userId)?.user.name || 'Desconhecido'

  return (
    <FilterBar>
      <FilterBarRow>
        <FilterBarSearch
          value={searchDraft}
          onValueChange={setSearchDraft}
          placeholder="Buscar por descrição"
          enterKeyHint="search"
        />

        <FilterBarChips>
          {/* Filtros rápidos de tipo */}
          {transactionTypes.map(type => (
            <FilterBarQuick
              key={type}
              icon={transactionTypeMeta[type].icon}
              tone={transactionTypeMeta[type].tone}
              selected={filters.type === type}
              onClick={() => handleTypeChange(filters.type === type ? ALL : type)}>
              {transactionTypeMeta[type].pluralLabel}
            </FilterBarQuick>
          ))}

          {/* "Eu": atalho para filtrar pelo usuário logado */}
          {currentUserId && (
            <FilterBarQuick
              icon="user"
              selected={filters.userId === currentUserId}
              onClick={() => handleUserChange(filters.userId === currentUserId ? ALL : currentUserId)}>
              Eu
            </FilterBarQuick>
          )}

          <Sheet open={filtersOpen} onOpenChange={handleFiltersOpenChange}>
            <SheetTrigger asChild>
              <FilterBarFiltersButton count={activeFiltersCount} />
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
                <SheetDescription>Filtre as transações por tipo, categoria, tags, valor e período.</SheetDescription>
              </SheetHeader>

              <SheetBody>
                {/* Tipo */}
                <div className="flex flex-col gap-1.5">
                  <Label id="filter-type-label">Tipo</Label>
                  <ToggleGroup
                    type="single"
                    fullWidth
                    aria-labelledby="filter-type-label"
                    value={draftFilters.type ?? ALL}
                    onValueChange={handleDraftTypeChange}>
                    <ToggleGroupItem value={ALL} className="px-2">
                      Todos
                    </ToggleGroupItem>
                    {transactionTypes.map(type => (
                      <ToggleGroupItem key={type} value={type} tone={transactionTypeMeta[type].tone} className="px-2">
                        {transactionTypeMeta[type].label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>

                {/* Categoria */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="filter-category">Categoria</Label>
                  <Combobox
                    id="filter-category"
                    options={categoryOptions}
                    value={draftFilters.category ?? ALL}
                    onChange={handleDraftCategoryChange}
                    searchPlaceholder="Buscar categoria"
                    emptyText="Nenhuma categoria encontrada"
                  />
                </div>

                {/* Usuário */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="filter-user">Usuário</Label>
                  <Combobox
                    id="filter-user"
                    options={userOptions}
                    value={draftFilters.userId ?? ALL}
                    onChange={handleDraftUserChange}
                    searchPlaceholder="Buscar usuário"
                    emptyText="Nenhum usuário encontrado"
                  />
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="filter-tags">Tags</Label>
                    <Combobox
                      id="filter-tags"
                      multiple
                      options={tagOptions}
                      value={draftFilters.tags ?? []}
                      onChange={handleDraftTagsChange}
                      placeholder="Todas as tags"
                      searchPlaceholder="Buscar tag"
                      emptyText="Nenhuma tag encontrada"
                    />
                  </div>
                )}

                {/* Faixa de valor */}
                <fieldset className="flex min-w-0 flex-col gap-1.5">
                  <legend className="mb-1.5 text-sm leading-5 font-medium">Faixa de valor</legend>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <Label htmlFor="filter-amount-from" className="text-muted-foreground text-[13px]">
                        Mínimo
                      </Label>
                      <CurrencyInput
                        id="filter-amount-from"
                        value={formatAmountFilterValue(draftFilters.amountFrom)}
                        onChange={handleDraftAmountFromChange}
                      />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <Label htmlFor="filter-amount-to" className="text-muted-foreground text-[13px]">
                        Máximo
                      </Label>
                      <CurrencyInput
                        id="filter-amount-to"
                        placeholder="9.999,99"
                        value={formatAmountFilterValue(draftFilters.amountTo)}
                        onChange={handleDraftAmountToChange}
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Período */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="filter-period">Período</Label>
                  <DateRangeField
                    id="filter-period"
                    numberOfMonths={1}
                    value={{ from: draftFilters.dateFrom, to: draftFilters.dateTo }}
                    onChange={handleDraftDateRangeChange}
                  />
                </div>
              </SheetBody>

              <SheetFooter>
                {(hasActiveFilters || hasDraftFilters) && (
                  <Button variant="ghost" onClick={handleClearAllFilters}>
                    Limpar filtros
                  </Button>
                )}
                <Button variant="primary" icon="check" className="ml-auto" onClick={handleApplyFilters}>
                  Aplicar filtros
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </FilterBarChips>
      </FilterBarRow>

      {/* Filtros aplicados (a linha some sem filtros) */}
      {!hideBadges && (
        <FilterBarApplied onClear={onClearFilters}>
          {filters.type && (
            <FilterBarAppliedChip
              icon={transactionTypeMeta[filters.type].icon}
              tone={transactionTypeMeta[filters.type].tone}
              onRemove={() => handleTypeChange(ALL)}>
              {`Tipo: ${transactionTypeMeta[filters.type].pluralLabel}`}
            </FilterBarAppliedChip>
          )}
          {filters.category && (
            <FilterBarAppliedChip onRemove={() => handleCategoryChange(ALL)}>
              {`Categoria: ${filters.category}`}
            </FilterBarAppliedChip>
          )}
          {filters.tags?.map(tag => (
            <FilterBarAppliedChip key={tag} onRemove={() => handleTagToggle(tag)}>
              {`Tag: ${tag}`}
            </FilterBarAppliedChip>
          ))}
          {filters.userId && (
            <FilterBarAppliedChip onRemove={() => handleUserChange(ALL)}>
              {`Usuário: ${userName(filters.userId)}`}
            </FilterBarAppliedChip>
          )}
          {filters.dateFrom && (
            <FilterBarAppliedChip onRemove={() => onFiltersChange({ ...filters, dateFrom: undefined })}>
              {`De: ${filters.dateFrom.toLocaleDateString('pt-BR')}`}
            </FilterBarAppliedChip>
          )}
          {filters.dateTo && (
            <FilterBarAppliedChip onRemove={() => onFiltersChange({ ...filters, dateTo: undefined })}>
              {`Até: ${filters.dateTo.toLocaleDateString('pt-BR')}`}
            </FilterBarAppliedChip>
          )}
          {filters.amountFrom !== undefined && (
            <FilterBarAppliedChip onRemove={() => onFiltersChange({ ...filters, amountFrom: undefined })}>
              {`Valor mínimo: ${formatCurrency(filters.amountFrom)}`}
            </FilterBarAppliedChip>
          )}
          {filters.amountTo !== undefined && (
            <FilterBarAppliedChip onRemove={() => onFiltersChange({ ...filters, amountTo: undefined })}>
              {`Valor máximo: ${formatCurrency(filters.amountTo)}`}
            </FilterBarAppliedChip>
          )}
        </FilterBarApplied>
      )}
    </FilterBar>
  )
}
