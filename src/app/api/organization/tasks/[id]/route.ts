import { NextRequest, NextResponse } from 'next/server'

import {
  bodyRequestsValue,
  hasOwnField,
  parseUuid,
  sanitizeUpdateData,
  uuidValidationMessages,
  validateAssigneeForSpace,
  validateTaskParentReferences,
  validationErrorResponse,
} from '@/app/api/organization/_utils'
import { updateOrganizationTaskSchema } from '@/app/db/schemas/organization-task-schema'

import { getCurrentSession } from '@/lib/auth'
import { canWriteOrganizationItem } from '@/lib/organization-access'
import { canManageSpace, canViewSpace } from '@/lib/space-access'

import { OrganizationTaskService } from '@/services/organization-task-service'

interface RouteParams {
  params: Promise<{ id: string }>
}

const VALIDATION_MESSAGES = new Set([
  ...uuidValidationMessages,
  'Secao invalida para este espaco',
  'Projeto invalido para este espaco',
  'Etiqueta invalida para este espaco',
  'Responsavel invalido para este espaco',
  'Data e obrigatoria para tarefas recorrentes',
])

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

    const task = await OrganizationTaskService.findByIdWithDetailsForUser(parsedId, parsedSpaceId, sessionUser.id)
    if (!task) {
      return NextResponse.json({ error: 'Tarefa nao encontrada' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Erro ao buscar tarefa de organizacao:', error)

    const validationResponse = validationErrorResponse(error, VALIDATION_MESSAGES)
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
    const existingTask = await OrganizationTaskService.findById(parsedId)
    if (!existingTask) {
      return NextResponse.json({ error: 'Tarefa nao encontrada' }, { status: 404 })
    }

    const hasAccess = await canViewSpace(sessionUser.email, existingTask.spaceId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado ao espaco' }, { status: 403 })
    }

    const canEditSpace = await canManageSpace(sessionUser.email, existingTask.spaceId)
    const canWrite = canWriteOrganizationItem(existingTask, sessionUser.id, canEditSpace)
    if (!canWrite) {
      return NextResponse.json({ error: 'Sem permissao para editar este item' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateOrganizationTaskSchema.parse({ ...body, id: parsedId })
    const updateData = sanitizeUpdateData(validatedData, body, ['id', 'spaceId', 'createdById'])

    if (bodyRequestsValue(body, 'visibility', 'shared') && !canEditSpace) {
      return NextResponse.json({ error: 'Sem permissao para editar este item' }, { status: 403 })
    }

    const hasProjectUpdate = hasOwnField(updateData, 'projectId')
    const hasSectionUpdate = hasOwnField(updateData, 'sectionId')
    const hasAssigneeUpdate = hasOwnField(updateData, 'assigneeId')
    const effectiveVisibility = updateData.visibility ?? existingTask.visibility
    const effectiveProjectId = hasProjectUpdate ? updateData.projectId : existingTask.projectId
    const effectiveSectionId =
      hasProjectUpdate && updateData.projectId === null
        ? null
        : hasSectionUpdate
          ? updateData.sectionId
          : existingTask.sectionId

    if (hasAssigneeUpdate) {
      await validateAssigneeForSpace(updateData.assigneeId, existingTask.spaceId)
    }

    if (hasProjectUpdate || hasSectionUpdate || effectiveVisibility === 'shared') {
      await validateTaskParentReferences({
        spaceId: existingTask.spaceId,
        userId: sessionUser.id,
        visibility: effectiveVisibility,
        projectId: effectiveProjectId,
        sectionId: effectiveSectionId,
      })
    }

    const task = await OrganizationTaskService.update(parsedId, updateData)
    if (!task) {
      return NextResponse.json({ error: 'Tarefa nao encontrada' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Erro ao atualizar tarefa de organizacao:', error)

    const validationResponse = validationErrorResponse(error, VALIDATION_MESSAGES)
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
    const existingTask = await OrganizationTaskService.findById(parsedId)
    if (!existingTask) {
      return NextResponse.json({ error: 'Tarefa nao encontrada' }, { status: 404 })
    }

    const hasAccess = await canViewSpace(sessionUser.email, existingTask.spaceId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado ao espaco' }, { status: 403 })
    }

    const canEditSpace = await canManageSpace(sessionUser.email, existingTask.spaceId)
    const canWrite = canWriteOrganizationItem(existingTask, sessionUser.id, canEditSpace)
    if (!canWrite) {
      return NextResponse.json({ error: 'Sem permissao para editar este item' }, { status: 403 })
    }

    await OrganizationTaskService.archive(parsedId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao arquivar tarefa de organizacao:', error)

    const validationResponse = validationErrorResponse(error, VALIDATION_MESSAGES)
    if (validationResponse) {
      return validationResponse
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
