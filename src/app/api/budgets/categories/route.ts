import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { canViewSpace } from '@/lib/space-access'

import { BudgetService } from '@/services/budget-service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const spaceId = searchParams.get('spaceId')
    const month = searchParams.get('month')

    if (!spaceId) {
      return NextResponse.json({ error: 'ID do espaço é obrigatório' }, { status: 400 })
    }

    if (!month) {
      return NextResponse.json({ error: 'Mês é obrigatório' }, { status: 400 })
    }

    // Verificar se o mês está no formato correto
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: 'Formato do mês deve ser YYYY-MM' }, { status: 400 })
    }

    // Verificar acesso ao espaço
    const hasAccess = await canViewSpace(session.user.email, spaceId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado ao espaço' }, { status: 403 })
    }

    const categories = await BudgetService.getBudgetCategories(spaceId, month)

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Erro ao buscar categorias de orçamento:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
