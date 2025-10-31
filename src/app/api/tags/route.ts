import { NextRequest, NextResponse } from 'next/server'

import { insertTagSchema } from '@/app/db/schemas/tag-schema'

import { auth } from '@/lib/auth'
import { canManageSpace } from '@/lib/space-access'

import { TagService } from '@/services/tag-service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const spaceId = searchParams.get('spaceId')
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
      search: search || undefined,
    }

    const tags = await TagService.findMany(filters)

    return NextResponse.json(tags)
  } catch (error) {
    console.error('Erro ao buscar tags:', error)
    return NextResponse.json({ error: 'Erro ao buscar tags' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = insertTagSchema.parse(body)

    // Verificar acesso ao espaço
    if (session.user.email) {
      const hasAccess = await canManageSpace(session.user.email, validatedData.spaceId)
      if (!hasAccess) {
        return NextResponse.json({ error: 'Acesso negado ao espaço' }, { status: 403 })
      }
    }

    // Verificar se tag já existe
    const exists = await TagService.exists(validatedData.spaceId, validatedData.name)
    if (exists) {
      return NextResponse.json({ error: 'Já existe uma tag com este nome' }, { status: 400 })
    }

    const tag = await TagService.create(validatedData)

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar tag:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro ao criar tag' }, { status: 500 })
  }
}
