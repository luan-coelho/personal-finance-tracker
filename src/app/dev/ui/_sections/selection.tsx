'use client'

import { addDays, startOfDay, subDays } from 'date-fns'
import { type ReactNode, useState } from 'react'

import { Button, IconButton } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { DatePicker } from '@/components/ui/date-picker'
import { DateRangeField, type DateRangeValue } from '@/components/ui/date-range-field'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  FilterBar,
  FilterBarApplied,
  FilterBarAppliedChip,
  FilterBarEnd,
  FilterBarFiltersButton,
  FilterBarQuick,
  FilterBarRow,
  FilterBarSearch,
} from '@/components/ui/filter-bar'
import { Icon } from '@/components/ui/icon'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

function Demo({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="border-border bg-card shadow-sh-sm flex min-w-0 flex-col gap-3 rounded-lg border p-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-base leading-6 font-semibold">{title}</h3>
        {description && <p className="text-muted-foreground text-sm leading-5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-sm leading-5 font-medium">{label}</span>
      {children}
    </div>
  )
}

const categoryOptions: ComboboxOption[] = [
  { value: 'food', label: 'Alimentação', icon: 'utensils' },
  { value: 'transport', label: 'Transporte', icon: 'car' },
  { value: 'housing', label: 'Moradia', icon: 'home' },
  { value: 'health', label: 'Saúde', icon: 'heart-pulse' },
  { value: 'education', label: 'Educação', icon: 'graduation-cap' },
  { value: 'leisure', label: 'Lazer', icon: 'gamepad' },
  { value: 'shopping', label: 'Compras', icon: 'shopping-bag' },
  { value: 'travel', label: 'Viagem', icon: 'plane' },
  { value: 'archived', label: 'Arquivada', icon: 'folder', disabled: true },
]

const tagOptions: ComboboxOption[] = [
  { value: 'fixed', label: 'Fixa' },
  { value: 'recurring', label: 'Recorrente' },
  { value: 'reimbursable', label: 'Reembolsável' },
  { value: 'shared', label: 'Compartilhada' },
  { value: 'essential', label: 'Essencial' },
]

function SelectDemo() {
  const [value, setValue] = useState('expense')
  return (
    <Demo title="Select" description="Gatilho igual ao Input; lista em popover com check no item escolhido.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Labeled label="Tipo">
          <Select value={value} onValueChange={setValue}>
            <SelectTrigger aria-label="Tipo">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Despesa</SelectItem>
              <SelectItem value="income">Receita</SelectItem>
              <SelectItem value="transfer">Transferência</SelectItem>
              <SelectItem value="archived" disabled>
                Arquivada
              </SelectItem>
            </SelectContent>
          </Select>
        </Labeled>
        <Labeled label="Vazio (placeholder)">
          <Select>
            <SelectTrigger aria-label="Conta">
              <SelectValue placeholder="Selecione a conta" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Contas</SelectLabel>
                <SelectItem value="checking">Conta corrente</SelectItem>
                <SelectItem value="savings">Poupança</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Cartões</SelectLabel>
                <SelectItem value="card">Cartão de crédito</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Labeled>
        <Labeled label="Inválido">
          <Select>
            <SelectTrigger aria-label="Categoria" aria-invalid>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="food">Alimentação</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-error-text flex items-start gap-1.5 text-[13px] leading-[18px]">
            <Icon name="alert-circle" size={14} className="mt-0.5" />
            Escolha uma categoria para a transação
          </p>
        </Labeled>
        <Labeled label="Desabilitado">
          <Select disabled defaultValue="income">
            <SelectTrigger aria-label="Tipo desabilitado">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Receita</SelectItem>
            </SelectContent>
          </Select>
        </Labeled>
        <Labeled label="Compacto (sm, 40px)">
          <Select defaultValue="20">
            <SelectTrigger size="sm" className="w-32" aria-label="Itens por página">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 por página</SelectItem>
              <SelectItem value="20">20 por página</SelectItem>
              <SelectItem value="50">50 por página</SelectItem>
            </SelectContent>
          </Select>
        </Labeled>
      </div>
    </Demo>
  )
}

function ComboboxDemo() {
  const [category, setCategory] = useState('food')
  const [emptyCategory, setEmptyCategory] = useState('')
  const [tags, setTags] = useState<string[]>(['fixed', 'shared'])
  const [tagsCount, setTagsCount] = useState<string[]>(['fixed', 'recurring', 'essential'])
  return (
    <Demo title="Combobox" description="Popover + lista pesquisável; o trecho digitado fica destacado.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Labeled label="Escolha única com ícones">
          <Combobox
            options={categoryOptions}
            value={category}
            onChange={setCategory}
            placeholder="Selecione a categoria"
            searchPlaceholder="Buscar categoria"
            aria-label="Categoria"
          />
        </Labeled>
        <Labeled label="Vazio">
          <Combobox
            options={categoryOptions}
            value={emptyCategory}
            onChange={setEmptyCategory}
            placeholder="Selecione a categoria"
            aria-label="Categoria vazia"
          />
        </Labeled>
        <Labeled label="Múltipla (chips)">
          <Combobox
            multiple
            options={tagOptions}
            value={tags}
            onChange={setTags}
            placeholder="Todas as tags"
            searchPlaceholder="Buscar tag"
            emptyText="Nenhuma tag encontrada"
            aria-label="Tags"
          />
        </Labeled>
        <Labeled label="Múltipla (contagem)">
          <Combobox
            multiple
            display="count"
            options={tagOptions}
            value={tagsCount}
            onChange={setTagsCount}
            placeholder="Todas as tags"
            aria-label="Tags (contagem)"
          />
        </Labeled>
        <Labeled label="Inválido">
          <Combobox
            options={categoryOptions}
            invalid
            placeholder="Selecione a categoria"
            aria-label="Categoria inválida"
          />
        </Labeled>
        <Labeled label="Desabilitado">
          <Combobox
            options={categoryOptions}
            value="transport"
            disabled
            placeholder="Selecione a categoria"
            aria-label="Categoria desabilitada"
          />
        </Labeled>
      </div>
    </Demo>
  )
}

function CommandDemo() {
  return (
    <Demo title="Command" description="Lista pesquisável base (aqui fora de popover).">
      <div className="border-border-strong shadow-sh-lg max-w-sm overflow-hidden rounded-md border">
        <Command>
          <CommandInput placeholder="Buscar ação" />
          <CommandList>
            <CommandEmpty>Nenhum resultado encontrado</CommandEmpty>
            <CommandGroup heading="Ações">
              <CommandItem>
                <Icon name="plus" size={18} />
                Nova transação
                <CommandShortcut>N</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <Icon name="download" size={18} />
                Exportar extrato
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Contas">
              <CommandItem data-checked="true">
                <Icon name="wallet" size={18} />
                Conta corrente
              </CommandItem>
              <CommandItem>
                <Icon name="piggy-bank" size={18} />
                Poupança
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </Demo>
  )
}

function MenuDemo() {
  const [showArchived, setShowArchived] = useState(true)
  const [order, setOrder] = useState('date')
  return (
    <Demo title="Menu" description="240px, itens de 40px, atalhos em mono; Excluir por último, após o separador.">
      <div className="flex flex-wrap items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton icon="more-horizontal" label="Ações" variant="outline" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Icon name="eye" size={18} />
              Ver detalhes
              <DropdownMenuShortcut>↵</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icon name="pencil" size={18} />
              Editar
              <DropdownMenuShortcut>E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icon name="copy" size={18} />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Icon name="share" size={18} />
                Exportar como
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>
                  <Icon name="file-text" size={18} />
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Icon name="table" size={18} />
                  Planilha
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem variant="muted">
              <Icon name="folder" size={18} />
              Arquivar
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Icon name="lock" size={18} />
              Bloquear (desabilitado)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <Icon name="trash" size={18} />
              Excluir transação
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button iconRight="chevron-down">Exibir</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={order} onValueChange={setOrder}>
              <DropdownMenuRadioItem value="date">Data</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="amount">Valor</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuCheckboxItem checked={showArchived} onCheckedChange={v => setShowArchived(v === true)}>
                Mostrar arquivadas
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Demo>
  )
}

function PopoverTooltipDemo() {
  return (
    <Demo title="Popover e Tooltip" description="Popover abre por clique (com seta); tooltip em inverse após 500ms.">
      <div className="flex flex-wrap items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button icon="info">Como calculamos</Button>
          </PopoverTrigger>
          <PopoverContent arrow>
            <PopoverHeader>
              <PopoverTitle>Saldo previsto</PopoverTitle>
              <PopoverDescription>
                Saldo atual somado às receitas e subtraído das despesas pendentes até o fim do mês.
              </PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button>Sem seta</Button>
          </PopoverTrigger>
          <PopoverContent align="end">
            <PopoverTitle>Conteúdo rico</PopoverTitle>
            <PopoverDescription>Mini-formulários e explicações de até 300px.</PopoverDescription>
          </PopoverContent>
        </Popover>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <IconButton icon="refresh" label="Sincronizar agora" variant="outline" title={undefined} />
            </TooltipTrigger>
            <TooltipContent>Sincronizar agora</TooltipContent>
          </Tooltip>
          <Tooltip open>
            <TooltipTrigger asChild>
              <IconButton icon="copy" label="Copiar link" variant="outline" title={undefined} />
            </TooltipTrigger>
            <TooltipContent side="bottom">Copiar link</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </Demo>
  )
}

function DateDemo() {
  const today = startOfDay(new Date())
  const [date, setDate] = useState<Date | undefined>(today)
  const [emptyDate, setEmptyDate] = useState<Date | undefined>()
  const [navDate, setNavDate] = useState<Date | undefined>(today)
  const [range, setRange] = useState<DateRangeValue>({ from: subDays(today, 6), to: today })
  const [emptyRange, setEmptyRange] = useState<DateRangeValue>({})
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(addDays(today, 2))
  return (
    <Demo title="Datas" description="DateField e DateRangeField com calendário próprio (ptBR, dd/MM/yyyy).">
      <div className="grid gap-4 sm:grid-cols-2">
        <Labeled label="Data">
          <DatePicker date={date} onSelect={setDate} />
        </Labeled>
        <Labeled label="Vazio">
          <DatePicker date={emptyDate} onSelect={setEmptyDate} placeholder="Selecione uma data" />
        </Labeled>
        <Labeled label="Com navegação por dia">
          <DatePicker date={navDate} onSelect={setNavDate} showNavigation />
        </Labeled>
        <Labeled label="Inválido">
          <DatePicker invalid />
        </Labeled>
        <Labeled label="Desabilitado">
          <DatePicker date={today} disabled />
        </Labeled>
        <Labeled label="Período">
          <DateRangeField value={range} onChange={setRange} />
        </Labeled>
        <Labeled label="Período vazio">
          <DateRangeField value={emptyRange} onChange={setEmptyRange} />
        </Labeled>
        <Labeled label="Período inválido">
          <DateRangeField value={{ from: today }} invalid />
        </Labeled>
      </div>
      <div className="flex flex-wrap gap-6">
        <div className="border-border-strong bg-popover shadow-sh-lg w-[296px] rounded-md border p-4">
          <Calendar mode="single" selected={calendarDate} onSelect={setCalendarDate} />
        </div>
        <div className="border-border-strong bg-popover shadow-sh-lg rounded-md border p-4">
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={{ from: subDays(today, 10), to: addDays(today, 4) }}
            defaultMonth={subDays(today, 10)}
            classNames={{ month: 'sm:w-[262px]' }}
          />
        </div>
      </div>
    </Demo>
  )
}

function FilterBarDemo() {
  const [search, setSearch] = useState('')
  const [onlyExpenses, setOnlyExpenses] = useState(true)
  const [category, setCategory] = useState<string | undefined>('Mercado')
  const [tag, setTag] = useState<string | undefined>('Viagem')
  const clearAll = () => {
    setOnlyExpenses(false)
    setCategory(undefined)
    setTag(undefined)
  }
  const count = [onlyExpenses, category, tag].filter(Boolean).length
  return (
    <Demo
      title="FilterBar"
      description="Busca, filtros rápidos, botão Filtros e linha de aplicados (só com ≥ 1 filtro).">
      <FilterBar>
        <FilterBarRow>
          <FilterBarSearch value={search} onValueChange={setSearch} placeholder="Buscar por descrição" />
          <FilterBarQuick selected={onlyExpenses} onClick={() => setOnlyExpenses(v => !v)}>
            Despesas
          </FilterBarQuick>
          {category ? (
            <FilterBarQuick selected onRemove={() => setCategory(undefined)}>
              Categoria: {category}
            </FilterBarQuick>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <FilterBarQuick menu>Categoria</FilterBarQuick>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {['Mercado', 'Transporte', 'Moradia'].map(name => (
                  <DropdownMenuItem key={name} onSelect={() => setCategory(name)}>
                    {name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <FilterBarFiltersButton count={count} />
        </FilterBarRow>
        <FilterBarApplied onClear={clearAll}>
          {onlyExpenses && (
            <FilterBarAppliedChip onRemove={() => setOnlyExpenses(false)}>Tipo: Despesa</FilterBarAppliedChip>
          )}
          {category && (
            <FilterBarAppliedChip onRemove={() => setCategory(undefined)}>Categoria: {category}</FilterBarAppliedChip>
          )}
          {tag && <FilterBarAppliedChip onRemove={() => setTag(undefined)}>Tag: {tag}</FilterBarAppliedChip>}
        </FilterBarApplied>
      </FilterBar>

      <p className="text-muted-foreground text-sm leading-5">Sem filtros aplicados e sem moldura:</p>
      <FilterBar framed={false}>
        <FilterBarRow>
          <FilterBarSearch placeholder="Buscar orçamento" />
          <FilterBarQuick menu>Status</FilterBarQuick>
          <FilterBarFiltersButton />
          <FilterBarEnd>
            <span className="text-muted-foreground text-[13px] leading-5">Ordenar</span>
            <Button iconRight="chevron-down">Mais recentes</Button>
          </FilterBarEnd>
        </FilterBarRow>
        <FilterBarApplied onClear={() => undefined} />
      </FilterBar>
    </Demo>
  )
}

export function SelectionSection() {
  return (
    <div className="grid gap-6">
      <SelectDemo />
      <ComboboxDemo />
      <MenuDemo />
      <PopoverTooltipDemo />
      <CommandDemo />
      <DateDemo />
      <FilterBarDemo />
    </div>
  )
}
