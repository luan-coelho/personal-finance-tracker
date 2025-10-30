'use client'

import { useState } from 'react'

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
  const initial = initialDate || new Date()
  const [selectedMonth, setSelectedMonth] = useState(initial.getMonth())
  const [selectedYear, setSelectedYear] = useState(initial.getFullYear())

  // Criar datas de início e fim do mês selecionado
  const monthStartDate = new Date(selectedYear, selectedMonth, 1)
  const monthEndDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999)

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

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const isCurrentMonth = selectedMonth === currentDate.getMonth() && selectedYear === currentDate.getFullYear()

  // Opções de anos (5 anos para trás e 5 para frente)
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

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
    const now = new Date()
    setSelectedMonth(now.getMonth())
    setSelectedYear(now.getFullYear())
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
