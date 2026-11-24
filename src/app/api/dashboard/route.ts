import { type NextRequest, NextResponse } from 'next/server'

import { getCurrentSession } from '@/lib/auth'
import { canViewSpace } from '@/lib/space-access'

import { DashboardService } from '@/services/dashboard-service'

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession()
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

    // Mês no formato YYYY-MM, de 01 a 12
    if (!MONTH_PATTERN.test(month)) {
      return NextResponse.json({ error: 'Formato do mês deve ser YYYY-MM' }, { status: 400 })
    }

    // Verificar acesso ao espaço
    const hasAccess = await canViewSpace(session.user.email, spaceId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado ao espaço' }, { status: 403 })
    }

    const overview = await DashboardService.getOverview(spaceId, month)

    return NextResponse.json(overview)
  } catch (error) {
    console.error('Erro ao buscar painel do mês:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
