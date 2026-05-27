'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { OrganizationLabel, OrganizationLabelFormValues } from '@/app/db/schemas/organization-label-schema'

import { organizationTaskKeys } from '@/hooks/use-organization-tasks'

async function parseJsonError(response: Response, fallback: string): Promise<Error> {
  try {
    const error = await response.json()
    return new Error(error.error || error.message || fallback)
  } catch {
    return new Error(fallback)
  }
}

// Chaves de query para cache
export const organizationLabelKeys = {
  all: ['organization-labels'] as const,
  lists: () => [...organizationLabelKeys.all, 'list'] as const,
  list: (spaceId: string, search?: string) => [...organizationLabelKeys.lists(), { spaceId, search }] as const,
  details: () => [...organizationLabelKeys.all, 'detail'] as const,
  detail: (id: string, spaceId?: string) => [...organizationLabelKeys.details(), id, spaceId] as const,
}

// Hook para listar etiquetas de organizacao
export function useOrganizationLabels(spaceId: string, search?: string) {
  return useQuery({
    queryKey: organizationLabelKeys.list(spaceId, search),
    queryFn: async () => {
      const params = new URLSearchParams({ spaceId })
      if (search) params.append('search', search)

      const response = await fetch(`/api/organization/labels?${params}`)
      if (!response.ok) {
        throw await parseJsonError(response, 'Erro ao buscar etiquetas')
      }

      return response.json() as Promise<OrganizationLabel[]>
    },
    enabled: !!spaceId,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook para criar etiqueta
export function useCreateOrganizationLabel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: OrganizationLabelFormValues) => {
      const response = await fetch('/api/organization/labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw await parseJsonError(response, 'Erro ao criar etiqueta')
      }

      return response.json() as Promise<OrganizationLabel>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationLabelKeys.all })
      toast.success('Etiqueta criada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook para atualizar etiqueta
export function useUpdateOrganizationLabel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<OrganizationLabelFormValues> }) => {
      const response = await fetch(`/api/organization/labels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw await parseJsonError(response, 'Erro ao atualizar etiqueta')
      }

      return response.json() as Promise<OrganizationLabel>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationLabelKeys.all })
      queryClient.invalidateQueries({ queryKey: organizationTaskKeys.all })
      toast.success('Etiqueta atualizada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook para deletar etiqueta
export function useDeleteOrganizationLabel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/organization/labels/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw await parseJsonError(response, 'Erro ao deletar etiqueta')
      }

      return response.json() as Promise<{ success: boolean }>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationLabelKeys.all })
      queryClient.invalidateQueries({ queryKey: organizationTaskKeys.all })
      toast.success('Etiqueta deletada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
