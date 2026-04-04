import { asc, eq, inArray, sql } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import { spaceMembersTable } from '@/app/db/schemas/space-member-schema'
import { spacesTable } from '@/app/db/schemas/space-schema'
import { usersTable } from '@/app/db/schemas/user-schema'

import { auth } from '@/lib/auth'

// GET /api/users - Listar usuários que compartilham pelo menos um space com o usuário logado
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Acesso negado. Faça login para continuar.',
        },
        { status: 401 },
      )
    }

    const currentUserId = session.user.id

    // Buscar IDs dos spaces onde o usuário é owner
    const ownedSpaces = await db
      .select({ id: spacesTable.id })
      .from(spacesTable)
      .where(eq(spacesTable.ownerId, currentUserId))

    // Buscar IDs dos spaces onde o usuário é membro
    const memberSpaces = await db
      .select({ spaceId: spaceMembersTable.spaceId })
      .from(spaceMembersTable)
      .where(eq(spaceMembersTable.userId, currentUserId))

    const allSpaceIds = [
      ...ownedSpaces.map(s => s.id),
      ...memberSpaces.map(s => s.spaceId),
    ]

    if (allSpaceIds.length === 0) {
      // Usuário não tem spaces — retornar apenas ele mesmo
      const [self] = await db.select().from(usersTable).where(eq(usersTable.id, currentUserId)).limit(1)
      return NextResponse.json({
        success: true,
        data: self ? [self] : [],
        message: 'Usuários listados com sucesso',
      })
    }

    // Buscar todos os userIds que são owners ou membros dos mesmos spaces
    const ownerUsers = await db
      .select({ ownerId: spacesTable.ownerId })
      .from(spacesTable)
      .where(inArray(spacesTable.id, allSpaceIds))

    const memberUsers = await db
      .select({ userId: spaceMembersTable.userId })
      .from(spaceMembersTable)
      .where(inArray(spaceMembersTable.spaceId, allSpaceIds))

    const relatedUserIds = new Set([
      currentUserId,
      ...ownerUsers.map(u => u.ownerId),
      ...memberUsers.map(u => u.userId),
    ])

    // Buscar os usuários
    const allUsers = await db
      .select()
      .from(usersTable)
      .where(inArray(usersTable.id, Array.from(relatedUserIds)))
      .orderBy(asc(usersTable.name))

    return NextResponse.json({
      success: true,
      data: allUsers,
      message: 'Usuários listados com sucesso',
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Não foi possível carregar os usuários',
      },
      { status: 500 },
    )
  }
}
