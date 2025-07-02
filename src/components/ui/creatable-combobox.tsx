'use client'

import { AlertCircle, Check, ChevronsUpDown, Plus } from 'lucide-react'
import * as React from 'react'
import { FieldError } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { cn } from '@/lib/utils'

export interface CreatableComboboxOption {
  value: string
  label: string
}

interface CreatableComboboxProps {
  options: CreatableComboboxOption[]
  value?: string
  onValueChange: (value: string) => void
  onCreate?: (name: string) => Promise<string> // Retorna o ID do novo item criado
  validate?: (name: string) => boolean // Função para validar se o nome é válido para criação
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  createText?: string
  className?: string
  disabled?: boolean
  isCreating?: boolean
  showValidationIcon?: boolean
  error?: FieldError
}

export function CreatableCombobox({
  options,
  value,
  onValueChange,
  onCreate,
  validate,
  placeholder = 'Selecione uma opção...',
  searchPlaceholder = 'Buscar...',
  emptyText = 'Nenhuma opção encontrada.',
  createText = 'Criar novo',
  className,
  disabled = false,
  isCreating = false,
  showValidationIcon = false,
  error,
}: CreatableComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')

  const selectedOption = options.find(option => option.value === value)
  const hasError = error !== undefined && error !== null
  const showErrorIcon = showValidationIcon && hasError

  // Verificar se o valor de busca corresponde a alguma opção existente
  const exactMatch = options.find(option => option.label.toLowerCase() === searchValue.toLowerCase())

  // Verificar se o valor é válido para criação
  const isValidForCreation = validate ? validate(searchValue.trim()) : searchValue.trim().length >= 3

  const handleCreate = async () => {
    if (!onCreate || !searchValue.trim() || exactMatch || !isValidForCreation) return

    try {
      const newId = await onCreate(searchValue.trim())
      onValueChange(newId)
      setOpen(false)
      setSearchValue('')
    } catch (error) {
      console.error('Erro ao criar novo item:', error)
    }
  }

  const handleSelect = (currentValue: string) => {
    onValueChange(currentValue === value ? '' : currentValue)
    setOpen(false)
  }

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'h-10 w-full justify-between rounded-sm',
              !selectedOption && 'text-muted-foreground',
              hasError ? 'border-destructive' : 'border-zinc-300',
              showErrorIcon ? 'pr-10' : '',
              className,
            )}
            disabled={disabled}>
            {selectedOption ? selectedOption.label : placeholder}
            {!showErrorIcon && <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput placeholder={searchPlaceholder} value={searchValue} onValueChange={setSearchValue} />
            <CommandList>
              {/* Opções existentes filtradas */}
              <CommandGroup>
                {options
                  .filter(option => option.label.toLowerCase().includes(searchValue.toLowerCase()))
                  .map(option => (
                    <CommandItem key={option.value} value={option.value} onSelect={handleSelect}>
                      <Check className={cn('mr-2 h-4 w-4', value === option.value ? 'opacity-100' : 'opacity-0')} />
                      {option.label}
                    </CommandItem>
                  ))}
              </CommandGroup>

              {/* Opção para criar novo item - só aparece se for válido */}
              {onCreate && searchValue.trim() && !exactMatch && isValidForCreation && (
                <CommandGroup>
                  <CommandItem onSelect={handleCreate} disabled={isCreating} className="text-primary">
                    <Plus className="mr-2 h-4 w-4" />
                    {isCreating ? 'Criando...' : `${createText} "${searchValue.trim()}"`}
                  </CommandItem>
                </CommandGroup>
              )}

              {/* Mensagem quando não há opções */}
              {options.filter(option => option.label.toLowerCase().includes(searchValue.toLowerCase())).length === 0 &&
                !searchValue.trim() && <CommandEmpty>{emptyText}</CommandEmpty>}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {showErrorIcon && (
        <div className="absolute inset-y-0 right-3 flex items-center">
          <AlertCircle className="text-destructive size-4" />
        </div>
      )}
    </div>
  )
}
