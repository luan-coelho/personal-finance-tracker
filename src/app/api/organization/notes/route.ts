import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

import { insertOrganizationNoteSchema } from '@/app/db/schemas/organization-note-schema'

import { getCurrentSession } from '@/lib/auth'
import { canManageSpace, canViewSpace } from '@/lib/space-access'

import { OrganizationNoteService } from '@/services/organization-note-service'

const VALIDATION_MESSAGES = new Set([
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

function validationErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: error.issues[0]?.message || 'Dados invalidos' }, { status: 400 })
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })
  }

  if (error instanceof Error && VALIDATION_MESSAGES.has(error.message)) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return null
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

    const hasAccess = await canViewSpace(sessionUser.email, spaceId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado ao espaco' }, { status: 403 })
    }

    const notes = await OrganizationNoteService.findMany({
      spaceId,
      userId: sessionUser.id,
      projectId: searchParams.get('projectId') || undefined,
      taskId: searchParams.get('taskId') || undefined,
      search: searchParams.get('search') || undefined,
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Erro ao buscar notas de organizacao:', error)
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

    const validationResponse = validationErrorResponse(error)
    if (validationResponse) {
      return validationResponse
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
