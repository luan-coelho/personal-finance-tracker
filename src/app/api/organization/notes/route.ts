import { NextRequest, NextResponse } from 'next/server'

import {
  parseOptionalUuid,
  parseUuid,
  uuidValidationMessages,
  validationErrorResponse,
} from '@/app/api/organization/_utils'
import { insertOrganizationNoteSchema } from '@/app/db/schemas/organization-note-schema'

import { getCurrentSession } from '@/lib/auth'
import { canManageSpace, canViewSpace } from '@/lib/space-access'

import { OrganizationNoteService } from '@/services/organization-note-service'

const VALIDATION_MESSAGES = new Set([
  ...uuidValidationMessages,
  'Projeto invalido para este espaco',
  'Tarefa invalida para este espaco',
  'Tarefa invalida para este projeto',
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

    const notes = await OrganizationNoteService.findMany({
      spaceId: parsedSpaceId,
      userId: sessionUser.id,
      projectId: parseOptionalUuid(searchParams.get('projectId'), 'projectId'),
      taskId: parseOptionalUuid(searchParams.get('taskId'), 'taskId'),
      search: searchParams.get('search') || undefined,
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Erro ao buscar notas de organizacao:', error)

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
    const validatedData = insertOrganizationNoteSchema.parse({
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

    const note = await OrganizationNoteService.create(validatedData)

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar nota de organizacao:', error)

    const validationResponse = validationErrorResponse(error, VALIDATION_MESSAGES)
    if (validationResponse) {
      return validationResponse
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
