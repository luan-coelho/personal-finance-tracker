import { NextRequest, NextResponse } from 'next/server'

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
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

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
