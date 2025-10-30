'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type {
  Budget,
  BudgetFormValues,
  BudgetWithSpending,
  UpdateBudgetFormValues,
} from '@/app/db/schemas/budget-schema'

export interface BudgetSummary {
  totalBudget: number
  totalSpent: number
  totalRemaining: number
  averagePercentage: number
  categoriesCount: number
  categoriesOverBudget: number
  categoriesNearLimit: number
  budgets: BudgetWithSpending[]
}

// Chaves de query para cache
export const budgetKeys = {
  all: ['budgets'] as const,
  lists: () => [...budgetKeys.all, 'list'] as const,
  list: (spaceId: string, month?: string) => [...budgetKeys.lists(), { spaceId, month }] as const,
  withSpending: (spaceId: string, month: string) => [...budgetKeys.all, 'withSpending', spaceId, month] as const,
  summary: (spaceId: string, month: string) => [...budgetKeys.all, 'summary', spaceId, month] as const,
  categories: (spaceId: string, month: string) => [...budgetKeys.all, 'categories', spaceId, month] as const,
  details: () => [...budgetKeys.all, 'detail'] as const,
  detail: (id: string) => [...budgetKeys.details(), id] as const,
}

// Hook para listar orçamentos de um espaço
export function useBudgets(spaceId: string, month?: string) {
  return useQuery({
    queryKey: budgetKeys.list(spaceId, month),
    queryFn: async () => {
      const params = new URLSearchParams({ spaceId })
      if (month) params.append('month', month)

      const response = await fetch(`/api/budgets?${params}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar orçamentos')
      }

      return response.json() as Promise<Budget[]>
    },
    enabled: !!spaceId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para buscar orçamentos com informações de gastos
export function useBudgetsWithSpending(spaceId: string, month: string) {
  return useQuery({
    queryKey: budgetKeys.withSpending(spaceId, month),
    queryFn: async () => {
      const params = new URLSearchParams({ spaceId, month })

      const response = await fetch(`/api/budgets/with-spending?${params}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar orçamentos com gastos')
      }

      return response.json() as Promise<BudgetWithSpending[]>
    },
    enabled: !!spaceId && !!month,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

// Hook para buscar resumo de orçamentos
export function useBudgetSummary(spaceId: string, month: string) {
  return useQuery({
    queryKey: budgetKeys.summary(spaceId, month),
    queryFn: async () => {
      const params = new URLSearchParams({ spaceId, month })

      const response = await fetch(`/api/budgets/summary?${params}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar resumo de orçamentos')
      }

      return response.json() as Promise<BudgetSummary>
    },
    enabled: !!spaceId && !!month,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

// Hook para buscar categorias com orçamento
export function useBudgetCategories(spaceId: string, month: string) {
  return useQuery({
    queryKey: budgetKeys.categories(spaceId, month),
    queryFn: async () => {
      const params = new URLSearchParams({ spaceId, month })

      const response = await fetch(`/api/budgets/categories?${params}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar categorias de orçamento')
      }

      return response.json() as Promise<string[]>
    },
    enabled: !!spaceId && !!month,
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

// Hook para buscar orçamento por ID
export function useBudget(id: string) {
  return useQuery({
    queryKey: budgetKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/budgets/${id}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar orçamento')
      }
      return response.json() as Promise<Budget>
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para criar orçamento
export function useCreateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: BudgetFormValues) => {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao criar orçamento')
      }

      return response.json() as Promise<Budget>
    },
    onSuccess: newBudget => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: budgetKeys.all })
      toast.success('Orçamento criado com sucesso!')
    },
    onError: error => {
      toast.error(error.message || 'Erro ao criar orçamento')
    },
  })
}

// Hook para atualizar orçamento
export function useUpdateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBudgetFormValues }) => {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao atualizar orçamento')
      }

      return response.json() as Promise<Budget>
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: budgetKeys.all })
      toast.success('Orçamento atualizado com sucesso!')
    },
    onError: error => {
      toast.error(error.message || 'Erro ao atualizar orçamento')
    },
  })
}

// Hook para deletar orçamento
export function useDeleteBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao deletar orçamento')
      }

      return { id }
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: budgetKeys.all })
      toast.success('Orçamento deletado com sucesso!')
    },
    onError: error => {
      toast.error(error.message || 'Erro ao deletar orçamento')
    },
  })
}
