import { NextRequest, NextResponse } from 'next/server'

import {
  bodyRequestsValue,
  parseUuid,
  sanitizeUpdateData,
  uuidValidationMessages,
  validationErrorResponse,
} from '@/app/api/organization/_utils'
import { updateOrganizationNoteSchema } from '@/app/db/schemas/organization-note-schema'

import { getCurrentSession } from '@/lib/auth'
import { canWriteOrganizationItem } from '@/lib/organization-access'
import { canManageSpace, canViewSpace } from '@/lib/space-access'

import { OrganizationNoteService } from '@/services/organization-note-service'

interface RouteParams {
  params: Promise<{ id: string }>
}

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

    const note = await OrganizationNoteService.findByIdForUser(parsedId, parsedSpaceId, sessionUser.id)
    if (!note) {
      return NextResponse.json({ error: 'Nota nao encontrada' }, { status: 404 })
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error('Erro ao buscar nota de organizacao:', error)

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
    const existingNote = await OrganizationNoteService.findById(parsedId)
    if (!existingNote) {
      return NextResponse.json({ error: 'Nota nao encontrada' }, { status: 404 })
    }

    const hasAccess = await canViewSpace(sessionUser.email, existingNote.spaceId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado ao espaco' }, { status: 403 })
    }

    const canEditSpace = await canManageSpace(sessionUser.email, existingNote.spaceId)
    const canWrite = canWriteOrganizationItem(existingNote, sessionUser.id, canEditSpace)
    if (!canWrite) {
      return NextResponse.json({ error: 'Sem permissao para editar este item' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateOrganizationNoteSchema.parse({ ...body, id: parsedId })
    const updateData = sanitizeUpdateData(validatedData, body, ['id', 'spaceId', 'createdById'])

    if (bodyRequestsValue(body, 'visibility', 'shared') && !canEditSpace) {
      return NextResponse.json({ error: 'Sem permissao para editar este item' }, { status: 403 })
    }

    const note = await OrganizationNoteService.update(parsedId, updateData)
    if (!note) {
      return NextResponse.json({ error: 'Nota nao encontrada' }, { status: 404 })
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error('Erro ao atualizar nota de organizacao:', error)

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
    const existingNote = await OrganizationNoteService.findById(parsedId)
    if (!existingNote) {
      return NextResponse.json({ error: 'Nota nao encontrada' }, { status: 404 })
    }

    const hasAccess = await canViewSpace(sessionUser.email, existingNote.spaceId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado ao espaco' }, { status: 403 })
    }

    const canEditSpace = await canManageSpace(sessionUser.email, existingNote.spaceId)
    const canWrite = canWriteOrganizationItem(existingNote, sessionUser.id, canEditSpace)
    if (!canWrite) {
      return NextResponse.json({ error: 'Sem permissao para editar este item' }, { status: 403 })
    }

    await OrganizationNoteService.archive(parsedId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao arquivar nota de organizacao:', error)

    const validationResponse = validationErrorResponse(error, VALIDATION_MESSAGES)
    if (validationResponse) {
      return validationResponse
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
