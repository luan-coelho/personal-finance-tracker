'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { Category, CategoryFormValues, CategoryType } from '@/app/db/schemas/category-schema'

// Chaves de query para cache
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (spaceId: string, type?: CategoryType, search?: string) =>
    [...categoryKeys.lists(), { spaceId, type, search }] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
}

// Hook para listar categorias
export function useCategories(spaceId: string, type?: CategoryType, search?: string) {
  return useQuery({
    queryKey: categoryKeys.list(spaceId, type, search),
    queryFn: async () => {
      const params = new URLSearchParams({ spaceId })
      if (type) params.append('type', type)
      if (search) params.append('search', search)

      const response = await fetch(`/api/categories?${params}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar categorias')
      }

      return response.json() as Promise<Category[]>
    },
    enabled: !!spaceId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para buscar categoria por ID
export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/categories/${id}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar categoria')
      }
      return response.json() as Promise<Category>
    },
    enabled: !!id,
  })
}

// Hook para criar categoria
export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar categoria')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      toast.success('Categoria criada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook para atualizar categoria
export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CategoryFormValues> }) => {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar categoria')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      toast.success('Categoria atualizada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook para deletar categoria
export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao deletar categoria')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      toast.success('Categoria deletada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
