import {
  MemberRole,
  SpaceMember,
  SpaceMemberFormValues,
  SpaceMemberWithUser,
  UpdateSpaceMemberFormValues,
} from '@/app/db/schemas/space-member-schema'

import { routes } from '@/lib/routes'

// Tipos para as respostas da API
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message: string
  error?: string
  details?: string
}

// Função auxiliar para fazer requisições
async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição')
    }

    return data
  } catch (error) {
    console.error('Erro na requisição:', error)
    throw error
  }
}

// Listar todos os membros de um espaço
export async function getSpaceMembers(spaceId: string): Promise<SpaceMemberWithUser[]> {
  const response = await apiRequest<SpaceMemberWithUser[]>(`${routes.api.spaces.base}/${spaceId}/members`)
  return response.data || []
}

// Adicionar membro a um espaço
export async function addSpaceMember(
  spaceId: string,
  data: Omit<SpaceMemberFormValues, 'spaceId'>,
): Promise<SpaceMember> {
  const response = await apiRequest<SpaceMember>(`${routes.api.spaces.base}/${spaceId}/members`, {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (!response.data) {
    throw new Error('Erro ao adicionar membro')
  }

  return response.data
}

// Atualizar papel de um membro
export async function updateSpaceMember(
  spaceId: string,
  memberId: string,
  data: { role: MemberRole },
): Promise<SpaceMember> {
  const response = await apiRequest<SpaceMember>(`${routes.api.spaces.base}/${spaceId}/members/${memberId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  if (!response.data) {
    throw new Error('Erro ao atualizar membro')
  }

  return response.data
}

// Remover membro de um espaço
export async function removeSpaceMember(spaceId: string, memberId: string): Promise<void> {
  await apiRequest(`${routes.api.spaces.base}/${spaceId}/members/${memberId}`, {
    method: 'DELETE',
  })
}

// Query keys para React Query
export const spaceMemberQueryKeys = {
  all: ['space-members'] as const,
  lists: () => [...spaceMemberQueryKeys.all, 'list'] as const,
  list: (spaceId: string) => [...spaceMemberQueryKeys.lists(), spaceId] as const,
  details: () => [...spaceMemberQueryKeys.all, 'detail'] as const,
  detail: (spaceId: string, memberId: string) => [...spaceMemberQueryKeys.details(), spaceId, memberId] as const,
}
