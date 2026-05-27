import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

import { insertOrganizationProjectSectionSchema } from '@/app/db/schemas/organization-project-section-schema'

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

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const { id } = await params
    const project = await OrganizationProjectService.findById(id)
    if (!project) {
      return NextResponse.json({ error: 'Projeto nao encontrado' }, { status: 404 })
    }

    const hasAccess = await canViewSpace(sessionUser.email, project.spaceId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado ao espaco' }, { status: 403 })
    }

    const canEditSpace = await canManageSpace(sessionUser.email, project.spaceId)
    const canWrite = canWriteOrganizationItem(project, sessionUser.id, canEditSpace)
    if (!canWrite) {
      return NextResponse.json({ error: 'Sem permissao para editar este item' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = insertOrganizationProjectSectionSchema.parse({ ...body, projectId: id })
    const section = await OrganizationProjectService.createSection(validatedData)

    return NextResponse.json(section, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar secao de projeto de organizacao:', error)

    const validationResponse = validationErrorResponse(error)
    if (validationResponse) {
      return validationResponse
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
