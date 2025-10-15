import { and, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import { reservesTable, updateReserveSchema } from '@/app/db/schemas/reserve-schema'

import { auth } from '@/lib/auth'
import { canEditSpace, canViewSpace } from '@/lib/space-access'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/reserves/[id] - Buscar reserva por ID
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    const { id } = await context.params

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    const reserve = await db.query.reservesTable.findFirst({
      where: eq(reservesTable.id, id),
    })

    if (!reserve) {
      return NextResponse.json({ success: false, message: 'Reserva não encontrada' }, { status: 404 })
    }

    // Verificar acesso ao espaço
    const canView = await canViewSpace(session.user.email, reserve.spaceId)

    if (!canView) {
      return NextResponse.json({ success: false, message: 'Sem permissão para acessar esta reserva' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: reserve,
      message: 'Reserva encontrada',
    })
  } catch (error) {
    console.error('Erro ao buscar reserva:', error)
    return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT /api/reserves/[id] - Atualizar reserva
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    const { id } = await context.params

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()

    // Buscar reserva atual
    const existingReserve = await db.query.reservesTable.findFirst({
      where: eq(reservesTable.id, id),
    })

    if (!existingReserve) {
      return NextResponse.json({ success: false, message: 'Reserva não encontrada' }, { status: 404 })
    }

    // Verificar permissão de edição
    const canEdit = await canEditSpace(session.user.email, existingReserve.spaceId)

    if (!canEdit) {
      return NextResponse.json({ success: false, message: 'Sem permissão para editar esta reserva' }, { status: 403 })
    }

    // Validar dados
    const validatedData = updateReserveSchema.parse({ id, ...body })

    // Atualizar reserva
    const [updatedReserve] = await db
      .update(reservesTable)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(reservesTable.id, id))
      .returning()

    return NextResponse.json({
      success: true,
      data: updatedReserve,
      message: 'Reserva atualizada com sucesso',
    })
  } catch (error) {
    console.error('Erro ao atualizar reserva:', error)

    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json({ success: false, message: 'Dados inválidos', details: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE /api/reserves/[id] - Excluir reserva
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    const { id } = await context.params

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    // Buscar reserva
    const reserve = await db.query.reservesTable.findFirst({
      where: eq(reservesTable.id, id),
    })

    if (!reserve) {
      return NextResponse.json({ success: false, message: 'Reserva não encontrada' }, { status: 404 })
    }

    // Verificar permissão de edição
    const canEdit = await canEditSpace(session.user.email, reserve.spaceId)

    if (!canEdit) {
      return NextResponse.json({ success: false, message: 'Sem permissão para excluir esta reserva' }, { status: 403 })
    }

    // Excluir reserva
    await db.delete(reservesTable).where(eq(reservesTable.id, id))

    return NextResponse.json({
      success: true,
      message: 'Reserva excluída com sucesso',
    })
  } catch (error) {
    console.error('Erro ao excluir reserva:', error)
    return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PATCH /api/reserves/[id]/toggle - Alternar status ativo/inativo
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    const { id } = await context.params

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    // Buscar reserva
    const reserve = await db.query.reservesTable.findFirst({
      where: eq(reservesTable.id, id),
    })

    if (!reserve) {
      return NextResponse.json({ success: false, message: 'Reserva não encontrada' }, { status: 404 })
    }

    // Verificar permissão de edição
    const canEdit = await canEditSpace(session.user.email, reserve.spaceId)

    if (!canEdit) {
      return NextResponse.json(
        { success: false, message: 'Sem permissão para alterar status desta reserva' },
        { status: 403 },
      )
    }

    // Alternar status
    const [updatedReserve] = await db
      .update(reservesTable)
      .set({
        active: !reserve.active,
        updatedAt: new Date(),
      })
      .where(eq(reservesTable.id, id))
      .returning()

    return NextResponse.json({
      success: true,
      data: updatedReserve,
      message: 'Status alterado com sucesso',
    })
  } catch (error) {
    console.error('Erro ao alternar status:', error)
    return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 })
  }
}
