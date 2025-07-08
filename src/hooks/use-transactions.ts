'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { Transaction, TransactionFormValues, TransactionType, UpdateTransactionFormValues } from '@/app/db/schemas'

import type { TransactionFilters, TransactionSummary } from '@/services/transaction-service'

// Chaves de query para cache
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters: TransactionFilters, page: number, limit: number) =>
    [...transactionKeys.lists(), { filters, page, limit }] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
  summary: (filters: TransactionFilters) => [...transactionKeys.all, 'summary', filters] as const,
  categories: (spaceId: string) => [...transactionKeys.all, 'categories', spaceId] as const,
  tags: (spaceId: string) => [...transactionKeys.all, 'tags', spaceId] as const,
  categoryChart: (spaceId: string, type?: TransactionType) =>
    [...transactionKeys.all, 'categoryChart', spaceId, type] as const,
  monthlyChart: (spaceId: string, year: number) => [...transactionKeys.all, 'monthlyChart', spaceId, year] as const,
}

// Hook para listar transações
export function useTransactions(filters: TransactionFilters = {}, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: transactionKeys.list(filters, page, limit),
    queryFn: async () => {
      const params = new URLSearchParams()

      if (filters.spaceId) params.append('spaceId', filters.spaceId)
      if (filters.userId) params.append('userId', filters.userId)
      if (filters.type) params.append('type', filters.type)
      if (filters.category) params.append('category', filters.category)
      if (filters.tags) params.append('tags', filters.tags.join(','))
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString())
      if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString())
      if (filters.search) params.append('search', filters.search)

      params.append('page', page.toString())
      params.append('limit', limit.toString())

      const response = await fetch(`/api/transactions?${params}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar transações')
      }

      return response.json() as Promise<{ transactions: Transaction[]; total: number }>
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para buscar transação por ID
export function useTransaction(id: string) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/transactions/${id}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar transação')
      }
      return response.json() as Promise<Transaction>
    },
    enabled: !!id,
  })
}

// Hook para resumo financeiro
export function useTransactionSummary(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: transactionKeys.summary(filters),
    queryFn: async () => {
      const params = new URLSearchParams()

      if (filters.spaceId) params.append('spaceId', filters.spaceId)
      if (filters.userId) params.append('userId', filters.userId)
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString())
      if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString())

      const response = await fetch(`/api/transactions/summary?${params}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar resumo')
      }

      return response.json() as Promise<TransactionSummary>
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para categorias
export function useTransactionCategories(spaceId: string) {
  return useQuery({
    queryKey: transactionKeys.categories(spaceId),
    queryFn: async () => {
      const response = await fetch(`/api/transactions/categories?spaceId=${spaceId}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar categorias')
      }
      return response.json() as Promise<string[]>
    },
    enabled: !!spaceId,
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

// Hook para tags
export function useTransactionTags(spaceId: string) {
  return useQuery({
    queryKey: transactionKeys.tags(spaceId),
    queryFn: async () => {
      const response = await fetch(`/api/transactions/tags?spaceId=${spaceId}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar tags')
      }
      return response.json() as Promise<string[]>
    },
    enabled: !!spaceId,
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

// Hook para gráfico de categorias
export function useTransactionCategoryChart(spaceId: string, type?: TransactionType) {
  return useQuery({
    queryKey: transactionKeys.categoryChart(spaceId, type),
    queryFn: async () => {
      const params = new URLSearchParams({ spaceId })
      if (type) params.append('type', type)

      const response = await fetch(`/api/transactions/charts/categories?${params}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar dados do gráfico')
      }
      return response.json() as Promise<Array<{ category: string; total: number }>>
    },
    enabled: !!spaceId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para gráfico mensal
export function useTransactionMonthlyChart(spaceId: string, year: number) {
  return useQuery({
    queryKey: transactionKeys.monthlyChart(spaceId, year),
    queryFn: async () => {
      const params = new URLSearchParams({
        spaceId,
        year: year.toString(),
      })

      const response = await fetch(`/api/transactions/charts/monthly?${params}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar dados do gráfico')
      }
      return response.json() as Promise<Array<{ month: string; entradas: number; saidas: number }>>
    },
    enabled: !!spaceId && !!year,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para criar transação
export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TransactionFormValues) => {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao criar transação')
      }

      return response.json() as Promise<Transaction>
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      toast.success('Transação criada com sucesso!')
    },
    onError: error => {
      toast.error(error.message || 'Erro ao criar transação')
    },
  })
}

// Hook para atualizar transação
export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTransactionFormValues }) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao atualizar transação')
      }

      return response.json() as Promise<Transaction>
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      toast.success('Transação atualizada com sucesso!')
    },
    onError: error => {
      toast.error(error.message || 'Erro ao atualizar transação')
    },
  })
}

// Hook para deletar transação
export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao deletar transação')
      }

      return { id }
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      toast.success('Transação deletada com sucesso!')
    },
    onError: error => {
      toast.error(error.message || 'Erro ao deletar transação')
    },
  })
}
