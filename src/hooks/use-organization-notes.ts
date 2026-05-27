'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type {
  OrganizationNote,
  OrganizationNoteFormValues,
  UpdateOrganizationNoteFormValues,
} from '@/app/db/schemas/organization-note-schema'

import type { OrganizationNoteFilters } from '@/services/organization-note-service'

type OrganizationNoteQueryFilters = Omit<OrganizationNoteFilters, 'userId' | 'includeArchived'>
type CreateOrganizationNoteValues = Omit<OrganizationNoteFormValues, 'createdById'>
type UpdateOrganizationNoteValues = Omit<UpdateOrganizationNoteFormValues, 'id' | 'createdById'>

async function parseJsonError(response: Response, fallback: string): Promise<Error> {
  try {
    const error = await response.json()
    return new Error(error.error || error.message || fallback)
  } catch {
    return new Error(fallback)
  }
}

function appendNoteFilters(params: URLSearchParams, filters: OrganizationNoteQueryFilters) {
  if (filters.spaceId) params.append('spaceId', filters.spaceId)
  if (filters.projectId) params.append('projectId', filters.projectId)
  if (filters.taskId) params.append('taskId', filters.taskId)
  if (filters.search) params.append('search', filters.search)
}

// Chaves de query para cache
export const organizationNoteKeys = {
  all: ['organization-notes'] as const,
  lists: () => [...organizationNoteKeys.all, 'list'] as const,
  list: (filters: OrganizationNoteQueryFilters) => [...organizationNoteKeys.lists(), filters] as const,
  details: () => [...organizationNoteKeys.all, 'detail'] as const,
  detail: (id: string, spaceId?: string) => [...organizationNoteKeys.details(), id, spaceId] as const,
}

// Hook para listar notas de organizacao
export function useOrganizationNotes(filters: OrganizationNoteQueryFilters) {
  return useQuery({
    queryKey: organizationNoteKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      appendNoteFilters(params, filters)

      const response = await fetch(`/api/organization/notes?${params}`)
      if (!response.ok) {
        throw await parseJsonError(response, 'Erro ao buscar notas')
      }

      return response.json() as Promise<OrganizationNote[]>
    },
    enabled: !!filters.spaceId,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook para buscar nota por ID
export function useOrganizationNote(id: string, spaceId: string) {
  return useQuery({
    queryKey: organizationNoteKeys.detail(id, spaceId),
    queryFn: async () => {
      const params = new URLSearchParams({ spaceId })
      const response = await fetch(`/api/organization/notes/${id}?${params}`)
      if (!response.ok) {
        throw await parseJsonError(response, 'Erro ao buscar nota')
      }

      return response.json() as Promise<OrganizationNote>
    },
    enabled: !!id && !!spaceId,
  })
}

// Hook para criar nota
export function useCreateOrganizationNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateOrganizationNoteValues) => {
      const response = await fetch('/api/organization/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw await parseJsonError(response, 'Erro ao criar nota')
      }

      return response.json() as Promise<OrganizationNote>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationNoteKeys.all })
      toast.success('Nota criada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook para atualizar nota
export function useUpdateOrganizationNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateOrganizationNoteValues }) => {
      const response = await fetch(`/api/organization/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw await parseJsonError(response, 'Erro ao atualizar nota')
      }

      return response.json() as Promise<OrganizationNote>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationNoteKeys.all })
      toast.success('Nota atualizada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook para arquivar nota
export function useArchiveOrganizationNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/organization/notes/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw await parseJsonError(response, 'Erro ao arquivar nota')
      }

      return response.json() as Promise<{ success: boolean }>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationNoteKeys.all })
      toast.success('Nota arquivada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
