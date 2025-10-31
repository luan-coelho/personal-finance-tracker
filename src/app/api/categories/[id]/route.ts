import { NextRequest, NextResponse } from 'next/server'

import { updateCategorySchema } from '@/app/db/schemas/category-schema'

import { auth } from '@/lib/auth'
import { canManageSpace } from '@/lib/space-access'

import { CategoryService } from '@/services/category-service'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    const category = await CategoryService.findById(id)

    if (!category) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 })
    }

    // Verificar acesso ao espaço
    if (session.user.email) {
      const hasAccess = await canManageSpace(session.user.email, category.spaceId)
      if (!hasAccess) {
        return NextResponse.json({ error: 'Acesso negado ao espaço' }, { status: 403 })
      }
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Erro ao buscar categoria:', error)
    return NextResponse.json({ error: 'Erro ao buscar categoria' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    const body = await request.json()
    const validatedData = updateCategorySchema.parse({ ...body, id })

    // Buscar categoria existente
    const existingCategory = await CategoryService.findById(id)
    if (!existingCategory) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 })
    }

    // Verificar acesso ao espaço
    if (session.user.email) {
      const hasAccess = await canManageSpace(session.user.email, existingCategory.spaceId)
      if (!hasAccess) {
        return NextResponse.json({ error: 'Acesso negado ao espaço' }, { status: 403 })
      }
    }

    // Verificar se novo nome já existe (se nome foi alterado)
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const exists = await CategoryService.exists(
        existingCategory.spaceId,
        validatedData.name,
        validatedData.type || existingCategory.type,
        id,
      )
      if (exists) {
        return NextResponse.json({ error: 'Já existe uma categoria com este nome' }, { status: 400 })
      }
    }

    const category = await CategoryService.update(id, validatedData)

    return NextResponse.json(category)
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro ao atualizar categoria' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Buscar categoria existente
    const existingCategory = await CategoryService.findById(id)
    if (!existingCategory) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 })
    }

    // Verificar acesso ao espaço
    if (session.user.email) {
      const hasAccess = await canManageSpace(session.user.email, existingCategory.spaceId)
      if (!hasAccess) {
        return NextResponse.json({ error: 'Acesso negado ao espaço' }, { status: 403 })
      }
    }

    await CategoryService.delete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar categoria:', error)
    return NextResponse.json({ error: 'Erro ao deletar categoria' }, { status: 500 })
  }
}
