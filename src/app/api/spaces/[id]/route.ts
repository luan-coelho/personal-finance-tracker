import { and, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import { spacesTable, updateSpaceSchema } from '@/app/db/schemas/space-schema'

import { auth } from '@/lib/auth'
import { checkSpaceAccess } from '@/lib/space-access'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/spaces/[id] - Buscar espaço por ID
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    const { id } = await context.params

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    // Verificar acesso ao espaço
    const access = await checkSpaceAccess(session.user.email, id)

    if (!access.hasAccess || !access.space) {
      return NextResponse.json({ success: false, message: 'Espaço não encontrado ou sem permissão' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: access.space,
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

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é dono (apenas donos podem editar o espaço)
    const access = await checkSpaceAccess(session.user.email, id)

    if (!access.isOwner) {
      return NextResponse.json(
        { success: false, message: 'Apenas o proprietário pode editar o espaço' },
        { status: 403 },
      )
    }

    const body = await request.json()

    // Validar dados (schema para update é partial)
    const validatedData = updateSpaceSchema.parse({ id, ...body })

    // Atualizar no banco
    const [updatedSpace] = await db
      .update(spacesTable)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(spacesTable.id, id))
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

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é dono (apenas donos podem excluir)
    const access = await checkSpaceAccess(session.user.email, id)

    if (!access.isOwner) {
      return NextResponse.json(
        { success: false, message: 'Apenas o proprietário pode excluir o espaço' },
        { status: 403 },
      )
    }

    // Deletar fisicamente o espaço
    const [deletedSpace] = await db.delete(spacesTable).where(eq(spacesTable.id, id)).returning()

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
