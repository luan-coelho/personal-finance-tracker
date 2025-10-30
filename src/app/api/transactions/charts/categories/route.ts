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
    const type = searchParams.get('type') as 'entrada' | 'saida' | null

    if (!spaceId) {
      return NextResponse.json({ error: 'ID do espaço é obrigatório' }, { status: 400 })
    }

    // Verificar acesso ao espaço
    if (session.user.email) {
      const hasAccess = await canViewSpace(session.user.email, spaceId)
      if (!hasAccess) {
        return NextResponse.json({ error: 'Acesso negado ao espaço' }, { status: 403 })
      }
    }

    const chartData = await TransactionService.getCategoryChart(spaceId, type || undefined)

    return NextResponse.json(chartData)
  } catch (error) {
    console.error('Erro ao buscar dados do gráfico:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
