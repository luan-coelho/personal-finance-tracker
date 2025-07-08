import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import { insertSpaceSchema, spacesTable } from '@/app/db/schemas/space-schema'

import { auth } from '@/lib/auth'

// GET /api/spaces - Listar espaços do usuário atual
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    const spaces = await db
      .select()
      .from(spacesTable)
      .where(eq(spacesTable.ownerId, session.user.id))
      .orderBy(spacesTable.createdAt)

    return NextResponse.json({
      success: true,
      data: spaces,
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
