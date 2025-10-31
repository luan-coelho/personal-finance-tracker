'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { Tag, TagFormValues } from '@/app/db/schemas/tag-schema'

// Chaves de query para cache
export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  list: (spaceId: string, search?: string) => [...tagKeys.lists(), { spaceId, search }] as const,
  details: () => [...tagKeys.all, 'detail'] as const,
  detail: (id: string) => [...tagKeys.details(), id] as const,
}

// Hook para listar tags
export function useTags(spaceId: string, search?: string) {
  return useQuery({
    queryKey: tagKeys.list(spaceId, search),
    queryFn: async () => {
      const params = new URLSearchParams({ spaceId })
      if (search) params.append('search', search)

      const response = await fetch(`/api/tags?${params}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar tags')
      }

      return response.json() as Promise<Tag[]>
    },
    enabled: !!spaceId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para buscar tag por ID
export function useTag(id: string) {
  return useQuery({
    queryKey: tagKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/tags/${id}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar tag')
      }
      return response.json() as Promise<Tag>
    },
    enabled: !!id,
  })
}

// Hook para criar tag
export function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TagFormValues) => {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar tag')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
      toast.success('Tag criada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook para atualizar tag
export function useUpdateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TagFormValues> }) => {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar tag')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
      toast.success('Tag atualizada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook para deletar tag
export function useDeleteTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao deletar tag')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
      toast.success('Tag deletada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
