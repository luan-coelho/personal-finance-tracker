import { NextRequest, NextResponse } from 'next/server'

import { updateTransactionSchema } from '@/app/db/schemas'

import { auth } from '@/lib/auth'

import { TransactionService } from '@/services/transaction-service'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const transaction = await TransactionService.findById(id)

    if (!transaction) {
      return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 })
    }

    // Verificar se o usuário tem acesso à transação
    if (transaction.userId !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Erro ao buscar transação:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Converter string de data para Date se necessário
    if (body.date && typeof body.date === 'string') {
      body.date = new Date(body.date)
    }

    // Verificar se a transação existe e pertence ao usuário
    const existingTransaction = await TransactionService.findById(id)
    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 })
    }

    if (existingTransaction.userId !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Validar dados de entrada
    const validatedData = updateTransactionSchema.parse({ id, ...body })

    const transaction = await TransactionService.update(id, validatedData)

    if (!transaction) {
      return NextResponse.json({ error: 'Erro ao atualizar transação' }, { status: 400 })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Erro ao atualizar transação:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Verificar se a transação existe e pertence ao usuário
    const existingTransaction = await TransactionService.findById(id)
    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 })
    }

    if (existingTransaction.userId !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const success = await TransactionService.delete(id)

    if (!success) {
      return NextResponse.json({ error: 'Erro ao deletar transação' }, { status: 400 })
    }

    return NextResponse.json({ message: 'Transação deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar transação:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
