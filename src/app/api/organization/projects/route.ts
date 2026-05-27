import { NextRequest, NextResponse } from 'next/server'

import { parseUuid, validationErrorResponse } from '@/app/api/organization/_utils'
import { insertOrganizationProjectSchema } from '@/app/db/schemas/organization-project-schema'

import { getCurrentSession } from '@/lib/auth'
import { canManageSpace, canViewSpace } from '@/lib/space-access'

import { OrganizationProjectService } from '@/services/organization-project-service'

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
    const search = searchParams.get('search') || undefined

    if (!spaceId) {
      return NextResponse.json({ error: 'spaceId e obrigatorio' }, { status: 400 })
    }

    const parsedSpaceId = parseUuid(spaceId, 'spaceId')
    const hasAccess = await canViewSpace(sessionUser.email, parsedSpaceId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado ao espaco' }, { status: 403 })
    }

    const projects = await OrganizationProjectService.findMany({
      spaceId: parsedSpaceId,
      userId: sessionUser.id,
      search,
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Erro ao buscar projetos de organizacao:', error)

    const validationResponse = validationErrorResponse(error)
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
    const validatedData = insertOrganizationProjectSchema.parse({
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

    const project = await OrganizationProjectService.create(validatedData)

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar projeto de organizacao:', error)

    const validationResponse = validationErrorResponse(error)
    if (validationResponse) {
      return validationResponse
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
