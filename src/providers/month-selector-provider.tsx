'use client'

import { createContext, ReactNode, useContext } from 'react'

import { useMonthSelector, UseMonthSelectorReturn } from '@/hooks/use-month-selector'

const MonthSelectorContext = createContext<UseMonthSelectorReturn | undefined>(undefined)

export interface MonthSelectorProviderProps {
  children: ReactNode
  initialDate?: Date
}

export function MonthSelectorProvider({ children, initialDate }: MonthSelectorProviderProps) {
  const monthSelector = useMonthSelector(initialDate)

  return <MonthSelectorContext.Provider value={monthSelector}>{children}</MonthSelectorContext.Provider>
}

export function useMonthSelectorContext(): UseMonthSelectorReturn {
  const context = useContext(MonthSelectorContext)

  if (!context) {
    throw new Error('useMonthSelectorContext must be used within a MonthSelectorProvider')
  }

  return context
}
