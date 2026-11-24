'use client'

import * as React from 'react'

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Icon, type IconName } from '@/components/ui/icon'
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { cn } from '@/lib/utils'

/**
 * Radar Combobox (`.sst-combobox*`): campo igual ao Input (44px, raio 10, borda
 * `border`, fundo `card`) que abre uma lista pesquisável em popover (raio 14,
 * `border-strong`, `sh-lg`, itens de 40px). O trecho digitado fica em `primary-text` 600.
 *
 * - Escolha única: `check` em `primary-text` à direita do item escolhido; escolher fecha.
 * - `multiple`: caixa de 18px (raio 5) à esquerda, marcada em `primary`; os escolhidos viram
 *   chips de 30px sobre `muted` dentro do campo (o campo cresce em altura) ou, com
 *   `display="count"`, um resumo "3 selecionados". Itens marcados continuam visíveis ao filtrar.
 *
 * Erro por `aria-invalid` (o `FormControl` já repassa) ou pela prop `invalid`.
 *
 * ```tsx
 * <Combobox options={categories} value={categoryId} onChange={setCategoryId} placeholder="Selecione a categoria" />
 * <Combobox multiple options={tags} value={selectedTags} onChange={setSelectedTags} placeholder="Todas as tags" />
 * ```
 */

export interface ComboboxOption {
  value: string
  label: string
  icon?: IconName
  disabled?: boolean
}

interface ComboboxBaseProps {
  options: ComboboxOption[]
  /** Texto do campo vazio. Padrão: "Selecione". */
  placeholder?: string
  /** Placeholder da busca no topo da lista. Padrão: "Buscar". */
  searchPlaceholder?: string
  /** Texto quando a busca não encontra nada. Padrão: "Nenhum resultado encontrado". */
  emptyText?: string
  disabled?: boolean
  /** Borda e anel na família error (equivale a `aria-invalid`). */
  invalid?: boolean
  /** Popover controlado. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Classe do campo. */
  className?: string
  /** Classe do painel da lista (largura padrão: a do campo, mínimo 240px). */
  contentClassName?: string
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: React.AriaAttributes['aria-invalid']
}

export interface ComboboxSingleProps extends ComboboxBaseProps {
  multiple?: false
  value?: string
  onChange?: (value: string) => void
}

export interface ComboboxMultipleProps extends ComboboxBaseProps {
  multiple: true
  value?: string[]
  onChange?: (value: string[]) => void
  /** `chips` (padrão): chips removíveis dentro do campo. `count`: resumo "N selecionados". */
  display?: 'chips' | 'count'
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps

const fieldClassName = cn(
  'group/combobox rounded-control border-input bg-card text-foreground relative flex w-full min-w-0 cursor-pointer items-center border text-left text-sm leading-5 transition-[border-color,box-shadow] duration-[120ms] outline-none',
  'hover:border-border-strong',
  'focus-visible:border-primary focus-visible:shadow-focus-ring has-[[data-slot=combobox-trigger]:focus-visible]:border-primary has-[[data-slot=combobox-trigger]:focus-visible]:shadow-focus-ring',
  'data-[state=open]:border-primary data-[state=open]:shadow-focus-ring',
  'data-invalid:border-error data-invalid:focus-visible:border-error data-invalid:data-[state=open]:border-error data-invalid:has-[[data-slot=combobox-trigger]:focus-visible]:border-error',
  'data-invalid:focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--error)_25%,transparent)] data-invalid:has-[[data-slot=combobox-trigger]:focus-visible]:shadow-[0_0_0_3px_color-mix(in_srgb,var(--error)_25%,transparent)] data-invalid:data-[state=open]:shadow-[0_0_0_3px_color-mix(in_srgb,var(--error)_25%,transparent)]',
  'data-disabled:border-border data-disabled:bg-muted data-disabled:text-muted-foreground data-disabled:hover:border-border data-disabled:cursor-not-allowed',
)

function normalize(value: string) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function highlightMatch(label: string, query: string) {
  const q = query.trim()
  if (!q) return label
  const index = normalize(label).indexOf(normalize(q))
  if (index < 0) return label
  return (
    <>
      {label.slice(0, index)}
      <mark className="text-primary-text bg-transparent font-semibold">{label.slice(index, index + q.length)}</mark>
      {label.slice(index + q.length)}
    </>
  )
}

function filterByLabel(_value: string, search: string, keywords?: string[]) {
  return normalize((keywords ?? []).join(' ')).includes(normalize(search.trim())) ? 1 : 0
}

export function Combobox(props: ComboboxProps) {
  const {
    options,
    placeholder = 'Selecione',
    searchPlaceholder = 'Buscar',
    emptyText = 'Nenhum resultado encontrado',
    disabled = false,
    invalid,
    open: openProp,
    onOpenChange,
    className,
    contentClassName,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
  } = props

  const [openState, setOpenState] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const anchorRef = React.useRef<HTMLDivElement>(null)
  const open = openProp ?? openState

  const setOpen = (next: boolean) => {
    if (disabled && next) return
    if (!next) setQuery('')
    setOpenState(next)
    onOpenChange?.(next)
  }

  const selectedValues = props.multiple ? (props.value ?? []) : props.value ? [props.value] : []
  const selectedOptions = selectedValues
    .map(value => options.find(option => option.value === value))
    .filter((option): option is ComboboxOption => option !== undefined)
  const isInvalid = Boolean(invalid || (ariaInvalid && ariaInvalid !== 'false'))
  const showChips = props.multiple && props.display !== 'count'

  const toggle = (value: string) => {
    if (props.multiple) {
      const current = props.value ?? []
      props.onChange?.(current.includes(value) ? current.filter(v => v !== value) : [...current, value])
      return
    }
    props.onChange?.(value)
    setOpen(false)
  }

  const remove = (value: string) => {
    if (props.multiple) props.onChange?.((props.value ?? []).filter(v => v !== value))
  }

  const triggerA11y = {
    id,
    role: 'combobox' as const,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': isInvalid || undefined,
    disabled,
  }

  const chevron = (
    <Icon
      name="chevron-down"
      size={18}
      className="text-muted-foreground ml-auto transition-transform duration-[120ms] group-data-[state=open]/combobox:rotate-180"
    />
  )

  const summary = () => {
    if (selectedOptions.length === 0)
      return <span className="text-muted-foreground min-w-0 flex-1 truncate">{placeholder}</span>
    if (!props.multiple || selectedOptions.length === 1) {
      const option = selectedOptions[0]
      return (
        <span className="flex min-w-0 flex-1 items-center gap-2.5">
          {option.icon && <Icon name={option.icon} size={18} className="text-muted-foreground" />}
          <span className="truncate">{option.label}</span>
        </span>
      )
    }
    return <span className="min-w-0 flex-1 truncate">{selectedOptions.length} selecionados</span>
  }

  const field = showChips ? (
    <PopoverAnchor asChild>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: o teclado usa o botão interno; o clique no campo só amplia a área de toque. */}
      <div
        ref={anchorRef}
        data-slot="combobox"
        data-state={open ? 'open' : 'closed'}
        data-invalid={isInvalid || undefined}
        data-disabled={disabled || undefined}
        className={cn(fieldClassName, 'min-h-control-lg flex-wrap gap-1.5 py-[5px] pr-3.5 pl-1.5', className)}
        onClick={event => {
          if ((event.target as Element).closest('[data-slot=combobox-trigger],[data-slot=combobox-chip-remove]')) return
          setOpen(true)
        }}>
        {selectedOptions.map(option => (
          <span
            key={option.value}
            data-slot="combobox-chip"
            className="bg-muted text-foreground inline-flex h-[30px] max-w-full items-center gap-1 rounded-full pr-1.5 pl-2.5 text-[13px] leading-4 font-medium whitespace-nowrap">
            <span className="truncate">{option.label}</span>
            <button
              type="button"
              data-slot="combobox-chip-remove"
              aria-label={`Remover ${option.label}`}
              disabled={disabled}
              className="focus-visible:shadow-focus-ring inline-flex size-[18px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent p-0 text-inherit outline-none disabled:cursor-not-allowed"
              onClick={() => remove(option.value)}>
              <Icon name="x" size={14} />
            </button>
          </span>
        ))}
        <PopoverTrigger asChild>
          <button
            type="button"
            data-slot="combobox-trigger"
            className={cn(
              'flex h-[30px] min-w-12 flex-1 cursor-pointer items-center gap-2 bg-transparent p-0 text-left outline-none disabled:cursor-not-allowed',
              selectedOptions.length === 0 && 'pl-2',
            )}
            {...triggerA11y}>
            {selectedOptions.length === 0 && (
              <span className="text-muted-foreground min-w-0 flex-1 truncate">{placeholder}</span>
            )}
            {chevron}
          </button>
        </PopoverTrigger>
      </div>
    </PopoverAnchor>
  ) : (
    <PopoverAnchor asChild>
      <div ref={anchorRef} className="w-full min-w-0">
        <PopoverTrigger asChild>
          <button
            type="button"
            data-slot="combobox"
            data-invalid={isInvalid || undefined}
            data-disabled={disabled || undefined}
            className={cn(fieldClassName, 'h-control-lg gap-2.5 px-3.5', className)}
            {...triggerA11y}>
            {summary()}
            {chevron}
          </button>
        </PopoverTrigger>
      </div>
    </PopoverAnchor>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {field}
      <PopoverContent
        align="start"
        sideOffset={2}
        className={cn('w-(--radix-popover-trigger-width) min-w-60 gap-0 overflow-hidden p-0', contentClassName)}
        onInteractOutside={event => {
          if (anchorRef.current?.contains(event.target as Node)) event.preventDefault()
        }}>
        <Command filter={filterByLabel}>
          <CommandInput placeholder={searchPlaceholder} value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map(option => {
                const checked = selectedValues.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    keywords={[option.label]}
                    disabled={option.disabled}
                    forceMount={props.multiple && checked ? true : undefined}
                    data-checked={!props.multiple && checked ? 'true' : undefined}
                    onSelect={() => toggle(option.value)}>
                    {props.multiple && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          'border-border-strong inline-flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px]',
                          checked && 'bg-primary border-0',
                        )}>
                        {checked && (
                          <Icon name="check" size={14} strokeWidth={2} className="text-primary-foreground!" />
                        )}
                      </span>
                    )}
                    {option.icon && <Icon name={option.icon} size={18} />}
                    <span className="min-w-0 flex-1 truncate">{highlightMatch(option.label, query)}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
