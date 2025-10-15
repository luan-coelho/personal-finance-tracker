import { Reserve, ReserveFormValues } from '@/app/db/schemas/reserve-schema'

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

// Listar todas as reservas de um espaço
export async function getReservesBySpace(spaceId: string): Promise<Reserve[]> {
  const response = await apiRequest<Reserve[]>(`${routes.api.reserves.bySpace(spaceId)}`)
  return response.data || []
}

// Buscar reserva por ID
export async function getReserveById(id: string): Promise<Reserve> {
  const response = await apiRequest<Reserve>(`${routes.api.reserves.byId(id)}`)
  if (!response.data) {
    throw new Error('Reserva não encontrada')
  }
  return response.data
}

// Criar nova reserva
export async function createReserve(data: ReserveFormValues): Promise<Reserve> {
  const response = await apiRequest<Reserve>(routes.api.reserves.base, {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (!response.data) {
    throw new Error('Erro ao criar reserva')
  }

  return response.data
}

// Atualizar reserva
export async function updateReserve(id: string, data: Partial<ReserveFormValues>): Promise<Reserve> {
  const response = await apiRequest<Reserve>(`${routes.api.reserves.byId(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  if (!response.data) {
    throw new Error('Erro ao atualizar reserva')
  }

  return response.data
}

// Excluir reserva
export async function deleteReserve(id: string): Promise<void> {
  await apiRequest(`${routes.api.reserves.byId(id)}`, {
    method: 'DELETE',
  })
}

// Toggle status da reserva
export async function toggleReserveStatus(id: string): Promise<Reserve> {
  const response = await apiRequest<Reserve>(`${routes.api.reserves.byId(id)}/toggle`, {
    method: 'PATCH',
  })

  if (!response.data) {
    throw new Error('Erro ao alternar status da reserva')
  }

  return response.data
}

// Query keys para React Query
export const reserveQueryKeys = {
  all: ['reserves'] as const,
  lists: () => [...reserveQueryKeys.all, 'list'] as const,
  list: (spaceId: string) => [...reserveQueryKeys.lists(), spaceId] as const,
  details: () => [...reserveQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...reserveQueryKeys.details(), id] as const,
}
