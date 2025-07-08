'use client'

import { createContext, useContext, useEffect, useState } from 'react'

import { Space } from '@/app/db/schemas/space-schema'

import { useSpaces } from '@/hooks/use-spaces'

interface SpaceContextType {
  selectedSpace: Space | null
  setSelectedSpace: (space: Space | null) => void
  isLoading: boolean
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined)

interface SpaceProviderProps {
  children: React.ReactNode
}

export function SpaceProvider({ children }: SpaceProviderProps) {
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { data: spaces, isLoading: spacesLoading } = useSpaces()

  // Carregar espaço selecionado do localStorage na inicialização
  useEffect(() => {
    if (!spacesLoading && spaces && spaces.length > 0) {
      const savedSpaceId = localStorage.getItem('selectedSpaceId')
      if (savedSpaceId) {
        const savedSpace = spaces.find(space => space.id === savedSpaceId)
        if (savedSpace) {
          setSelectedSpace(savedSpace)
        } else {
          // Se o espaço salvo não existe mais, selecionar o primeiro disponível
          setSelectedSpace(spaces[0])
        }
      } else {
        // Se não há espaço salvo, selecionar o primeiro disponível
        setSelectedSpace(spaces[0])
      }
      setIsLoading(false)
    } else if (!spacesLoading) {
      setIsLoading(false)
    }
  }, [spaces, spacesLoading])

  // Salvar espaço selecionado no localStorage quando mudar
  useEffect(() => {
    if (selectedSpace) {
      localStorage.setItem('selectedSpaceId', selectedSpace.id)
    } else {
      localStorage.removeItem('selectedSpaceId')
    }
  }, [selectedSpace])

  return (
    <SpaceContext.Provider
      value={{
        selectedSpace,
        setSelectedSpace,
        isLoading,
      }}>
      {children}
    </SpaceContext.Provider>
  )
}

export function useSpace() {
  const context = useContext(SpaceContext)
  if (context === undefined) {
    throw new Error('useSpace must be used within a SpaceProvider')
  }
  return context
}
