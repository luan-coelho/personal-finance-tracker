import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import { insertReserveSchema, reservesTable } from '@/app/db/schemas/reserve-schema'
import { usersTable } from '@/app/db/schemas/user-schema'

import { auth } from '@/lib/auth'
import { canEditSpace } from '@/lib/space-access'

// GET /api/reserves - Listar reservas (por espaço)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const spaceId = searchParams.get('spaceId')

    if (!spaceId) {
      return NextResponse.json({ success: false, message: 'spaceId é obrigatório' }, { status: 400 })
    }

    // Verificar acesso ao espaço
    const { canViewSpace } = await import('@/lib/space-access')
    const canView = await canViewSpace(session.user.email, spaceId)

    if (!canView) {
      return NextResponse.json({ success: false, message: 'Sem permissão para acessar este espaço' }, { status: 403 })
    }

    // Buscar reservas do espaço
    const reserves = await db
      .select()
      .from(reservesTable)
      .where(eq(reservesTable.spaceId, spaceId))
      .orderBy(reservesTable.createdAt)

    return NextResponse.json({
      success: true,
      data: reserves,
      message: 'Reservas listadas com sucesso',
    })
  } catch (error) {
    console.error('Erro ao buscar reservas:', error)
    return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/reserves - Criar nova reserva
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()

    // Validar dados
    const validatedData = insertReserveSchema.parse(body)

    // Verificar se o usuário pode editar o espaço
    const canEdit = await canEditSpace(session.user.email, validatedData.spaceId)

    if (!canEdit) {
      return NextResponse.json(
        { success: false, message: 'Sem permissão para criar reservas neste espaço' },
        { status: 403 },
      )
    }

    // Criar reserva
    const [newReserve] = await db.insert(reservesTable).values(validatedData).returning()

    return NextResponse.json(
      {
        success: true,
        data: newReserve,
        message: 'Reserva criada com sucesso',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Erro ao criar reserva:', error)

    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json({ success: false, message: 'Dados inválidos', details: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 })
  }
}
