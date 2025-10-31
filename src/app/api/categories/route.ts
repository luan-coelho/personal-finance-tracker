import { NextRequest, NextResponse } from 'next/server'

import { insertCategorySchema } from '@/app/db/schemas/category-schema'

import { auth } from '@/lib/auth'
import { canManageSpace } from '@/lib/space-access'

import { CategoryService } from '@/services/category-service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const spaceId = searchParams.get('spaceId')
    const type = searchParams.get('type') as 'entrada' | 'saida' | null
    const search = searchParams.get('search')

    if (!spaceId) {
      return NextResponse.json({ error: 'spaceId é obrigatório' }, { status: 400 })
    }

    // Verificar acesso ao espaço
    if (session.user.email) {
      const hasAccess = await canManageSpace(session.user.email, spaceId)
      if (!hasAccess) {
        return NextResponse.json({ error: 'Acesso negado ao espaço' }, { status: 403 })
      }
    }

    const filters = {
      spaceId,
      type: type || undefined,
      search: search || undefined,
    }

    const categories = await CategoryService.findMany(filters)

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return NextResponse.json({ error: 'Erro ao buscar categorias' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = insertCategorySchema.parse(body)

    // Verificar acesso ao espaço
    if (session.user.email) {
      const hasAccess = await canManageSpace(session.user.email, validatedData.spaceId)
      if (!hasAccess) {
        return NextResponse.json({ error: 'Acesso negado ao espaço' }, { status: 403 })
      }
    }

    // Verificar se categoria já existe
    const exists = await CategoryService.exists(validatedData.spaceId, validatedData.name, validatedData.type)
    if (exists) {
      return NextResponse.json({ error: 'Já existe uma categoria com este nome' }, { status: 400 })
    }

    const category = await CategoryService.create(validatedData)

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro ao criar categoria' }, { status: 500 })
  }
}
