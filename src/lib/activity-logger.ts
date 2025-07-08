import { ActivityAction, ActivityActions } from '@/app/db/schemas/activity-log-schema'

import { logActivity } from '@/services/activity-log-service'

// Classe singleton para gerenciar logs de atividades
export class ActivityLogger {
  private static instance: ActivityLogger
  private currentUserId: string | null = null

  private constructor() {}

  static getInstance(): ActivityLogger {
    if (!ActivityLogger.instance) {
      ActivityLogger.instance = new ActivityLogger()
    }
    return ActivityLogger.instance
  }

  // Definir o usuário atual para logs automáticos
  setCurrentUserId(userId: string | null) {
    this.currentUserId = userId
  }

  // Registrar login (client-side)
  async logSignIn(userId: string, userEmail: string) {
    await logActivity(userId, ActivityActions.SIGN_IN, `Usuário ${userEmail} fez login no sistema`, { userEmail })
  }

  // Registrar logout (client-side)
  async logSignOut(userId: string, userEmail: string) {
    await logActivity(userId, ActivityActions.SIGN_OUT, `Usuário ${userEmail} fez logout do sistema`, { userEmail })
  }

  // Registrar criação de usuário
  async logUserCreated(actorUserId: string, newUserName: string, newUserEmail: string) {
    await logActivity(actorUserId, ActivityActions.USER_CREATED, `Criou o usuário ${newUserName} (${newUserEmail})`, {
      newUserName,
      newUserEmail,
    })
  }

  // Registrar atualização de usuário
  async logUserUpdated(
    actorUserId: string,
    targetUserName: string,
    targetUserEmail: string,
    changes: Record<string, unknown>,
  ) {
    await logActivity(
      actorUserId,
      ActivityActions.USER_UPDATED,
      `Atualizou dados do usuário ${targetUserName} (${targetUserEmail})`,
      { targetUserName, targetUserEmail, changes },
    )
  }

  // Registrar ativação de usuário
  async logUserActivated(actorUserId: string, targetUserName: string, targetUserEmail: string) {
    await logActivity(
      actorUserId,
      ActivityActions.USER_ACTIVATED,
      `Ativou o usuário ${targetUserName} (${targetUserEmail})`,
      { targetUserName, targetUserEmail },
    )
  }

  // Registrar desativação de usuário
  async logUserDeactivated(actorUserId: string, targetUserName: string, targetUserEmail: string) {
    await logActivity(
      actorUserId,
      ActivityActions.USER_DEACTIVATED,
      `Desativou o usuário ${targetUserName} (${targetUserEmail})`,
      { targetUserName, targetUserEmail },
    )
  }

  // Registrar concessão de permissão
  async logPermissionGranted(actorUserId: string, targetUserName: string, permission: string) {
    await logActivity(
      actorUserId,
      ActivityActions.PERMISSION_GRANTED,
      `Concedeu permissão "${permission}" para ${targetUserName}`,
      { targetUserName, permission },
    )
  }

  // Registrar revogação de permissão
  async logPermissionRevoked(actorUserId: string, targetUserName: string, permission: string) {
    await logActivity(
      actorUserId,
      ActivityActions.PERMISSION_REVOKED,
      `Revogou permissão "${permission}" de ${targetUserName}`,
      { targetUserName, permission },
    )
  }

  // Registrar criação de espaço
  async logSpaceCreated(actorUserId: string, spaceName: string) {
    await logActivity(actorUserId, 'SPACE_CREATED' as ActivityAction, `Criou o espaço "${spaceName}"`, {
      spaceName,
    })
  }

  // Registrar atualização de espaço
  async logSpaceUpdated(actorUserId: string, spaceName: string) {
    await logActivity(actorUserId, 'SPACE_UPDATED' as ActivityAction, `Atualizou o espaço "${spaceName}"`, {
      spaceName,
    })
  }

  // Registrar exclusão de espaço
  async logSpaceDeleted(actorUserId: string, spaceName: string) {
    await logActivity(actorUserId, 'SPACE_DELETED' as ActivityAction, `Excluiu o espaço "${spaceName}"`, {
      spaceName,
    })
  }

  // Registrar ativação de espaço
  async logSpaceActivated(actorUserId: string, spaceName: string) {
    await logActivity(actorUserId, 'SPACE_ACTIVATED' as ActivityAction, `Ativou o espaço "${spaceName}"`, {
      spaceName,
    })
  }

  // Registrar desativação de espaço
  async logSpaceDeactivated(actorUserId: string, spaceName: string) {
    await logActivity(actorUserId, 'SPACE_DEACTIVATED' as ActivityAction, `Desativou o espaço "${spaceName}"`, {
      spaceName,
    })
  }

  // Método genérico para registrar qualquer atividade
  async log(userId: string, action: ActivityAction, description: string, metadata?: Record<string, unknown>) {
    await logActivity(userId, action, description, metadata)
  }
}

// Exportar instância singleton
export const activityLogger = ActivityLogger.getInstance()
