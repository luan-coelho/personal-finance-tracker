import { and, eq, or } from 'drizzle-orm'

import { db } from '@/app/db'
import { MemberRole, spaceMembersTable } from '@/app/db/schemas/space-member-schema'
import { spacesTable } from '@/app/db/schemas/space-schema'
import { usersTable } from '@/app/db/schemas/user-schema'

export interface SpaceAccessResult {
  hasAccess: boolean
  isOwner: boolean
  role?: MemberRole
  space?: typeof spacesTable.$inferSelect
}

/**
 * Verifica se um usuário tem acesso a um espaço
 * @param userEmail Email do usuário
 * @param spaceId ID do espaço
 * @returns Objeto com informações de acesso
 */
export async function checkSpaceAccess(userEmail: string, spaceId: string): Promise<SpaceAccessResult> {
  try {
    // Buscar usuário
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, userEmail),
    })

    if (!user) {
      return { hasAccess: false, isOwner: false }
    }

    // Buscar espaço
    const space = await db.query.spacesTable.findFirst({
      where: eq(spacesTable.id, spaceId),
    })

    if (!space) {
      return { hasAccess: false, isOwner: false }
    }

    // Verificar se é dono
    if (space.ownerId === user.id) {
      return {
        hasAccess: true,
        isOwner: true,
        role: 'owner',
        space,
      }
    }

    // Verificar se é membro
    const membership = await db.query.spaceMembersTable.findFirst({
      where: and(eq(spaceMembersTable.spaceId, spaceId), eq(spaceMembersTable.userId, user.id)),
    })

    if (membership) {
      return {
        hasAccess: true,
        isOwner: false,
        role: membership.role,
        space,
      }
    }

    return { hasAccess: false, isOwner: false }
  } catch (error) {
    console.error('Erro ao verificar acesso ao espaço:', error)
    return { hasAccess: false, isOwner: false }
  }
}

/**
 * Verifica se um usuário pode editar um espaço (dono ou editor)
 * @param userEmail Email do usuário
 * @param spaceId ID do espaço
 * @returns true se pode editar, false caso contrário
 */
export async function canEditSpace(userEmail: string, spaceId: string): Promise<boolean> {
  const access = await checkSpaceAccess(userEmail, spaceId)
  return access.hasAccess && (access.isOwner || access.role === 'editor')
}

/**
 * Verifica se um usuário pode visualizar um espaço (qualquer acesso)
 * @param userEmail Email do usuário
 * @param spaceId ID do espaço
 * @returns true se pode visualizar, false caso contrário
 */
export async function canViewSpace(userEmail: string, spaceId: string): Promise<boolean> {
  const access = await checkSpaceAccess(userEmail, spaceId)
  return access.hasAccess
}

/**
 * Verifica se um usuário pode gerenciar um espaço (dono ou editor)
 * Alias para canEditSpace
 * @param userEmail Email do usuário
 * @param spaceId ID do espaço
 * @returns true se pode gerenciar, false caso contrário
 */
export async function canManageSpace(userEmail: string, spaceId: string): Promise<boolean> {
  return canEditSpace(userEmail, spaceId)
}
