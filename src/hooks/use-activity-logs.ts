import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { ActivityAction } from '@/app/db/schemas/activity-log-schema'

import {
  activityLogQueryKeys,
  createActivityLog,
  getActivityLogs,
  getUserActivityLogs,
  logActivity,
} from '@/services/activity-log-service'

// Hook para listar todos os logs de atividades com paginação
export function useActivityLogs(options?: { userId?: string; page?: number; limit?: number; action?: ActivityAction }) {
  return useQuery({
    queryKey: activityLogQueryKeys.list(options || {}),
    queryFn: () => getActivityLogs(options),
  })
}

// Hook para buscar logs de um usuário específico
export function useUserActivityLogs(
  userId: string,
  options?: {
    page?: number
    limit?: number
    action?: ActivityAction
  },
) {
  return useQuery({
    queryKey: activityLogQueryKeys.userLogsList(userId, options || {}),
    queryFn: () => getUserActivityLogs(userId, options),
    enabled: !!userId,
  })
}

// Hook para criar um novo log de atividade
export function useCreateActivityLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createActivityLog,
    onSuccess: () => {
      // Invalidar todas as listas de logs para refetch
      queryClient.invalidateQueries({
        queryKey: activityLogQueryKeys.lists(),
      })
    },
    onError: error => {
      // Não mostrar toast de erro para logs, apenas logar no console
      console.error('Erro ao criar log de atividade:', error)
    },
  })
}

// Hook para registrar atividade de forma simples
export function useLogActivity() {
  return useMutation({
    mutationFn: ({
      userId,
      action,
      description,
      metadata,
    }: {
      userId: string
      action: ActivityAction
      description: string
      metadata?: Record<string, unknown>
    }) => logActivity(userId, action, description, metadata),
    onError: error => {
      // Não mostrar toast de erro para logs, apenas logar no console
      console.error('Erro ao registrar atividade:', error)
    },
  })
}
