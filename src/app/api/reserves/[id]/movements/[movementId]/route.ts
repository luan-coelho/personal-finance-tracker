import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import { reserveMovementsTable } from '@/app/db/schemas/reserve-movement-schema'
import { reservesTable } from '@/app/db/schemas/reserve-schema'

import { addAmounts, subtractAmounts } from '@/lib/amount-utils'
import { auth } from '@/lib/auth'
import { canEditSpace } from '@/lib/space-access'

interface RouteContext {
  params: Promise<{ id: string; movementId: string }>
}

// DELETE /api/reserves/[id]/movements/[movementId] - Excluir movimentação
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    const { id: reserveId, movementId } = await context.params

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    // Buscar movimentação
    const movement = await db.query.reserveMovementsTable.findFirst({
      where: eq(reserveMovementsTable.id, movementId),
    })

    if (!movement || movement.reserveId !== reserveId) {
      return NextResponse.json({ success: false, message: 'Movimentação não encontrada' }, { status: 404 })
    }

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
        { success: false, message: 'Sem permissão para excluir movimentações desta reserva' },
        { status: 403 },
      )
    }

    // Reverter valor da movimentação no saldo da reserva
    const newAmount =
      movement.type === 'deposit'
        ? subtractAmounts(reserve.currentAmount, movement.amount)
        : addAmounts(reserve.currentAmount, movement.amount)

    // Excluir movimentação e atualizar saldo atomicamente
    await db.transaction(async tx => {
      await tx.delete(reserveMovementsTable).where(eq(reserveMovementsTable.id, movementId))

      await tx
        .update(reservesTable)
        .set({
          currentAmount: newAmount,
          updatedAt: new Date(),
        })
        .where(eq(reservesTable.id, reserveId))
    })

    return NextResponse.json({
      success: true,
      message: 'Movimentação excluída com sucesso',
    })
  } catch (error) {
    console.error('Erro ao excluir movimentação:', error)
    return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 })
  }
}
