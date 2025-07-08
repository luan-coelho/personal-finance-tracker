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

    if (!spaceId) {
      return NextResponse.json({ error: 'ID do espaço é obrigatório' }, { status: 400 })
    }

    const tags = await TransactionService.getTags(spaceId)

    return NextResponse.json(tags)
  } catch (error) {
    console.error('Erro ao buscar tags:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
