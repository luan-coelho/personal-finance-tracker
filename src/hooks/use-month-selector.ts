'use client'

import { useState } from 'react'

import { getBrazilCurrentYearMonth, getMonthRangeBrazil } from '@/lib/date-utils'

export interface MonthSelectorState {
  selectedMonth: number
  selectedYear: number
  monthStartDate: Date
  monthEndDate: Date
}

export interface MonthSelectorActions {
  setMonth: (month: number) => void
  setYear: (year: number) => void
  goToPreviousMonth: () => void
  goToNextMonth: () => void
  goToCurrentMonth: () => void
  goToDate: (date: Date) => void
}

export interface UseMonthSelectorReturn extends MonthSelectorState, MonthSelectorActions {
  monthName: string
  isCurrentMonth: boolean
  yearOptions: number[]
  monthNames: string[]
}

export function useMonthSelector(initialDate?: Date): UseMonthSelectorReturn {
  // Usa o timezone brasileiro para determinar o mês/ano inicial
  const brazilNow = getBrazilCurrentYearMonth()
  const initial = initialDate ? { year: initialDate.getFullYear(), month: initialDate.getMonth() } : brazilNow

  const [selectedMonth, setSelectedMonth] = useState(initial.month)
  const [selectedYear, setSelectedYear] = useState(initial.year)

  // Criar datas de início e fim do mês selecionado usando timezone brasileiro
  const monthRange = getMonthRangeBrazil(selectedYear, selectedMonth)
  const monthStartDate = monthRange.start
  const monthEndDate = monthRange.end

  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ]

  // Usa o timezone brasileiro para verificar se é o mês atual
  const currentBrazil = getBrazilCurrentYearMonth()
  const isCurrentMonth = selectedMonth === currentBrazil.month && selectedYear === currentBrazil.year

  // Opções de anos (5 anos para trás e 5 para frente)
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentBrazil.year - 5 + i)

  const setMonth = (month: number) => {
    if (month >= 0 && month <= 11) {
      setSelectedMonth(month)
    }
  }

  const setYear = (year: number) => {
    setSelectedYear(year)
  }

  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  const goToCurrentMonth = () => {
    const now = getBrazilCurrentYearMonth()
    setSelectedMonth(now.month)
    setSelectedYear(now.year)
  }

  const goToDate = (date: Date) => {
    setSelectedMonth(date.getMonth())
    setSelectedYear(date.getFullYear())
  }

  return {
    // State
    selectedMonth,
    selectedYear,
    monthStartDate,
    monthEndDate,

    // Computed values
    monthName: monthNames[selectedMonth],
    isCurrentMonth,
    yearOptions,
    monthNames,

    // Actions
    setMonth,
    setYear,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    goToDate,
  }
}
