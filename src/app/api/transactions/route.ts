import { NextRequest, NextResponse } from 'next/server'

import { insertTransactionSchema } from '@/app/db/schemas'

import { auth } from '@/lib/auth'
import { canViewSpace } from '@/lib/space-access'

import { TransactionService } from '@/services/transaction-service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const spaceId = searchParams.get('spaceId')
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') as 'entrada' | 'saida' | 'reserva' | null
    const category = searchParams.get('category')
    const reserveId = searchParams.get('reserveId')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Verificar acesso ao espaço se spaceId for fornecido
    let hasSpaceAccess = false
    if (spaceId && session.user.email) {
      hasSpaceAccess = await canViewSpace(session.user.email, spaceId)
      if (!hasSpaceAccess) {
        return NextResponse.json({ error: 'Acesso negado ao espaço' }, { status: 403 })
      }
    }

    const filters = {
      spaceId: spaceId || undefined,
      // Se tem acesso ao espaço, não filtrar por userId para mostrar todas as transações do espaço
      // Se não tem spaceId ou não tem acesso, filtrar por userId
      userId: spaceId && hasSpaceAccess ? undefined : userId || session.user.id,
      type: type || undefined,
      category: category || undefined,
      reserveId: reserveId || undefined,
      tags: tags || undefined,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      search: search || undefined,
    }

    const result = await TransactionService.findMany(filters, page, limit)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro ao buscar transações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()

    // Converter string de data para Date se necessário
    if (body.date && typeof body.date === 'string') {
      body.date = new Date(body.date)
    }

    // Validar dados de entrada
    const validatedData = insertTransactionSchema.parse(body)

    // Verificar se o usuário tem acesso ao espaço e pode editar
    const { canEditSpace } = await import('@/lib/space-access')
    const canEdit = await canEditSpace(session.user.email, validatedData.spaceId)

    if (!canEdit) {
      return NextResponse.json({ error: 'Sem permissão para criar transações neste espaço' }, { status: 403 })
    }

    const transaction = await TransactionService.create(validatedData)

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar transação:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
