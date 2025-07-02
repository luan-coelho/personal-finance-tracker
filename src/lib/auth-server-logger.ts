'use server'

import { ActivityActions } from '@/app/db/schemas/activity-log-schema'

import { logActivityServer } from '@/services/activity-log-server'

// Registrar login no servidor
export async function logSignInServer(
  userId: string,
  userEmail: string,
  requestInfo?: { ip?: string; userAgent?: string },
) {
  await logActivityServer(
    userId,
    ActivityActions.SIGN_IN,
    `Usuário ${userEmail} fez login no sistema`,
    { userEmail },
    requestInfo,
  )
}

// Registrar logout no servidor
export async function logSignOutServer(
  userId: string,
  userEmail: string,
  requestInfo?: { ip?: string; userAgent?: string },
) {
  await logActivityServer(
    userId,
    ActivityActions.SIGN_OUT,
    `Usuário ${userEmail} fez logout do sistema`,
    { userEmail },
    requestInfo,
  )
}
