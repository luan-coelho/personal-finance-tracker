import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

import { insertOrganizationLabelSchema } from '@/app/db/schemas/organization-label-schema'

import { getCurrentSession } from '@/lib/auth'
import { canManageSpace, canViewSpace } from '@/lib/space-access'

import { OrganizationLabelService } from '@/services/organization-label-service'

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

    const hasAccess = await canViewSpace(sessionUser.email, spaceId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado ao espaco' }, { status: 403 })
    }

    const labels = await OrganizationLabelService.findMany({
      spaceId,
      search,
    })

    return NextResponse.json(labels)
  } catch (error) {
    console.error('Erro ao buscar etiquetas de organizacao:', error)
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
    const validatedData = insertOrganizationLabelSchema.parse(body)

    const canManage = await canManageSpace(sessionUser.email, validatedData.spaceId)
    if (!canManage) {
      return NextResponse.json({ error: 'Acesso negado ao espaco' }, { status: 403 })
    }

    const label = await OrganizationLabelService.create(validatedData)

    return NextResponse.json(label, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar etiqueta de organizacao:', error)

    const validationResponse = validationErrorResponse(error)
    if (validationResponse) {
      return validationResponse
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
