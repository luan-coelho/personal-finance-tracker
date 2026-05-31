'use client'

import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarIcon,
  Check,
  ChevronsUpDown,
  DollarSign,
  Filter,
  PiggyBank,
  Search,
  User,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { TransactionType } from '@/app/db/schemas'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { UserAvatarDisplay } from '@/components/user-avatar-display'

import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useSpaceMembers } from '@/hooks/use-space-members'
import { useTags } from '@/hooks/use-tags'
import { useTransactionCategories } from '@/hooks/use-transactions'

import { formatBrazilianAmountInput } from '@/lib/amount-utils'
import { useSession } from '@/lib/auth-client'
import { formatCurrency } from '@/lib/currency'
import { getActiveTransactionFiltersCount, parseAmountFilterParam } from '@/lib/transaction-filter-utils'
import { cn } from '@/lib/utils'

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

export function TransactionsFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  hideBadges,
}: TransactionsFiltersProps) {
  const { selectedSpace } = useSelectedSpace()
  const { data: session } = useSession()
  const [dateFromOpen, setDateFromOpen] = useState(false)
  const [dateToOpen, setDateToOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<TransactionFilters>(filters)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  // Queries para categorias, tags e membros do espaço
  const { data: categories = [] } = useTransactionCategories(selectedSpace?.id || '')
  const { data: tagsData = [] } = useTags(selectedSpace?.id || '')
  const { data: spaceMembers = [] } = useSpaceMembers(selectedSpace?.id || '')
  const tags = tagsData.map(tag => tag.name)

  // Opções para os comboboxes
  const categoryOptions = useMemo(
    () => [{ value: 'all', label: 'Todas' }, ...categories.map(category => ({ value: category, label: category }))],
    [categories],
  )

  const userOptions = useMemo(
    () => [
      { value: 'all', label: 'Todos', user: null },
      ...spaceMembers.map(member => ({
        value: member.user.id,
        label: member.user.name || 'Sem nome',
        user: member.user,
      })),
    ],
    [spaceMembers],
  )

  const activeFiltersCount = getActiveTransactionFiltersCount(filters)
  const draftFiltersCount = getActiveTransactionFiltersCount(draftFilters)
  const hasActiveFilters = activeFiltersCount > 0
  const hasDraftFilters = draftFiltersCount > 0

  const handleFiltersOpenChange = (open: boolean) => {
    setFiltersOpen(open)

    if (open) {
      setDraftFilters(filters)
    }
  }

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search: search || undefined })
  }

  const handleTypeChange = (type: string) => {
    onFiltersChange({
      ...filters,
      type: type === 'all' ? undefined : (type as TransactionType),
    })
  }

  const handleDraftTypeChange = (type: string) => {
    setDraftFilters(currentFilters => ({
      ...currentFilters,
      type: type === 'all' ? undefined : (type as TransactionType),
    }))
  }

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: category === 'all' ? undefined : category,
    })
  }

  const handleDraftCategoryChange = (category: string) => {
    setDraftFilters(currentFilters => ({
      ...currentFilters,
      category: category === 'all' ? undefined : category,
    }))
  }

  const handleUserChange = (userId: string) => {
    onFiltersChange({
      ...filters,
      userId: userId === 'all' ? undefined : userId,
    })
  }

  const handleDraftUserChange = (userId: string) => {
    setDraftFilters(currentFilters => ({
      ...currentFilters,
      userId: userId === 'all' ? undefined : userId,
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

  const handleDraftTagToggle = (tag: string) => {
    setDraftFilters(currentFilters => {
      const currentTags = currentFilters.tags || []
      const newTags = currentTags.includes(tag) ? currentTags.filter(t => t !== tag) : [...currentTags, tag]

      return {
        ...currentFilters,
        tags: newTags.length > 0 ? newTags : undefined,
      }
    })
  }

  const handleDateFromChange = (date: Date | undefined) => {
    if (date) {
      // Garantir que a data inicial comece às 00:00:00
      const adjustedDate = new Date(date)
      adjustedDate.setHours(0, 0, 0, 0)
      onFiltersChange({ ...filters, dateFrom: adjustedDate })
    } else {
      onFiltersChange({ ...filters, dateFrom: undefined })
    }
    setDateFromOpen(false)
  }

  const handleDraftDateFromChange = (date: Date | undefined) => {
    setDraftFilters(currentFilters => {
      if (!date) {
        return { ...currentFilters, dateFrom: undefined }
      }

      const adjustedDate = new Date(date)
      adjustedDate.setHours(0, 0, 0, 0)
      return { ...currentFilters, dateFrom: adjustedDate }
    })
    setDateFromOpen(false)
  }

  const handleDateToChange = (date: Date | undefined) => {
    if (date) {
      // Garantir que a data final termine às 23:59:59.999
      const adjustedDate = new Date(date)
      adjustedDate.setHours(23, 59, 59, 999)
      onFiltersChange({ ...filters, dateTo: adjustedDate })
    } else {
      onFiltersChange({ ...filters, dateTo: undefined })
    }
    setDateToOpen(false)
  }

  const handleDraftDateToChange = (date: Date | undefined) => {
    setDraftFilters(currentFilters => {
      if (!date) {
        return { ...currentFilters, dateTo: undefined }
      }

      const adjustedDate = new Date(date)
      adjustedDate.setHours(23, 59, 59, 999)
      return { ...currentFilters, dateTo: adjustedDate }
    })
    setDateToOpen(false)
  }

  const handleAmountFromChange = (value: string) => {
    const maskedValue = formatBrazilianAmountInput(value)
    onFiltersChange({ ...filters, amountFrom: parseAmountFilterParam(maskedValue) })
  }

  const handleDraftAmountFromChange = (value: string) => {
    const maskedValue = formatBrazilianAmountInput(value)
    setDraftFilters(currentFilters => ({
      ...currentFilters,
      amountFrom: parseAmountFilterParam(maskedValue),
    }))
  }

  const handleAmountToChange = (value: string) => {
    const maskedValue = formatBrazilianAmountInput(value)
    onFiltersChange({ ...filters, amountTo: parseAmountFilterParam(maskedValue) })
  }

  const handleDraftAmountToChange = (value: string) => {
    const maskedValue = formatBrazilianAmountInput(value)
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

  const selectedCategory = categoryOptions.find(opt => opt.value === (draftFilters.category || 'all'))
  const selectedUser = userOptions.find(opt => opt.value === (draftFilters.userId || 'all'))

  return (
    <div className="w-full space-y-4">
      {/* Barra de busca */}
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1 md:w-72 md:flex-none">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Buscar transações..."
            value={filters.search || ''}
            onChange={e => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Botão "Eu" - atalho para filtrar pelo usuário logado */}
        {session?.user?.id && (
          <Button
            variant={filters.userId === session.user.id ? 'default' : 'outline'}
            className="h-10 shrink-0 gap-2"
            onClick={() => {
              const isActive = filters.userId === session.user.id
              onFiltersChange({
                ...filters,
                userId: isActive ? undefined : session.user.id,
              })
            }}>
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Eu</span>
          </Button>
        )}

        {/* Botão de filtros */}
        <Sheet open={filtersOpen} onOpenChange={handleFiltersOpenChange}>
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
          <SheetContent className="flex h-full flex-col overflow-hidden p-0">
            <SheetHeader className="flex-shrink-0 px-5 pt-5">
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>Filtre as transações por tipo, categoria, tags, valor e período.</SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4">
              {/* Tipo */}
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={draftFilters.type || 'all'} onValueChange={handleDraftTypeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="entrada">
                      <div className="flex items-center gap-2">
                        <ArrowUpCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
                        Entradas
                      </div>
                    </SelectItem>
                    <SelectItem value="saida">
                      <div className="flex items-center gap-2">
                        <ArrowDownCircle className="h-4 w-4 text-red-600 dark:text-red-500" />
                        Saídas
                      </div>
                    </SelectItem>
                    <SelectItem value="reserva">
                      <div className="flex items-center gap-2">
                        <PiggyBank className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                        Reservas
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Categoria com pesquisa */}
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={categoryOpen}
                      className="w-full justify-between">
                      {selectedCategory?.label || 'Todas'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar categoria..." />
                      <CommandList>
                        <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                        <CommandGroup>
                          {categoryOptions.map(option => (
                            <CommandItem
                              key={option.value}
                              value={option.label}
                              onSelect={() => {
                                handleDraftCategoryChange(option.value)
                                setCategoryOpen(false)
                              }}>
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  (draftFilters.category || 'all') === option.value ? 'opacity-100' : 'opacity-0',
                                )}
                              />
                              {option.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Usuário com pesquisa */}
              <div className="space-y-2">
                <Label>Usuário</Label>
                <Popover open={userOpen} onOpenChange={setUserOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={userOpen}
                      className="w-full justify-between">
                      {selectedUser?.user ? (
                        <div className="flex items-center gap-2">
                          <UserAvatarDisplay user={selectedUser.user} size="sm" showTooltip={false} />
                          <span>{selectedUser.label}</span>
                        </div>
                      ) : (
                        selectedUser?.label || 'Todos'
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar usuário..." />
                      <CommandList>
                        <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                        <CommandGroup>
                          {userOptions.map(option => (
                            <CommandItem
                              key={option.value}
                              value={option.label}
                              onSelect={() => {
                                handleDraftUserChange(option.value)
                                setUserOpen(false)
                              }}>
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  (draftFilters.userId || 'all') === option.value ? 'opacity-100' : 'opacity-0',
                                )}
                              />
                              {option.user ? (
                                <div className="flex items-center gap-2">
                                  <UserAvatarDisplay user={option.user} size="sm" showTooltip={false} />
                                  <span>{option.label}</span>
                                </div>
                              ) : (
                                option.label
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: string) => {
                      const isSelected = draftFilters.tags?.includes(tag)
                      return (
                        <Button
                          key={tag}
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleDraftTagToggle(tag)}
                          className="h-7">
                          {tag}
                          {isSelected && <X className="ml-1 h-3 w-3" />}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Faixa de Valor */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Faixa de valor
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-sm">Mínimo</Label>
                    <div className="relative">
                      <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transform">
                        R$
                      </span>
                      <Input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9,.]*"
                        autoComplete="off"
                        placeholder="0,00"
                        value={formatAmountFilterValue(draftFilters.amountFrom)}
                        onChange={e => handleDraftAmountFromChange(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-sm">Máximo</Label>
                    <div className="relative">
                      <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transform">
                        R$
                      </span>
                      <Input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9,.]*"
                        autoComplete="off"
                        placeholder="9999,99"
                        value={formatAmountFilterValue(draftFilters.amountTo)}
                        onChange={e => handleDraftAmountToChange(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Período */}
              <div className="space-y-4">
                <Label>Período</Label>

                <div className="grid grid-cols-2 gap-2">
                  {/* Data inicial */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-sm">De</Label>
                    <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !draftFilters.dateFrom && 'text-muted-foreground',
                          )}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {draftFilters.dateFrom ? draftFilters.dateFrom.toLocaleDateString('pt-BR') : 'Data inicial'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={draftFilters.dateFrom}
                          onSelect={handleDraftDateFromChange}
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
                            !draftFilters.dateTo && 'text-muted-foreground',
                          )}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {draftFilters.dateTo ? draftFilters.dateTo.toLocaleDateString('pt-BR') : 'Data final'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={draftFilters.dateTo}
                          onSelect={handleDraftDateToChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>

            <SheetFooter className="flex-shrink-0 border-t px-5 pb-5">
              <Button onClick={handleApplyFilters} className="w-full">
                <Check className="mr-2 h-4 w-4" />
                Aplicar Filtros
              </Button>
              {(hasActiveFilters || hasDraftFilters) && (
                <Button variant="outline" onClick={handleClearAllFilters} className="w-full">
                  <X className="mr-2 h-4 w-4" />
                  Limpar Filtros
                </Button>
              )}
            </SheetFooter>
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
      {!hideBadges && hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.type && (
            <Badge variant="secondary">
              Tipo: {filters.type === 'entrada' ? 'Entradas' : filters.type === 'saida' ? 'Saídas' : 'Reservas'}
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

          {filters.userId && (
            <Badge variant="secondary">
              Usuário: {spaceMembers.find(m => m.user.id === filters.userId)?.user.name || 'Desconhecido'}
              <button onClick={() => handleUserChange('all')} className="hover:text-destructive ml-1">
                ×
              </button>
            </Badge>
          )}

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

          {filters.amountFrom !== undefined && (
            <Badge variant="secondary">
              Valor mínimo: {formatCurrency(filters.amountFrom)}
              <button onClick={() => handleAmountFromChange('')} className="hover:text-destructive ml-1">
                ×
              </button>
            </Badge>
          )}

          {filters.amountTo !== undefined && (
            <Badge variant="secondary">
              Valor máximo: {formatCurrency(filters.amountTo)}
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
