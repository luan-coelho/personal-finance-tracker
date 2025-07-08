import { and, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import { spacesTable, updateSpaceSchema } from '@/app/db/schemas/space-schema'

import { auth } from '@/lib/auth'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/spaces/[id] - Buscar espaço por ID
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    const { id } = await context.params

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    const [space] = await db
      .select()
      .from(spacesTable)
      .where(and(eq(spacesTable.id, id), eq(spacesTable.ownerId, session.user.id)))
      .limit(1)

    if (!space) {
      return NextResponse.json({ success: false, message: 'Espaço não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: space,
      message: 'Espaço encontrado',
    })
  } catch (error) {
    console.error('Erro ao buscar espaço:', error)
    return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT /api/spaces/[id] - Atualizar espaço
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    const { id } = await context.params

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()

    // Validar dados (schema para update é partial)
    const validatedData = updateSpaceSchema.parse({ id, ...body })

    // Atualizar no banco (apenas espaços do usuário atual)
    const [updatedSpace] = await db
      .update(spacesTable)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(and(eq(spacesTable.id, id), eq(spacesTable.ownerId, session.user.id)))
      .returning()

    if (!updatedSpace) {
      return NextResponse.json({ success: false, message: 'Espaço não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updatedSpace,
      message: 'Espaço atualizado com sucesso',
    })
  } catch (error) {
    console.error('Erro ao atualizar espaço:', error)

    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json({ success: false, message: 'Dados inválidos', details: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE /api/spaces/[id] - Excluir espaço (desativar)
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    const { id } = await context.params

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    // Deletar fisicamente o espaço
    const [deletedSpace] = await db
      .delete(spacesTable)
      .where(and(eq(spacesTable.id, id), eq(spacesTable.ownerId, session.user.id)))
      .returning()

    if (!deletedSpace) {
      return NextResponse.json({ success: false, message: 'Espaço não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Espaço excluído com sucesso',
    })
  } catch (error) {
    console.error('Erro ao excluir espaço:', error)
    return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 })
  }
}
