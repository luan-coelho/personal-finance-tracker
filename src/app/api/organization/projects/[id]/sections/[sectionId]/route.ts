import { and, eq, isNull } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { parseUuid, sanitizeUpdateData, validationErrorResponse } from '@/app/api/organization/_utils'
import { db } from '@/app/db'
import {
  organizationProjectSectionsTable,
  updateOrganizationProjectSectionSchema,
} from '@/app/db/schemas/organization-project-section-schema'

import { getCurrentSession } from '@/lib/auth'
import { canWriteOrganizationItem } from '@/lib/organization-access'
import { canManageSpace, canViewSpace } from '@/lib/space-access'

import { OrganizationProjectService } from '@/services/organization-project-service'

interface RouteParams {
  params: Promise<{ id: string; sectionId: string }>
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

async function sectionExistsInProject(sectionId: string, projectId: string) {
  const [section] = await db
    .select({ id: organizationProjectSectionsTable.id })
    .from(organizationProjectSectionsTable)
    .where(
      and(
        eq(organizationProjectSectionsTable.id, sectionId),
        eq(organizationProjectSectionsTable.projectId, projectId),
        isNull(organizationProjectSectionsTable.archivedAt),
      ),
    )
    .limit(1)

  return !!section
}

async function ensureWritableProject(projectId: string, sessionUser: { id: string; email: string }) {
  const project = await OrganizationProjectService.findById(projectId)
  if (!project) {
    return { response: NextResponse.json({ error: 'Projeto nao encontrado' }, { status: 404 }) }
  }

  const hasAccess = await canViewSpace(sessionUser.email, project.spaceId)
  if (!hasAccess) {
    return { response: NextResponse.json({ error: 'Acesso negado ao espaco' }, { status: 403 }) }
  }

  const canEditSpace = await canManageSpace(sessionUser.email, project.spaceId)
  const canWrite = canWriteOrganizationItem(project, sessionUser.id, canEditSpace)
  if (!canWrite) {
    return { response: NextResponse.json({ error: 'Sem permissao para editar este item' }, { status: 403 }) }
  }

  return { project }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const { id, sectionId } = await params
    const parsedId = parseUuid(id, 'id')
    const parsedSectionId = parseUuid(sectionId, 'sectionId')
    const writableProject = await ensureWritableProject(parsedId, sessionUser)
    if ('response' in writableProject) {
      return writableProject.response
    }

    const belongsToProject = await sectionExistsInProject(parsedSectionId, parsedId)
    if (!belongsToProject) {
      return NextResponse.json({ error: 'Secao nao encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = updateOrganizationProjectSectionSchema.parse({
      ...body,
      id: parsedSectionId,
      projectId: parsedId,
    })
    const updateData = sanitizeUpdateData(validatedData, body, ['id', 'projectId'])
    const section = await OrganizationProjectService.updateSection(parsedSectionId, updateData)

    if (!section) {
      return NextResponse.json({ error: 'Secao nao encontrada' }, { status: 404 })
    }

    return NextResponse.json(section)
  } catch (error) {
    console.error('Erro ao atualizar secao de projeto de organizacao:', error)

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

    const { id, sectionId } = await params
    const parsedId = parseUuid(id, 'id')
    const parsedSectionId = parseUuid(sectionId, 'sectionId')
    const writableProject = await ensureWritableProject(parsedId, sessionUser)
    if ('response' in writableProject) {
      return writableProject.response
    }

    const belongsToProject = await sectionExistsInProject(parsedSectionId, parsedId)
    if (!belongsToProject) {
      return NextResponse.json({ error: 'Secao nao encontrada' }, { status: 404 })
    }

    await OrganizationProjectService.archiveSection(parsedSectionId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao arquivar secao de projeto de organizacao:', error)

    const validationResponse = validationErrorResponse(error)
    if (validationResponse) {
      return validationResponse
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
