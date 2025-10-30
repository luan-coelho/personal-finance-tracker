import { NextRequest, NextResponse } from 'next/server'

import { updateBudgetSchema } from '@/app/db/schemas/budget-schema'

import { auth } from '@/lib/auth'
import { canEditSpace, canViewSpace } from '@/lib/space-access'

import { BudgetService } from '@/services/budget-service'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    const budget = await BudgetService.findById(id)
    if (!budget) {
      return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
    }

    // Verificar acesso ao espaço
    const hasAccess = await canViewSpace(session.user.email, budget.spaceId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado ao espaço' }, { status: 403 })
    }

    return NextResponse.json(budget)
  } catch (error) {
    console.error('Erro ao buscar orçamento:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Buscar orçamento existente
    const existingBudget = await BudgetService.findById(id)
    if (!existingBudget) {
      return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
    }

    // Verificar se o usuário pode editar o espaço
    const canEdit = await canEditSpace(session.user.email, existingBudget.spaceId)
    if (!canEdit) {
      return NextResponse.json({ error: 'Sem permissão para editar orçamentos neste espaço' }, { status: 403 })
    }

    // Validar dados de entrada
    const validatedData = updateBudgetSchema.parse(body)

    // Se está mudando categoria ou mês, verificar se não há conflito
    if (validatedData.category || validatedData.month) {
      const categoryToCheck = validatedData.category || existingBudget.category
      const monthToCheck = validatedData.month || existingBudget.month

      const conflictBudget = await BudgetService.findByCategoryAndMonth(
        existingBudget.spaceId,
        categoryToCheck,
        monthToCheck,
      )

      if (conflictBudget && conflictBudget.id !== id) {
        return NextResponse.json(
          { error: 'Já existe um orçamento para esta categoria no mês selecionado' },
          { status: 409 },
        )
      }
    }

    const updatedBudget = await BudgetService.update(id, validatedData)
    if (!updatedBudget) {
      return NextResponse.json({ error: 'Erro ao atualizar orçamento' }, { status: 500 })
    }

    return NextResponse.json(updatedBudget)
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Buscar orçamento existente
    const existingBudget = await BudgetService.findById(id)
    if (!existingBudget) {
      return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
    }

    // Verificar se o usuário pode editar o espaço
    const canEdit = await canEditSpace(session.user.email, existingBudget.spaceId)
    if (!canEdit) {
      return NextResponse.json({ error: 'Sem permissão para deletar orçamentos neste espaço' }, { status: 403 })
    }

    const deleted = await BudgetService.delete(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Erro ao deletar orçamento' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Orçamento deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar orçamento:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
