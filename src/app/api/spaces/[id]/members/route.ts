import { and, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import {
  insertSpaceMemberSchema,
  spaceMembersTable,
  SpaceMemberWithUser,
  updateSpaceMemberSchema,
} from '@/app/db/schemas/space-member-schema'
import { spacesTable } from '@/app/db/schemas/space-schema'
import { usersTable } from '@/app/db/schemas/user-schema'

import { auth } from '@/lib/auth'

// GET /api/spaces/[id]/members - Listar membros do espaço
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Não autenticado' }, { status: 401 })
    }

    const { id: spaceId } = await params

    // Verificar se o usuário tem acesso ao espaço
    const space = await db.query.spacesTable.findFirst({
      where: eq(spacesTable.id, spaceId),
    })

    if (!space) {
      return NextResponse.json({ success: false, message: 'Espaço não encontrado' }, { status: 404 })
    }

    // Buscar usuário atual
    const currentUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, session.user.email),
    })

    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Usuário não encontrado' }, { status: 404 })
    }

    // Verificar se é dono ou membro do espaço
    const isMember = await db.query.spaceMembersTable.findFirst({
      where: and(eq(spaceMembersTable.spaceId, spaceId), eq(spaceMembersTable.userId, currentUser.id)),
    })

    if (space.ownerId !== currentUser.id && !isMember) {
      return NextResponse.json({ success: false, message: 'Sem permissão para acessar este espaço' }, { status: 403 })
    }

    // Buscar membros com informações do usuário
    const members = await db
      .select({
        id: spaceMembersTable.id,
        spaceId: spaceMembersTable.spaceId,
        userId: spaceMembersTable.userId,
        role: spaceMembersTable.role,
        createdAt: spaceMembersTable.createdAt,
        updatedAt: spaceMembersTable.updatedAt,
        user: {
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
        },
      })
      .from(spaceMembersTable)
      .innerJoin(usersTable, eq(spaceMembersTable.userId, usersTable.id))
      .where(eq(spaceMembersTable.spaceId, spaceId))

    return NextResponse.json({
      success: true,
      data: members as SpaceMemberWithUser[],
      message: 'Membros listados com sucesso',
    })
  } catch (error) {
    console.error('Erro ao listar membros:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao listar membros',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 },
    )
  }
}

// POST /api/spaces/[id]/members - Adicionar membro ao espaço
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Não autenticado' }, { status: 401 })
    }

    const { id: spaceId } = await params
    const body = await request.json()

    // Validar dados
    const validatedData = insertSpaceMemberSchema.parse({ ...body, spaceId })

    // Buscar usuário atual
    const currentUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, session.user.email),
    })

    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Usuário não encontrado' }, { status: 404 })
    }

    // Verificar se o usuário é dono do espaço
    const space = await db.query.spacesTable.findFirst({
      where: eq(spacesTable.id, spaceId),
    })

    if (!space) {
      return NextResponse.json({ success: false, message: 'Espaço não encontrado' }, { status: 404 })
    }

    if (space.ownerId !== currentUser.id) {
      return NextResponse.json(
        { success: false, message: 'Apenas o proprietário pode adicionar membros' },
        { status: 403 },
      )
    }

    // Verificar se o usuário a ser adicionado existe
    const userToAdd = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, validatedData.userId),
    })

    if (!userToAdd) {
      return NextResponse.json({ success: false, message: 'Usuário a ser adicionado não encontrado' }, { status: 404 })
    }

    // Verificar se o usuário já é membro
    const existingMember = await db.query.spaceMembersTable.findFirst({
      where: and(eq(spaceMembersTable.spaceId, spaceId), eq(spaceMembersTable.userId, validatedData.userId)),
    })

    if (existingMember) {
      return NextResponse.json({ success: false, message: 'Usuário já é membro deste espaço' }, { status: 400 })
    }

    // Adicionar membro
    const [newMember] = await db
      .insert(spaceMembersTable)
      .values({
        spaceId: validatedData.spaceId,
        userId: validatedData.userId,
        role: validatedData.role,
      })
      .returning()

    return NextResponse.json({
      success: true,
      data: newMember,
      message: 'Membro adicionado com sucesso',
    })
  } catch (error) {
    console.error('Erro ao adicionar membro:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao adicionar membro',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 },
    )
  }
}
