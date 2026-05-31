import { NextRequest, NextResponse } from 'next/server'

import { getCurrentSession } from '@/lib/auth'
import { canViewSpace } from '@/lib/space-access'
import { parseAmountFilterParam } from '@/lib/transaction-filter-utils'

import { TransactionService } from '@/services/transaction-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const spaceId = searchParams.get('spaceId')
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const reserveId = searchParams.get('reserveId')
    const tags = searchParams.get('tags')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const amountFrom = parseAmountFilterParam(searchParams.get('amountFrom'))
    const amountTo = parseAmountFilterParam(searchParams.get('amountTo'))
    const search = searchParams.get('search')

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
      userId: spaceId && hasSpaceAccess ? undefined : userId || session.user.id,
      type: (type as any) || undefined,
      category: category || undefined,
      reserveId: reserveId || undefined,
      tags: tags ? tags.split(',') : undefined,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      amountFrom,
      amountTo,
      search: search || undefined,
    }

    const summary = await TransactionService.getSummary(filters)

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Erro ao buscar resumo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
