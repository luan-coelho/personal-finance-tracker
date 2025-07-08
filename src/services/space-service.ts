import { Space, SpaceFormValues } from '@/app/db/schemas/space-schema'

import { routes } from '@/lib/routes'

// Tipos para as respostas da API
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message: string
  error?: string
  details?: string
}

// Base URL da API
const API_BASE_URL = routes.api.spaces.base

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

// Listar todos os espaços do usuário atual
export async function getAllSpaces(): Promise<Space[]> {
  const response = await apiRequest<Space[]>(API_BASE_URL)
  return response.data || []
}

// Buscar espaço por ID
export async function getSpaceById(id: string): Promise<Space> {
  const response = await apiRequest<Space>(`${API_BASE_URL}/${id}`)
  if (!response.data) {
    throw new Error('Espaço não encontrado')
  }
  return response.data
}

// Criar novo espaço
export async function createSpace(data: SpaceFormValues): Promise<Space> {
  const response = await apiRequest<Space>(API_BASE_URL, {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (!response.data) {
    throw new Error('Erro ao criar espaço')
  }

  return response.data
}

// Atualizar espaço
export async function updateSpace(id: string, data: Partial<SpaceFormValues>): Promise<Space> {
  const response = await apiRequest<Space>(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  if (!response.data) {
    throw new Error('Erro ao atualizar espaço')
  }

  return response.data
}

// Excluir espaço (desativar)
export async function deleteSpace(id: string): Promise<void> {
  await apiRequest(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  })
}

// Função removida: toggleSpaceStatus (campo active foi removido do schema)

// Query keys para React Query
export const spaceQueryKeys = {
  all: ['spaces'] as const,
  lists: () => [...spaceQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...spaceQueryKeys.lists(), { filters }] as const,
  details: () => [...spaceQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...spaceQueryKeys.details(), id] as const,
}
