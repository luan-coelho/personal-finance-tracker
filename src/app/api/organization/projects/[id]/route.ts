import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

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

function validationErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: error.issues[0]?.message || 'Dados invalidos' }, { status: 400 })
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })
  }

  return null
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

    if (!spaceId) {
      return NextResponse.json({ error: 'spaceId e obrigatorio' }, { status: 400 })
    }

    const hasAccess = await canViewSpace(sessionUser.email, spaceId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado ao espaco' }, { status: 403 })
    }

    const project = await OrganizationProjectService.findByIdForUser(id, spaceId, sessionUser.id)
    if (!project) {
      return NextResponse.json({ error: 'Projeto nao encontrado' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Erro ao buscar projeto de organizacao:', error)
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
    const existingProject = await OrganizationProjectService.findById(id)
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
    const validatedData = updateOrganizationProjectSchema.parse({ ...body, id })

    if (validatedData.visibility === 'shared' && existingProject.visibility === 'personal' && !canEditSpace) {
      return NextResponse.json({ error: 'Sem permissao para editar este item' }, { status: 403 })
    }

    const project = await OrganizationProjectService.update(id, validatedData)
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
    const existingProject = await OrganizationProjectService.findById(id)
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

    await OrganizationProjectService.archive(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao arquivar projeto de organizacao:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
