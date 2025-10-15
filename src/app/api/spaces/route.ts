import { eq, or } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import { spaceMembersTable } from '@/app/db/schemas/space-member-schema'
import { insertSpaceSchema, spacesTable } from '@/app/db/schemas/space-schema'
import { usersTable } from '@/app/db/schemas/user-schema'

import { auth } from '@/lib/auth'

// GET /api/spaces - Listar espaços do usuário atual (próprios e compartilhados)
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    // Buscar usuário atual
    const currentUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, session.user.email),
    })

    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Usuário não encontrado' }, { status: 404 })
    }

    // Buscar espaços próprios
    const ownedSpaces = await db
      .select()
      .from(spacesTable)
      .where(eq(spacesTable.ownerId, currentUser.id))
      .orderBy(spacesTable.createdAt)

    // Buscar espaços compartilhados
    const sharedSpaces = await db
      .select({
        id: spacesTable.id,
        name: spacesTable.name,
        description: spacesTable.description,
        ownerId: spacesTable.ownerId,
        createdAt: spacesTable.createdAt,
        updatedAt: spacesTable.updatedAt,
      })
      .from(spacesTable)
      .innerJoin(spaceMembersTable, eq(spacesTable.id, spaceMembersTable.spaceId))
      .where(eq(spaceMembersTable.userId, currentUser.id))
      .orderBy(spacesTable.createdAt)

    // Combinar os dois arrays sem duplicatas
    const allSpaces = [...ownedSpaces]
    const ownedSpaceIds = new Set(ownedSpaces.map(s => s.id))

    for (const space of sharedSpaces) {
      if (!ownedSpaceIds.has(space.id)) {
        allSpaces.push(space)
      }
    }

    return NextResponse.json({
      success: true,
      data: allSpaces,
      message: 'Espaços listados com sucesso',
    })
  } catch (error) {
    console.error('Erro ao buscar espaços:', error)
    return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/spaces - Criar novo espaço
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()

    // Adicionar o ownerId automaticamente
    const dataWithOwner = {
      ...body,
      ownerId: session.user.id,
    }

    // Validar dados
    const validatedData = insertSpaceSchema.parse(dataWithOwner)

    // Inserir no banco
    const [newSpace] = await db.insert(spacesTable).values(validatedData).returning()

    return NextResponse.json(
      {
        success: true,
        data: newSpace,
        message: 'Espaço criado com sucesso',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Erro ao criar espaço:', error)

    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json({ success: false, message: 'Dados inválidos', details: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 })
  }
}
