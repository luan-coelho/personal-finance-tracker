'use client'

import { CalendarIcon, Filter, Search, X } from 'lucide-react'
import { useState } from 'react'

import { TransactionType } from '@/app/db/schemas'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useTransactionCategories, useTransactionTags } from '@/hooks/use-transactions'

import { cn } from '@/lib/utils'

export interface TransactionFilters {
  search?: string
  type?: TransactionType
  category?: string
  tags?: string[]
  dateFrom?: Date
  dateTo?: Date
}

interface TransactionsFiltersProps {
  filters: TransactionFilters
  onFiltersChange: (filters: TransactionFilters) => void
  onClearFilters: () => void
}

export function TransactionsFilters({ filters, onFiltersChange, onClearFilters }: TransactionsFiltersProps) {
  const { selectedSpace } = useSelectedSpace()
  const [dateFromOpen, setDateFromOpen] = useState(false)
  const [dateToOpen, setDateToOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Queries para categorias e tags
  const { data: categories = [] } = useTransactionCategories(selectedSpace?.id || '')
  const { data: tags = [] } = useTransactionTags(selectedSpace?.id || '')

  const hasActiveFilters = Object.values(filters).some(
    value => value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true),
  )

  const activeFiltersCount = Object.values(filters).filter(
    value => value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true),
  ).length

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search: search || undefined })
  }

  const handleTypeChange = (type: string) => {
    onFiltersChange({
      ...filters,
      type: type === 'all' ? undefined : (type as TransactionType),
    })
  }

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: category === 'all' ? undefined : category,
    })
  }

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tag) ? currentTags.filter(t => t !== tag) : [...currentTags, tag]

    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined,
    })
  }

  const handleDateFromChange = (date: Date | undefined) => {
    onFiltersChange({ ...filters, dateFrom: date })
    setDateFromOpen(false)
  }

  const handleDateToChange = (date: Date | undefined) => {
    onFiltersChange({ ...filters, dateTo: date })
    setDateToOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Barra de busca */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Buscar transações..."
            value={filters.search || ''}
            onChange={e => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Botão de filtros */}
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative h-10">
              <Filter className="mr-2 h-6 w-6" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">{activeFiltersCount}</Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="p-5">
            <SheetHeader className="p-0">
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>Filtre as transações por tipo, categoria, tags e período.</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Tipo */}
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={filters.type || 'all'} onValueChange={handleTypeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="entrada">💰 Entradas</SelectItem>
                    <SelectItem value="saida">💸 Saídas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={filters.category || 'all'} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => {
                      const isSelected = filters.tags?.includes(tag)
                      return (
                        <Button
                          key={tag}
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleTagToggle(tag)}
                          className="h-7">
                          {tag}
                          {isSelected && <X className="ml-1 h-3 w-3" />}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Período */}
              <div className="space-y-4">
                <Label>Período</Label>

                {/* Data inicial */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm">De</Label>
                  <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !filters.dateFrom && 'text-muted-foreground',
                        )}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateFrom ? filters.dateFrom.toLocaleDateString('pt-BR') : 'Data inicial'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateFrom}
                        onSelect={handleDateFromChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Data final */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm">Até</Label>
                  <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !filters.dateTo && 'text-muted-foreground',
                        )}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateTo ? filters.dateTo.toLocaleDateString('pt-BR') : 'Data final'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={filters.dateTo} onSelect={handleDateToChange} initialFocus />
                    </PopoverContent>
                  </Popover>
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
          <Button variant="outline" onClick={onClearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filtros ativos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.type && (
            <Badge variant="secondary">
              Tipo: {filters.type === 'entrada' ? 'Entradas' : 'Saídas'}
              <button onClick={() => handleTypeChange('all')} className="hover:text-destructive ml-1">
                ×
              </button>
            </Badge>
          )}

          {filters.category && (
            <Badge variant="secondary">
              Categoria: {filters.category}
              <button onClick={() => handleCategoryChange('all')} className="hover:text-destructive ml-1">
                ×
              </button>
            </Badge>
          )}

          {filters.tags?.map(tag => (
            <Badge key={tag} variant="secondary">
              Tag: {tag}
              <button onClick={() => handleTagToggle(tag)} className="hover:text-destructive ml-1">
                ×
              </button>
            </Badge>
          ))}

          {filters.dateFrom && (
            <Badge variant="secondary">
              De: {filters.dateFrom.toLocaleDateString('pt-BR')}
              <button onClick={() => handleDateFromChange(undefined)} className="hover:text-destructive ml-1">
                ×
              </button>
            </Badge>
          )}

          {filters.dateTo && (
            <Badge variant="secondary">
              Até: {filters.dateTo.toLocaleDateString('pt-BR')}
              <button onClick={() => handleDateToChange(undefined)} className="hover:text-destructive ml-1">
                ×
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
