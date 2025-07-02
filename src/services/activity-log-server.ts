'use server'

import { db } from '@/app/db'
import { ActivityAction, ActivityLogFormValues, activityLogsTable } from '@/app/db/schemas/activity-log-schema'

// Função para criar log diretamente no banco (apenas server-side)
export async function createActivityLogDirect(data: ActivityLogFormValues) {
  const [newLog] = await db
    .insert(activityLogsTable)
    .values({
      userId: data.userId,
      action: data.action,
      description: data.description,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      metadata: data.metadata,
      createdAt: new Date(),
    })
    .returning()

  return newLog
}

// Função utilitária para criar log diretamente no banco (apenas server-side)
export async function logActivityServer(
  userId: string,
  action: ActivityAction,
  description: string,
  metadata?: Record<string, unknown>,
  requestInfo?: {
    ip?: string
    userAgent?: string
  },
): Promise<void> {
  try {
    const logData: ActivityLogFormValues = {
      userId,
      action,
      description,
      ipAddress: requestInfo?.ip,
      userAgent: requestInfo?.userAgent,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    }

    await createActivityLogDirect(logData)
  } catch (error) {
    // Não mostrar erro para o usuário, apenas logar no console
    console.error('Erro ao registrar log de atividade no servidor:', error)
  }
}
