import { NextRequest, NextResponse } from 'next/server'

import {
  parseOptionalUuid,
  parseUuid,
  uuidValidationMessages,
  validateAssigneeForSpace,
  validateTaskParentReferences,
  validationErrorResponse,
} from '@/app/api/organization/_utils'
import type { OrganizationVisibility } from '@/app/db/schemas/organization-project-schema'
import { insertOrganizationTaskSchema, type OrganizationTaskStatus } from '@/app/db/schemas/organization-task-schema'

import { getCurrentSession } from '@/lib/auth'
import { canManageSpace, canViewSpace } from '@/lib/space-access'

import { OrganizationTaskService } from '@/services/organization-task-service'

const TASK_STATUSES: OrganizationTaskStatus[] = ['pending', 'completed', 'archived']
const VISIBILITIES: OrganizationVisibility[] = ['shared', 'personal']
const VALIDATION_MESSAGES = new Set([
  ...uuidValidationMessages,
  'status invalido',
  'visibility invalida',
  'dateFrom invalida',
  'dateTo invalida',
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

function parseStatus(value: string | null): OrganizationTaskStatus | undefined {
  if (!value) return undefined
  if (TASK_STATUSES.includes(value as OrganizationTaskStatus)) return value as OrganizationTaskStatus
  throw new Error('status invalido')
}

function parseVisibility(value: string | null): OrganizationVisibility | undefined {
  if (!value) return undefined
  if (VISIBILITIES.includes(value as OrganizationVisibility)) return value as OrganizationVisibility
  throw new Error('visibility invalida')
}

function parseDateParam(value: string | null, name: 'dateFrom' | 'dateTo'): Date | undefined {
  if (!value) return undefined

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${name} invalida`)
  }

  return date
}

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

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

    const tasks = await OrganizationTaskService.findMany({
      spaceId: parsedSpaceId,
      userId: sessionUser.id,
      status: parseStatus(searchParams.get('status')),
      projectId: parseOptionalUuid(searchParams.get('projectId'), 'projectId'),
      sectionId: parseOptionalUuid(searchParams.get('sectionId'), 'sectionId'),
      assigneeId: parseOptionalUuid(searchParams.get('assigneeId'), 'assigneeId'),
      labelId: parseOptionalUuid(searchParams.get('labelId'), 'labelId'),
      visibility: parseVisibility(searchParams.get('visibility')),
      dateFrom: parseDateParam(searchParams.get('dateFrom'), 'dateFrom'),
      dateTo: parseDateParam(searchParams.get('dateTo'), 'dateTo'),
      search: searchParams.get('search') || undefined,
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Erro ao buscar tarefas de organizacao:', error)

    const validationResponse = validationErrorResponse(error, VALIDATION_MESSAGES)
    if (validationResponse) {
      return validationResponse
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = insertOrganizationTaskSchema.parse({
      ...body,
      createdById: sessionUser.id,
    })

    const hasAccess = await canViewSpace(sessionUser.email, validatedData.spaceId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado ao espaco' }, { status: 403 })
    }

    if (validatedData.visibility === 'shared') {
      const canManage = await canManageSpace(sessionUser.email, validatedData.spaceId)
      if (!canManage) {
        return NextResponse.json({ error: 'Sem permissao para editar este item' }, { status: 403 })
      }
    }

    await validateAssigneeForSpace(validatedData.assigneeId, validatedData.spaceId)
    await validateTaskParentReferences({
      spaceId: validatedData.spaceId,
      userId: sessionUser.id,
      visibility: validatedData.visibility,
      projectId: validatedData.projectId,
      sectionId: validatedData.sectionId,
    })

    const task = await OrganizationTaskService.create(validatedData)

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar tarefa de organizacao:', error)

    const validationResponse = validationErrorResponse(error, VALIDATION_MESSAGES)
    if (validationResponse) {
      return validationResponse
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
