import { NextRequest, NextResponse } from 'next/server'

import { parseUuid, sanitizeUpdateData, validationErrorResponse } from '@/app/api/organization/_utils'
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

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const { id } = await params
    const parsedId = parseUuid(id, 'id')
    const { searchParams } = new URL(request.url)
    const spaceId = searchParams.get('spaceId')

    if (!spaceId) {
      return NextResponse.json({ error: 'spaceId e obrigatorio' }, { status: 400 })
    }

    const parsedSpaceId = parseUuid(spaceId, 'spaceId')
    const hasAccess = await canViewSpace(sessionUser.email, parsedSpaceId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado ao espaco' }, { status: 403 })
    }

    const label = await OrganizationLabelService.findById(parsedId)
    if (!label || label.spaceId !== parsedSpaceId) {
      return NextResponse.json({ error: 'Etiqueta nao encontrada' }, { status: 404 })
    }

    return NextResponse.json(label)
  } catch (error) {
    console.error('Erro ao buscar etiqueta de organizacao:', error)

    const validationResponse = validationErrorResponse(error)
    if (validationResponse) {
      return validationResponse
    }

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
    const parsedId = parseUuid(id, 'id')
    const existingLabel = await OrganizationLabelService.findById(parsedId)
    if (!existingLabel) {
      return NextResponse.json({ error: 'Etiqueta nao encontrada' }, { status: 404 })
    }

    const canManage = await canManageSpace(sessionUser.email, existingLabel.spaceId)
    if (!canManage) {
      return NextResponse.json({ error: 'Acesso negado ao espaco' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateOrganizationLabelSchema.parse({ ...body, id: parsedId })
    const updateData = sanitizeUpdateData(validatedData, body, ['id', 'spaceId'])
    const label = await OrganizationLabelService.update(parsedId, updateData)

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
    const parsedId = parseUuid(id, 'id')
    const existingLabel = await OrganizationLabelService.findById(parsedId)
    if (!existingLabel) {
      return NextResponse.json({ error: 'Etiqueta nao encontrada' }, { status: 404 })
    }

    const canManage = await canManageSpace(sessionUser.email, existingLabel.spaceId)
    if (!canManage) {
      return NextResponse.json({ error: 'Acesso negado ao espaco' }, { status: 403 })
    }

    await OrganizationLabelService.delete(parsedId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar etiqueta de organizacao:', error)

    const validationResponse = validationErrorResponse(error)
    if (validationResponse) {
      return validationResponse
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
