import { NextRequest, NextResponse } from 'next/server'

import {
  bodyRequestsValue,
  parseUuid,
  sanitizeUpdateData,
  validationErrorResponse,
} from '@/app/api/organization/_utils'
import { updateOrganizationProjectSchema } from '@/app/db/schemas/organization-project-schema'

import { getCurrentSession } from '@/lib/auth'
import { canWriteOrganizationItem } from '@/lib/organization-access'
import { canManageSpace, canViewSpace } from '@/lib/space-access'

import { OrganizationProjectService } from '@/services/organization-project-service'

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
    const { searchParams } = new URL(request.url)
    const spaceId = searchParams.get('spaceId')
    const parsedId = parseUuid(id, 'id')

    if (!spaceId) {
      return NextResponse.json({ error: 'spaceId e obrigatorio' }, { status: 400 })
    }

    const parsedSpaceId = parseUuid(spaceId, 'spaceId')
    const hasAccess = await canViewSpace(sessionUser.email, parsedSpaceId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado ao espaco' }, { status: 403 })
    }

    const project = await OrganizationProjectService.findByIdForUser(parsedId, parsedSpaceId, sessionUser.id)
    if (!project) {
      return NextResponse.json({ error: 'Projeto nao encontrado' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Erro ao buscar projeto de organizacao:', error)

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
    const existingProject = await OrganizationProjectService.findById(parsedId)
    if (!existingProject) {
      return NextResponse.json({ error: 'Projeto nao encontrado' }, { status: 404 })
    }

    const hasAccess = await canViewSpace(sessionUser.email, existingProject.spaceId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado ao espaco' }, { status: 403 })
    }

    const canEditSpace = await canManageSpace(sessionUser.email, existingProject.spaceId)
    const canWrite = canWriteOrganizationItem(existingProject, sessionUser.id, canEditSpace)
    if (!canWrite) {
      return NextResponse.json({ error: 'Sem permissao para editar este item' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateOrganizationProjectSchema.parse({ ...body, id: parsedId })
    const updateData = sanitizeUpdateData(validatedData, body, ['id', 'spaceId', 'createdById'])

    if (bodyRequestsValue(body, 'visibility', 'shared') && !canEditSpace) {
      return NextResponse.json({ error: 'Sem permissao para editar este item' }, { status: 403 })
    }

    const project = await OrganizationProjectService.update(parsedId, updateData)
    if (!project) {
      return NextResponse.json({ error: 'Projeto nao encontrado' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Erro ao atualizar projeto de organizacao:', error)

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
    const existingProject = await OrganizationProjectService.findById(parsedId)
    if (!existingProject) {
      return NextResponse.json({ error: 'Projeto nao encontrado' }, { status: 404 })
    }

    const hasAccess = await canViewSpace(sessionUser.email, existingProject.spaceId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado ao espaco' }, { status: 403 })
    }

    const canEditSpace = await canManageSpace(sessionUser.email, existingProject.spaceId)
    const canWrite = canWriteOrganizationItem(existingProject, sessionUser.id, canEditSpace)
    if (!canWrite) {
      return NextResponse.json({ error: 'Sem permissao para editar este item' }, { status: 403 })
    }

    await OrganizationProjectService.archive(parsedId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao arquivar projeto de organizacao:', error)

    const validationResponse = validationErrorResponse(error)
    if (validationResponse) {
      return validationResponse
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
