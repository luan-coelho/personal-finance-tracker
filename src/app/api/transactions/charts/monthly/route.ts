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
    const year = searchParams.get('year')

    if (!spaceId) {
      return NextResponse.json({ error: 'ID do espaço é obrigatório' }, { status: 400 })
    }

    if (!year) {
      return NextResponse.json({ error: 'Ano é obrigatório' }, { status: 400 })
    }

    const yearNumber = parseInt(year)
    if (isNaN(yearNumber)) {
      return NextResponse.json({ error: 'Ano deve ser um número válido' }, { status: 400 })
    }

    const chartData = await TransactionService.getMonthlyChart(spaceId, yearNumber)

    return NextResponse.json(chartData)
  } catch (error) {
    console.error('Erro ao buscar dados do gráfico mensal:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
