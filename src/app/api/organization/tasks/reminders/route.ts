import { NextRequest, NextResponse } from 'next/server'

import { parseUuid, validationErrorResponse } from '@/app/api/organization/_utils'
import { getCurrentSession } from '@/lib/auth'
import { canViewSpace } from '@/lib/space-access'

import { OrganizationTaskService } from '@/services/organization-task-service'

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

    const tasks = await OrganizationTaskService.findReminderCandidates(parsedSpaceId, sessionUser.id)

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Erro ao buscar lembretes de organizacao:', error)

    const validationResponse = validationErrorResponse(error)
    if (validationResponse) {
      return validationResponse
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
