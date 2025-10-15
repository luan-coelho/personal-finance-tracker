import {
  ReserveMovement,
  ReserveMovementFormValues,
  ReserveMovementWithReserve,
} from '@/app/db/schemas/reserve-movement-schema'

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

// Listar todas as movimentações de uma reserva
export async function getReserveMovements(reserveId: string): Promise<ReserveMovementWithReserve[]> {
  const response = await apiRequest<ReserveMovementWithReserve[]>(`${routes.api.reserves.movements(reserveId)}`)
  return response.data || []
}

// Criar nova movimentação
export async function createReserveMovement(data: ReserveMovementFormValues): Promise<ReserveMovement> {
  const response = await apiRequest<ReserveMovement>(routes.api.reserves.movements(data.reserveId), {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (!response.data) {
    throw new Error('Erro ao criar movimentação')
  }

  return response.data
}

// Excluir movimentação
export async function deleteReserveMovement(reserveId: string, movementId: string): Promise<void> {
  await apiRequest(`${routes.api.reserves.movements(reserveId)}/${movementId}`, {
    method: 'DELETE',
  })
}

// Query keys para React Query
export const reserveMovementQueryKeys = {
  all: ['reserve-movements'] as const,
  lists: () => [...reserveMovementQueryKeys.all, 'list'] as const,
  list: (reserveId: string) => [...reserveMovementQueryKeys.lists(), reserveId] as const,
}
