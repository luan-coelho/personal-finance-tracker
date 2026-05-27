'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type {
  OrganizationProject,
  OrganizationProjectFormValues,
  OrganizationVisibility,
} from '@/app/db/schemas/organization-project-schema'
import type {
  OrganizationProjectSection,
  OrganizationProjectSectionFormValues,
} from '@/app/db/schemas/organization-project-section-schema'
import { organizationTaskKeys } from '@/hooks/use-organization-tasks'
import type { OrganizationProjectWithSections } from '@/services/organization-project-service'

type CreateOrganizationProjectValues = Omit<OrganizationProjectFormValues, 'createdById'>
type UpdateOrganizationProjectValues = Partial<CreateOrganizationProjectValues>
type CreateOrganizationProjectSectionValues = Omit<OrganizationProjectSectionFormValues, 'projectId'>
type UpdateOrganizationProjectSectionValues = Partial<CreateOrganizationProjectSectionValues>

async function parseJsonError(response: Response, fallback: string): Promise<Error> {
  try {
    const error = await response.json()
    return new Error(error.error || error.message || fallback)
  } catch {
    return new Error(fallback)
  }
}

// Chaves de query para cache
export const organizationProjectKeys = {
  all: ['organization-projects'] as const,
  lists: () => [...organizationProjectKeys.all, 'list'] as const,
  list: (spaceId: string, search?: string) => [...organizationProjectKeys.lists(), { spaceId, search }] as const,
  details: () => [...organizationProjectKeys.all, 'detail'] as const,
  detail: (id: string, spaceId?: string) => [...organizationProjectKeys.details(), id, spaceId] as const,
}

// Hook para listar projetos de organizacao
export function useOrganizationProjects(spaceId: string, search?: string) {
  return useQuery({
    queryKey: organizationProjectKeys.list(spaceId, search),
    queryFn: async () => {
      const params = new URLSearchParams({ spaceId })
      if (search) params.append('search', search)

      const response = await fetch(`/api/organization/projects?${params}`)
      if (!response.ok) {
        throw await parseJsonError(response, 'Erro ao buscar projetos')
      }

      return response.json() as Promise<OrganizationProjectWithSections[]>
    },
    enabled: !!spaceId,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook para buscar projeto por ID
export function useOrganizationProject(id: string, spaceId: string) {
  return useQuery({
    queryKey: organizationProjectKeys.detail(id, spaceId),
    queryFn: async () => {
      const params = new URLSearchParams({ spaceId })
      const response = await fetch(`/api/organization/projects/${id}?${params}`)
      if (!response.ok) {
        throw await parseJsonError(response, 'Erro ao buscar projeto')
      }

      return response.json() as Promise<OrganizationProject>
    },
    enabled: !!id && !!spaceId,
  })
}

// Hook para criar projeto
export function useCreateOrganizationProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateOrganizationProjectValues) => {
      const response = await fetch('/api/organization/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw await parseJsonError(response, 'Erro ao criar projeto')
      }

      return response.json() as Promise<OrganizationProject>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationProjectKeys.all })
      toast.success('Projeto criado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook para atualizar projeto
export function useUpdateOrganizationProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateOrganizationProjectValues }) => {
      const response = await fetch(`/api/organization/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw await parseJsonError(response, 'Erro ao atualizar projeto')
      }

      return response.json() as Promise<OrganizationProject>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationProjectKeys.all })
      queryClient.invalidateQueries({ queryKey: organizationTaskKeys.all })
      toast.success('Projeto atualizado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook para arquivar projeto
export function useArchiveOrganizationProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/organization/projects/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw await parseJsonError(response, 'Erro ao arquivar projeto')
      }

      return response.json() as Promise<{ success: boolean }>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationProjectKeys.all })
      queryClient.invalidateQueries({ queryKey: organizationTaskKeys.all })
      toast.success('Projeto arquivado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook para criar secao de projeto
export function useCreateOrganizationProjectSection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string; data: CreateOrganizationProjectSectionValues }) => {
      const response = await fetch(`/api/organization/projects/${projectId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw await parseJsonError(response, 'Erro ao criar secao')
      }

      return response.json() as Promise<OrganizationProjectSection>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationProjectKeys.all })
      toast.success('Secao criada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook para atualizar secao de projeto
export function useUpdateOrganizationProjectSection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      projectId,
      sectionId,
      data,
    }: {
      projectId: string
      sectionId: string
      data: UpdateOrganizationProjectSectionValues
    }) => {
      const response = await fetch(`/api/organization/projects/${projectId}/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw await parseJsonError(response, 'Erro ao atualizar secao')
      }

      return response.json() as Promise<OrganizationProjectSection>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationProjectKeys.all })
      queryClient.invalidateQueries({ queryKey: organizationTaskKeys.all })
      toast.success('Secao atualizada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook para arquivar secao de projeto
export function useArchiveOrganizationProjectSection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ projectId, sectionId }: { projectId: string; sectionId: string }) => {
      const response = await fetch(`/api/organization/projects/${projectId}/sections/${sectionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw await parseJsonError(response, 'Erro ao arquivar secao')
      }

      return response.json() as Promise<{ success: boolean }>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationProjectKeys.all })
      queryClient.invalidateQueries({ queryKey: organizationTaskKeys.all })
      toast.success('Secao arquivada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export type { OrganizationVisibility }
