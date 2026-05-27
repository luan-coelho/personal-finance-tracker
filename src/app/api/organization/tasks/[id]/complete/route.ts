import { NextRequest, NextResponse } from 'next/server'

import { getCurrentSession } from '@/lib/auth'
import { canWriteOrganizationItem } from '@/lib/organization-access'
import { canManageSpace, canViewSpace } from '@/lib/space-access'

import { OrganizationTaskService } from '@/services/organization-task-service'

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

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const { id } = await params
    const existingTask = await OrganizationTaskService.findById(id)
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

    const task = await OrganizationTaskService.complete(id)
    if (!task) {
      return NextResponse.json({ error: 'Tarefa nao encontrada' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Erro ao concluir tarefa de organizacao:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
