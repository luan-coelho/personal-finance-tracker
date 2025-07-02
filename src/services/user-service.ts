import { User, UserFormValues } from '@/app/db/schemas/user-schema'

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
const API_BASE_URL = routes.api.users.base

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

// Listar todos os usuários
export async function getAllUsers(): Promise<User[]> {
  const response = await apiRequest<User[]>(API_BASE_URL)
  return response.data || []
}

// Buscar usuário por ID
export async function getUserById(id: string): Promise<User> {
  const response = await apiRequest<User>(`${API_BASE_URL}/${id}`)
  if (!response.data) {
    throw new Error('Usuário não encontrado')
  }
  return response.data
}

// Criar novo usuário
export async function createUser(data: UserFormValues): Promise<User> {
  const response = await apiRequest<User>(API_BASE_URL, {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (!response.data) {
    throw new Error('Erro ao criar usuário')
  }

  return response.data
}

// Atualizar usuário
export async function updateUser(id: string, data: Partial<UserFormValues>): Promise<User> {
  const response = await apiRequest<User>(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  if (!response.data) {
    throw new Error('Erro ao atualizar usuário')
  }

  return response.data
}

// Excluir usuário (desativar)
export async function deleteUser(id: string): Promise<void> {
  await apiRequest(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  })
}

// Alternar status ativo/inativo do usuário
export async function toggleUserStatus(id: string, active: boolean): Promise<User> {
  const response = await apiRequest<User>(`${API_BASE_URL}/${id}/toggle-status`, {
    method: 'PATCH',
    body: JSON.stringify({ active }),
  })

  if (!response.data) {
    throw new Error('Erro ao alterar status do usuário')
  }

  return response.data
}

// Hooks do React Query para gerenciamento de estado
export const userQueryKeys = {
  all: ['users'] as const,
  lists: () => [...userQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...userQueryKeys.lists(), { filters }] as const,
  details: () => [...userQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...userQueryKeys.details(), id] as const,
}
