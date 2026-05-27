'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type {
  OrganizationTask,
  OrganizationTaskFormValues,
  UpdateOrganizationTaskFormValues,
} from '@/app/db/schemas/organization-task-schema'

import type {
  OrganizationTaskFilters,
  OrganizationTaskWithDetails,
  OrganizationTodayResult,
} from '@/services/organization-task-service'

type OrganizationTaskQueryFilters = Omit<OrganizationTaskFilters, 'userId'>
type CreateOrganizationTaskValues = Omit<OrganizationTaskFormValues, 'createdById'>
type UpdateOrganizationTaskValues = Omit<UpdateOrganizationTaskFormValues, 'id' | 'createdById'>

const serializeFilters = (filters: OrganizationTaskQueryFilters) => ({
  ...filters,
  dateFrom: filters.dateFrom?.toISOString(),
  dateTo: filters.dateTo?.toISOString(),
})

async function parseJsonError(response: Response, fallback: string): Promise<Error> {
  try {
    const error = await response.json()
    return new Error(error.error || error.message || fallback)
  } catch {
    return new Error(fallback)
  }
}

function appendTaskFilters(params: URLSearchParams, filters: OrganizationTaskQueryFilters) {
  if (filters.spaceId) params.append('spaceId', filters.spaceId)
  if (filters.status) params.append('status', filters.status)
  if (filters.projectId) params.append('projectId', filters.projectId)
  if (filters.sectionId) params.append('sectionId', filters.sectionId)
  if (filters.assigneeId) params.append('assigneeId', filters.assigneeId)
  if (filters.labelId) params.append('labelId', filters.labelId)
  if (filters.visibility) params.append('visibility', filters.visibility)
  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString())
  if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString())
  if (filters.search) params.append('search', filters.search)
}

// Chaves de query para cache
export const organizationTaskKeys = {
  all: ['organization-tasks'] as const,
  lists: () => [...organizationTaskKeys.all, 'list'] as const,
  list: (filters: OrganizationTaskQueryFilters) =>
    [...organizationTaskKeys.lists(), serializeFilters(filters)] as const,
  details: () => [...organizationTaskKeys.all, 'detail'] as const,
  detail: (id: string, spaceId?: string) => [...organizationTaskKeys.details(), id, spaceId] as const,
  today: (spaceId: string) => [...organizationTaskKeys.all, 'today', spaceId] as const,
  reminders: (spaceId: string) => [...organizationTaskKeys.all, 'reminders', spaceId] as const,
}

// Hook para resumo de hoje
export function useOrganizationToday(spaceId: string) {
  return useQuery({
    queryKey: organizationTaskKeys.today(spaceId),
    queryFn: async () => {
      const params = new URLSearchParams({ spaceId })
      const response = await fetch(`/api/organization/today?${params}`)
      if (!response.ok) {
        throw await parseJsonError(response, 'Erro ao buscar resumo de hoje')
      }

      return response.json() as Promise<OrganizationTodayResult>
    },
    enabled: !!spaceId,
    staleTime: 60 * 1000,
  })
}

// Hook para listar tarefas de organizacao
export function useOrganizationTasks(filters: OrganizationTaskQueryFilters) {
  return useQuery({
    queryKey: organizationTaskKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      appendTaskFilters(params, filters)

      const response = await fetch(`/api/organization/tasks?${params}`)
      if (!response.ok) {
        throw await parseJsonError(response, 'Erro ao buscar tarefas')
      }

      return response.json() as Promise<OrganizationTaskWithDetails[]>
    },
    enabled: !!filters.spaceId,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook para buscar tarefa por ID
export function useOrganizationTask(id: string, spaceId: string) {
  return useQuery({
    queryKey: organizationTaskKeys.detail(id, spaceId),
    queryFn: async () => {
      const params = new URLSearchParams({ spaceId })
      const response = await fetch(`/api/organization/tasks/${id}?${params}`)
      if (!response.ok) {
        throw await parseJsonError(response, 'Erro ao buscar tarefa')
      }

      return response.json() as Promise<OrganizationTaskWithDetails>
    },
    enabled: !!id && !!spaceId,
  })
}

// Hook para buscar candidatos a lembrete
export function useOrganizationReminderCandidates(spaceId: string) {
  return useQuery({
    queryKey: organizationTaskKeys.reminders(spaceId),
    queryFn: async () => {
      const params = new URLSearchParams({ spaceId })
      const response = await fetch(`/api/organization/tasks/reminders?${params}`)
      if (!response.ok) {
        throw await parseJsonError(response, 'Erro ao buscar lembretes')
      }

      return response.json() as Promise<OrganizationTaskWithDetails[]>
    },
    enabled: !!spaceId,
    refetchInterval: 60 * 1000,
  })
}

// Hook para criar tarefa
export function useCreateOrganizationTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateOrganizationTaskValues) => {
      const response = await fetch('/api/organization/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw await parseJsonError(response, 'Erro ao criar tarefa')
      }

      return response.json() as Promise<OrganizationTask>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationTaskKeys.all })
      toast.success('Tarefa criada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook para atualizar tarefa
export function useUpdateOrganizationTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateOrganizationTaskValues }) => {
      const response = await fetch(`/api/organization/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw await parseJsonError(response, 'Erro ao atualizar tarefa')
      }

      return response.json() as Promise<OrganizationTask>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationTaskKeys.all })
      toast.success('Tarefa atualizada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook para arquivar tarefa
export function useArchiveOrganizationTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/organization/tasks/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw await parseJsonError(response, 'Erro ao arquivar tarefa')
      }

      return response.json() as Promise<{ success: boolean }>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationTaskKeys.all })
      toast.success('Tarefa arquivada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook para concluir tarefa
export function useCompleteOrganizationTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/organization/tasks/${id}/complete`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw await parseJsonError(response, 'Erro ao concluir tarefa')
      }

      return response.json() as Promise<OrganizationTask>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationTaskKeys.all })
      toast.success('Tarefa concluida com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook para reabrir tarefa
export function useReopenOrganizationTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/organization/tasks/${id}/reopen`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw await parseJsonError(response, 'Erro ao reabrir tarefa')
      }

      return response.json() as Promise<OrganizationTask>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationTaskKeys.all })
      toast.success('Tarefa reaberta com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
