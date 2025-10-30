import { NextRequest, NextResponse } from 'next/server'

import { insertBudgetSchema } from '@/app/db/schemas/budget-schema'

import { auth } from '@/lib/auth'
import { canEditSpace, canViewSpace } from '@/lib/space-access'

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
    const category = searchParams.get('category')

    if (!spaceId) {
      return NextResponse.json({ error: 'ID do espaço é obrigatório' }, { status: 400 })
    }

    // Verificar acesso ao espaço
    const hasAccess = await canViewSpace(session.user.email, spaceId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado ao espaço' }, { status: 403 })
    }

    const filters = {
      spaceId,
      month: month || undefined,
      category: category || undefined,
    }

    const budgets = await BudgetService.findMany(filters)

    return NextResponse.json(budgets)
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()

    // Validar dados de entrada
    const validatedData = insertBudgetSchema.parse({
      ...body,
      createdById: session.user.id,
    })

    // Verificar se o usuário pode editar o espaço
    const canEdit = await canEditSpace(session.user.email, validatedData.spaceId)
    if (!canEdit) {
      return NextResponse.json({ error: 'Sem permissão para criar orçamentos neste espaço' }, { status: 403 })
    }

    // Verificar se já existe orçamento para esta categoria no mês
    const existingBudget = await BudgetService.findByCategoryAndMonth(
      validatedData.spaceId,
      validatedData.category,
      validatedData.month,
    )

    if (existingBudget) {
      return NextResponse.json(
        { error: 'Já existe um orçamento para esta categoria no mês selecionado' },
        { status: 409 },
      )
    }

    const budget = await BudgetService.create(validatedData)

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar orçamento:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
