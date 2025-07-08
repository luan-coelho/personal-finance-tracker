'use client'

import { Check, ChevronsUpDown, X } from 'lucide-react'
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { cn } from '@/lib/utils'

export interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
  maxItems?: number
}

export function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Selecione itens...',
  searchPlaceholder = 'Buscar...',
  emptyText = 'Nenhum item encontrado.',
  className,
  disabled = false,
  maxItems,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')

  const selectedOptions = options.filter(option => value.includes(option.value))

  const handleSelect = (currentValue: string) => {
    const newValue = value.includes(currentValue) ? value.filter(v => v !== currentValue) : [...value, currentValue]

    onValueChange(newValue)
  }

  const handleRemove = (valueToRemove: string) => {
    onValueChange(value.filter(v => v !== valueToRemove))
  }

  const filteredOptions = options.filter(option => option.label.toLowerCase().includes(searchValue.toLowerCase()))

  const canAddMore = !maxItems || value.length < maxItems

  return (
    <div className={cn('space-y-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'h-auto min-h-10 w-full justify-between rounded-sm',
              !selectedOptions.length && 'text-muted-foreground',
              'border-zinc-300',
            )}
            disabled={disabled}>
            <div className="flex flex-1 flex-wrap gap-1">
              {selectedOptions.length > 0 ? (
                selectedOptions.map(option => (
                  <Badge key={option.value} variant="secondary" className="text-xs">
                    {option.label}
                  </Badge>
                ))
              ) : (
                <span>{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput placeholder={searchPlaceholder} value={searchValue} onValueChange={setSearchValue} />
            <CommandList>
              <CommandGroup>
                {filteredOptions.map(option => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={handleSelect}
                    disabled={!canAddMore && !value.includes(option.value)}>
                    <Check className={cn('mr-2 h-4 w-4', value.includes(option.value) ? 'opacity-100' : 'opacity-0')} />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>

              {filteredOptions.length === 0 && <CommandEmpty>{emptyText}</CommandEmpty>}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected items with remove buttons */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedOptions.map(option => (
            <Badge key={option.value} variant="secondary" className="pr-1 text-xs">
              {option.label}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 hover:bg-transparent"
                onClick={() => handleRemove(option.value)}
                disabled={disabled}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
