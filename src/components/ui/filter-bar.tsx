'use client'

/**
 * Radar FilterBar (`.sst-filterbar*`, padrões FilterBar e FilterHeader): barra de busca
 * e filtros de listagem. Uma por tela, colada ao topo da tabela ou lista.
 *
 * Anatomia e API (composável):
 *
 * ```tsx
 * <FilterBar>                                     // contêiner: `bg`, borda `border-subtle`, raio 16, padding 16
 *   <FilterBarRow>                                // 1ª linha: quebra em telas estreitas, gap 8
 *     <FilterBarSearch                            // cápsula 40×280 com ícone `search` (largura total no mobile)
 *       value={search}
 *       onValueChange={setSearch}
 *       placeholder="Buscar por descrição"
 *     />
 *     <FilterBarQuick selected={type === 'expense'} onClick={toggleExpense}>Despesas</FilterBarQuick>
 *     <FilterBarQuick selected onRemove={clearCategory}>Categoria: Mercado</FilterBarQuick>
 *     <DropdownMenu>
 *       <DropdownMenuTrigger asChild>
 *         <FilterBarQuick menu>Período</FilterBarQuick> // seta `chevron-down`: abre um menu/popover
 *       </DropdownMenuTrigger>
 *       ...
 *     </DropdownMenu>
 *     <SheetTrigger asChild>
 *       <FilterBarFiltersButton count={activeCount} /> // "Filtros" ou "Filtros · 3" (primary-soft), por último
 *     </SheetTrigger>
 *     <FilterBarEnd>...</FilterBarEnd>            // opcional: encostado à direita (ordenação)
 *   </FilterBarRow>
 *   <FilterBarApplied onClear={clearAll}>         // 2ª linha: só aparece com >= 1 filho
 *     <FilterBarAppliedChip onRemove={() => setType(undefined)}>Tipo: Despesa</FilterBarAppliedChip>
 *     <FilterBarAppliedChip onRemove={clearTag}>Tag: Viagem</FilterBarAppliedChip>
 *   </FilterBarApplied>
 * </FilterBar>
 * ```
 *
 * - `FilterBar`: `framed` (padrão `true`) desenha o contêiner; `false` quando a barra senta
 *   direto num cabeçalho ou card.
 * - `FilterBarSearch`: props de `<input>` + `onValueChange(value)`; `className` vai para a cápsula.
 * - `FilterBarQuick`: `Chip` de 40px. `selected` = filtro ativo (`primary-soft` + borda `primary`);
 *   `onRemove` mostra o ×; `menu` mostra a seta. No máximo quatro; o resto vai para o Sheet.
 * - `FilterBarFiltersButton`: `Button` outline com ícone `sliders`; `count` > 0 vira "Filtros · N"
 *   em `primary-soft`. O Sheet de filtros avançados fica por conta da tela.
 * - `FilterBarApplied`: contagem "N filtros aplicados" (`countLabel` troca o texto), chips e o
 *   botão ghost "Limpar filtros" (`clearLabel`) à direita quando há `onClear`. Retorna `null`
 *   sem filhos, então a linha nunca aparece vazia.
 * - `FilterBarAppliedChip`: `Chip` removível de 28px. Diga campo e valor ("Categoria: Mercado").
 */

import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { Icon } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

function FilterBar({ className, framed = true, ...props }: React.ComponentProps<'div'> & { framed?: boolean }) {
  return (
    <div
      data-slot="filter-bar"
      data-framed={framed || undefined}
      className={cn(
        'flex min-w-0 flex-col gap-2.5',
        framed && 'border-border bg-background rounded-[16px] border p-4',
        className,
      )}
      {...props}
    />
  )
}

function FilterBarRow({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="filter-bar-row" className={cn('flex min-w-0 flex-wrap items-center gap-2', className)} {...props} />
  )
}

/**
 * Faixa de filtros rápidos. A partir de `sm` não existe (`contents`): os chips seguem a linha.
 * Abaixo de `sm` (Radar `size="mobile"`) é uma faixa que rola na horizontal sem quebrar linha,
 * com o botão "Filtros" fixo na ponta direita, sempre alcançável.
 */
function FilterBarChips({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="filter-bar-chips"
      className={cn(
        'sm:contents',
        'max-sm:w-[calc(100%+--spacing(8))] max-sm:-mx-4 max-sm:flex max-sm:[scrollbar-width:none] max-sm:items-center max-sm:gap-2 max-sm:overflow-x-auto max-sm:px-4 max-sm:*:shrink-0 max-sm:[&::-webkit-scrollbar]:hidden',
        'max-sm:[&>[data-slot=filter-bar-filters]]:sticky max-sm:[&>[data-slot=filter-bar-filters]]:right-0 max-sm:[&>[data-slot=filter-bar-filters]]:ml-auto max-sm:[&>[data-slot=filter-bar-filters]]:shadow-[-12px_0_12px_-4px_var(--bg)]',
        className,
      )}
      {...props}
    />
  )
}

function FilterBarSearch({
  className,
  onChange,
  onValueChange,
  placeholder = 'Buscar',
  'aria-label': ariaLabel,
  ...props
}: Omit<React.ComponentProps<'input'>, 'type'> & {
  onValueChange?: (value: string) => void
}) {
  return (
    <label
      data-slot="filter-bar-search"
      className={cn(
        'h-control-md border-input bg-card text-muted-foreground flex w-full shrink-0 cursor-text items-center gap-2.5 rounded-full border px-3.5 transition-[border-color,box-shadow] duration-[120ms] max-lg:text-base sm:w-[280px]',
        'hover:border-border-strong focus-within:border-primary focus-within:text-foreground focus-within:shadow-focus-ring',
        className,
      )}>
      <Icon name="search" size={18} />
      <input
        type="search"
        aria-label={ariaLabel ?? placeholder}
        placeholder={placeholder}
        className="text-foreground placeholder:text-muted-foreground h-full min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-sm leading-5 outline-none [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
        onChange={event => {
          onChange?.(event)
          onValueChange?.(event.target.value)
        }}
        {...props}
      />
    </label>
  )
}

function FilterBarQuick({
  className,
  children,
  menu = false,
  onRemove,
  ...props
}: Omit<React.ComponentProps<typeof Chip>, 'size' | 'iconRight'> & {
  /** Mostra a seta `chevron-down` (o chip abre um menu ou popover). Ignorado com `onRemove`. */
  menu?: boolean
}) {
  return (
    <Chip
      data-slot="filter-bar-quick"
      size="lg"
      onRemove={onRemove}
      iconRight={menu && !onRemove ? 'chevron-down' : undefined}
      className={cn(menu && !onRemove && '[&>svg:last-child]:text-muted-foreground', className)}
      {...props}>
      {children}
    </Chip>
  )
}

function FilterBarFiltersButton({
  className,
  count = 0,
  label = 'Filtros',
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'children'> & {
  /** Filtros aplicados; > 0 mostra "Filtros · N" em `primary-soft` com borda `primary`. */
  count?: number
  label?: string
}) {
  const active = count > 0
  return (
    <Button
      data-slot="filter-bar-filters"
      data-active={active || undefined}
      variant="outline"
      icon="sliders"
      className={cn(
        active &&
          'border-primary bg-primary-soft text-primary-soft-fg hover:border-primary hover:bg-primary-soft hover:text-primary-soft-fg',
        className,
      )}
      {...props}>
      {active ? `${label} · ${count}` : label}
    </Button>
  )
}

function FilterBarEnd({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="filter-bar-end" className={cn('ml-auto flex items-center gap-2', className)} {...props} />
}

function FilterBarApplied({
  className,
  children,
  onClear,
  clearLabel = 'Limpar filtros',
  countLabel,
  ...props
}: React.ComponentProps<'div'> & {
  /** Liga o botão "Limpar filtros", que remove todos (inclusive os rápidos). */
  onClear?: () => void
  clearLabel?: string
  /** Troca o texto "N filtros aplicados"; `false` esconde a contagem. */
  countLabel?: string | false
}) {
  const count = React.Children.toArray(children).filter(Boolean).length
  if (count === 0) return null

  const label = countLabel ?? (count === 1 ? '1 filtro aplicado' : `${count} filtros aplicados`)

  return (
    <div
      data-slot="filter-bar-applied"
      className={cn('border-border flex min-w-0 flex-wrap items-center gap-2 border-t pt-2.5', className)}
      {...props}>
      {label !== false && <span className="text-muted-foreground text-[13px] leading-5">{label}</span>}
      {children}
      {onClear && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground ml-auto px-3"
          onClick={onClear}>
          {clearLabel}
        </Button>
      )}
    </div>
  )
}

function FilterBarAppliedChip({ className, ...props }: Omit<React.ComponentProps<typeof Chip>, 'size'>) {
  return <Chip data-slot="filter-bar-applied-chip" size="sm" className={className} {...props} />
}

export {
  FilterBar,
  FilterBarApplied,
  FilterBarAppliedChip,
  FilterBarChips,
  FilterBarEnd,
  FilterBarFiltersButton,
  FilterBarQuick,
  FilterBarRow,
  FilterBarSearch,
}
