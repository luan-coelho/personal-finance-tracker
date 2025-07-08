import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

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
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const filters = {
      spaceId: spaceId || undefined,
      userId: userId || session.user.id,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    }

    const summary = await TransactionService.getSummary(filters)

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Erro ao buscar resumo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
