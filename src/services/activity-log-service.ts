import { ActivityAction, ActivityLog, ActivityLogFormValues } from '@/app/db/schemas/activity-log-schema'

// Tipos para as respostas da API
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message: string
  error?: string
  details?: string
}

// Base URL da API
const API_BASE_URL = '/api/activity-logs'

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

// Listar logs de atividades com paginação e filtros
export async function getActivityLogs(options?: {
  userId?: string
  page?: number
  limit?: number
  action?: ActivityAction
}): Promise<{
  logs: ActivityLog[]
  total: number
  page: number
  limit: number
  totalPages: number
}> {
  const params = new URLSearchParams()

  if (options?.userId) params.append('userId', options.userId)
  if (options?.page) params.append('page', options.page.toString())
  if (options?.limit) params.append('limit', options.limit.toString())
  if (options?.action) params.append('action', options.action)

  const url = `${API_BASE_URL}${params.toString() ? `?${params.toString()}` : ''}`
  const response = await apiRequest<{
    logs: ActivityLog[]
    total: number
    page: number
    limit: number
    totalPages: number
  }>(url)

  return (
    response.data || {
      logs: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    }
  )
}

// Buscar logs de um usuário específico
export async function getUserActivityLogs(
  userId: string,
  options?: {
    page?: number
    limit?: number
    action?: ActivityAction
  },
): Promise<{
  logs: ActivityLog[]
  total: number
  page: number
  limit: number
  totalPages: number
}> {
  return getActivityLogs({ ...options, userId })
}

// Criar novo log de atividade
export async function createActivityLog(data: ActivityLogFormValues): Promise<ActivityLog> {
  const response = await apiRequest<ActivityLog>(API_BASE_URL, {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (!response.data) {
    throw new Error('Erro ao criar log de atividade')
  }

  return response.data
}

// Função utilitária para criar log com informações do navegador (apenas client-side)
export async function logActivity(
  userId: string,
  action: ActivityAction,
  description: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    const logData: ActivityLogFormValues = {
      userId,
      action,
      description,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    }

    await createActivityLog(logData)
  } catch (error) {
    // Não mostrar erro para o usuário, apenas logar no console
    console.error('Erro ao registrar log de atividade:', error)
  }
}

// Query keys para React Query
export const activityLogQueryKeys = {
  all: ['activity-logs'] as const,
  lists: () => [...activityLogQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...activityLogQueryKeys.lists(), { filters }] as const,
  userLogs: (userId: string) => [...activityLogQueryKeys.all, 'user', userId] as const,
  userLogsList: (userId: string, filters: Record<string, unknown>) =>
    [...activityLogQueryKeys.userLogs(userId), { filters }] as const,
}
