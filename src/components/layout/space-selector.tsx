'use client'

import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useSpaces } from '@/hooks/use-spaces'

import { routes } from '@/lib/routes'
import { cn } from '@/lib/utils'

export function SpaceSelector() {
  const [open, setOpen] = useState(false)
  const { selectedSpace, setSelectedSpace, isLoading: spaceLoading } = useSelectedSpace()
  const { data: spaces, isLoading: spacesLoading } = useSpaces()

  const isLoading = spaceLoading || spacesLoading

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-muted h-4 w-32 animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
            size="sm">
            {selectedSpace ? (
              <span className="truncate">{selectedSpace.name}</span>
            ) : (
              <span className="text-muted-foreground">Selecionar espaço...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar espaço..." className="h-9" />
            <CommandList>
              <CommandEmpty>
                <div className="py-2 text-center">
                  <p className="text-muted-foreground mb-2 text-sm">Nenhum espaço encontrado</p>
                  <Button asChild size="sm" variant="outline" className="h-8">
                    <Link href={routes.frontend.admin.spaces.create}>
                      <Plus className="mr-2 h-4 w-4" />
                      Criar espaço
                    </Link>
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {spaces?.map(space => (
                  <CommandItem
                    key={space.id}
                    value={space.name}
                    onSelect={() => {
                      setSelectedSpace(space.id === selectedSpace?.id ? null : space)
                      setOpen(false)
                    }}>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-medium">{space.name}</span>
                      {space.description && (
                        <span className="text-muted-foreground truncate text-xs">{space.description}</span>
                      )}
                    </div>
                    <Check
                      className={cn(
                        'ml-2 h-4 w-4 shrink-0',
                        selectedSpace?.id === space.id ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
              {spaces && spaces.length > 0 && (
                <CommandGroup>
                  <CommandItem asChild>
                    <Link
                      href={routes.frontend.admin.spaces.create}
                      className="flex items-center justify-center py-2 text-sm"
                      onClick={() => setOpen(false)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Criar novo espaço
                    </Link>
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
