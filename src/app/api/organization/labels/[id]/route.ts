import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

import { updateOrganizationLabelSchema } from '@/app/db/schemas/organization-label-schema'

import { getCurrentSession } from '@/lib/auth'
import { canManageSpace, canViewSpace } from '@/lib/space-access'

import { OrganizationLabelService } from '@/services/organization-label-service'

interface RouteParams {
  params: Promise<{ id: string }>
}

async function getSessionUser() {
  const session = await getCurrentSession()

  if (!session?.user?.id || !session.user.email) {
    return null
  }

  return {
    id: session.user.id,
    email: session.user.email,
  }
}

function validationErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: error.issues[0]?.message || 'Dados invalidos' }, { status: 400 })
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })
  }

  return null
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const { id } = await params
    const label = await OrganizationLabelService.findById(id)
    if (!label) {
      return NextResponse.json({ error: 'Etiqueta nao encontrada' }, { status: 404 })
    }

    const hasAccess = await canViewSpace(sessionUser.email, label.spaceId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado ao espaco' }, { status: 403 })
    }

    return NextResponse.json(label)
  } catch (error) {
    console.error('Erro ao buscar etiqueta de organizacao:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const { id } = await params
    const existingLabel = await OrganizationLabelService.findById(id)
    if (!existingLabel) {
      return NextResponse.json({ error: 'Etiqueta nao encontrada' }, { status: 404 })
    }

    const canManage = await canManageSpace(sessionUser.email, existingLabel.spaceId)
    if (!canManage) {
      return NextResponse.json({ error: 'Acesso negado ao espaco' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateOrganizationLabelSchema.parse({ ...body, id })
    const label = await OrganizationLabelService.update(id, validatedData)

    if (!label) {
      return NextResponse.json({ error: 'Etiqueta nao encontrada' }, { status: 404 })
    }

    return NextResponse.json(label)
  } catch (error) {
    console.error('Erro ao atualizar etiqueta de organizacao:', error)

    const validationResponse = validationErrorResponse(error)
    if (validationResponse) {
      return validationResponse
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const { id } = await params
    const existingLabel = await OrganizationLabelService.findById(id)
    if (!existingLabel) {
      return NextResponse.json({ error: 'Etiqueta nao encontrada' }, { status: 404 })
    }

    const canManage = await canManageSpace(sessionUser.email, existingLabel.spaceId)
    if (!canManage) {
      return NextResponse.json({ error: 'Acesso negado ao espaco' }, { status: 403 })
    }

    await OrganizationLabelService.delete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar etiqueta de organizacao:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
