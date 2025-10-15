import { and, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import {
  insertReserveMovementSchema,
  reserveMovementsTable,
  ReserveMovementWithReserve,
} from '@/app/db/schemas/reserve-movement-schema'
import { reservesTable } from '@/app/db/schemas/reserve-schema'
import { usersTable } from '@/app/db/schemas/user-schema'

import { auth } from '@/lib/auth'
import { canEditSpace, canViewSpace } from '@/lib/space-access'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/reserves/[id]/movements - Listar movimentações de uma reserva
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    const { id: reserveId } = await context.params

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    // Buscar reserva
    const reserve = await db.query.reservesTable.findFirst({
      where: eq(reservesTable.id, reserveId),
    })

    if (!reserve) {
      return NextResponse.json({ success: false, message: 'Reserva não encontrada' }, { status: 404 })
    }

    // Verificar acesso ao espaço
    const canView = await canViewSpace(session.user.email, reserve.spaceId)

    if (!canView) {
      return NextResponse.json(
        { success: false, message: 'Sem permissão para acessar as movimentações desta reserva' },
        { status: 403 },
      )
    }

    // Buscar movimentações com informações da reserva
    const movements = await db
      .select({
        id: reserveMovementsTable.id,
        type: reserveMovementsTable.type,
        amount: reserveMovementsTable.amount,
        date: reserveMovementsTable.date,
        description: reserveMovementsTable.description,
        reserveId: reserveMovementsTable.reserveId,
        userId: reserveMovementsTable.userId,
        createdAt: reserveMovementsTable.createdAt,
        updatedAt: reserveMovementsTable.updatedAt,
        reserve: {
          id: reservesTable.id,
          name: reservesTable.name,
          color: reservesTable.color,
          icon: reservesTable.icon,
        },
      })
      .from(reserveMovementsTable)
      .innerJoin(reservesTable, eq(reserveMovementsTable.reserveId, reservesTable.id))
      .where(eq(reserveMovementsTable.reserveId, reserveId))
      .orderBy(reserveMovementsTable.date)

    return NextResponse.json({
      success: true,
      data: movements as ReserveMovementWithReserve[],
      message: 'Movimentações listadas com sucesso',
    })
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error)
    return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/reserves/[id]/movements - Criar nova movimentação
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    const { id: reserveId } = await context.params

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()

    // Buscar usuário atual
    const currentUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, session.user.email),
    })

    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Usuário não encontrado' }, { status: 404 })
    }

    // Adicionar userId e reserveId ao body
    const dataWithIds = {
      ...body,
      reserveId,
      userId: currentUser.id,
    }

    // Validar dados
    const validatedData = insertReserveMovementSchema.parse(dataWithIds)

    // Buscar reserva
    const reserve = await db.query.reservesTable.findFirst({
      where: eq(reservesTable.id, reserveId),
    })

    if (!reserve) {
      return NextResponse.json({ success: false, message: 'Reserva não encontrada' }, { status: 404 })
    }

    // Verificar permissão de edição
    const canEdit = await canEditSpace(session.user.email, reserve.spaceId)

    if (!canEdit) {
      return NextResponse.json(
        { success: false, message: 'Sem permissão para criar movimentações nesta reserva' },
        { status: 403 },
      )
    }

    // Calcular novo valor da reserva
    const amountValue = parseFloat(validatedData.amount.replace(',', '.'))
    const currentAmountValue = parseFloat(reserve.currentAmount)
    const newAmount =
      validatedData.type === 'deposit' ? currentAmountValue + amountValue : currentAmountValue - amountValue

    // Verificar se há saldo suficiente para retirada
    if (validatedData.type === 'withdraw' && newAmount < 0) {
      return NextResponse.json({ success: false, message: 'Saldo insuficiente na reserva' }, { status: 400 })
    }

    // Criar movimentação
    const [newMovement] = await db.insert(reserveMovementsTable).values(validatedData).returning()

    // Atualizar valor atual da reserva
    await db
      .update(reservesTable)
      .set({
        currentAmount: newAmount.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(reservesTable.id, reserveId))

    return NextResponse.json(
      {
        success: true,
        data: newMovement,
        message: 'Movimentação registrada com sucesso',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Erro ao criar movimentação:', error)

    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json({ success: false, message: 'Dados inválidos', details: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 })
  }
}
