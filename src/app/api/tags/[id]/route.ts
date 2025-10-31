import { NextRequest, NextResponse } from 'next/server'

import { updateTagSchema } from '@/app/db/schemas/tag-schema'

import { auth } from '@/lib/auth'
import { canManageSpace } from '@/lib/space-access'

import { TagService } from '@/services/tag-service'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const tag = await TagService.findById(id)

    if (!tag) {
      return NextResponse.json({ error: 'Tag não encontrada' }, { status: 404 })
    }

    // Verificar acesso ao espaço
    if (session.user.email) {
      const hasAccess = await canManageSpace(session.user.email, tag.spaceId)
      if (!hasAccess) {
        return NextResponse.json({ error: 'Acesso negado ao espaço' }, { status: 403 })
      }
    }

    return NextResponse.json(tag)
  } catch (error) {
    console.error('Erro ao buscar tag:', error)
    return NextResponse.json({ error: 'Erro ao buscar tag' }, { status: 500 })
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
    const validatedData = updateTagSchema.parse({ ...body, id })

    // Buscar tag existente
    const existingTag = await TagService.findById(id)
    if (!existingTag) {
      return NextResponse.json({ error: 'Tag não encontrada' }, { status: 404 })
    }

    // Verificar acesso ao espaço
    if (session.user.email) {
      const hasAccess = await canManageSpace(session.user.email, existingTag.spaceId)
      if (!hasAccess) {
        return NextResponse.json({ error: 'Acesso negado ao espaço' }, { status: 403 })
      }
    }

    // Verificar se novo nome já existe (se nome foi alterado)
    if (validatedData.name && validatedData.name !== existingTag.name) {
      const exists = await TagService.exists(existingTag.spaceId, validatedData.name, id)
      if (exists) {
        return NextResponse.json({ error: 'Já existe uma tag com este nome' }, { status: 400 })
      }
    }

    const tag = await TagService.update(id, validatedData)

    return NextResponse.json(tag)
  } catch (error) {
    console.error('Erro ao atualizar tag:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro ao atualizar tag' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    // Buscar tag existente
    const existingTag = await TagService.findById(id)
    if (!existingTag) {
      return NextResponse.json({ error: 'Tag não encontrada' }, { status: 404 })
    }

    // Verificar acesso ao espaço
    if (session.user.email) {
      const hasAccess = await canManageSpace(session.user.email, existingTag.spaceId)
      if (!hasAccess) {
        return NextResponse.json({ error: 'Acesso negado ao espaço' }, { status: 403 })
      }
    }

    await TagService.delete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar tag:', error)
    return NextResponse.json({ error: 'Erro ao deletar tag' }, { status: 500 })
  }
}
