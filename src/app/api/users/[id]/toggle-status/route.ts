import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { db } from '@/app/db'
import { usersTable } from '@/app/db/schemas/user-schema'

import { auth } from '@/lib/auth'

const toggleStatusSchema = z.object({
  active: z.boolean(),
})

// PATCH /api/users/[id]/toggle-status - Toggle user active status
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verificar se o usuário está autenticado
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Acesso negado. Faça login para continuar.',
        },
        { status: 401 },
      )
    }

    const { id } = await params
    const body = await request.json()

    // Validate data
    const { active } = toggleStatusSchema.parse(body)

    // Verificar se o usuário existe
    const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1)

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: 'Usuário não encontrado',
        },
        { status: 404 },
      )
    }

    // Verificar se não está tentando desativar a si mesmo
    if (session.user.id === id && !active) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'Você não pode desativar sua própria conta',
        },
        { status: 403 },
      )
    }

    // Atualizar status do usuário
    const [updatedUser] = await db
      .update(usersTable)
      .set({
        active,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, id))
      .returning()

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: active ? 'Usuário ativado com sucesso' : 'Usuário desativado com sucesso',
    })
  } catch (error) {
    console.error('Error toggling user status:', error)

    // Zod validation error
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid data',
          message: 'Dados inválidos fornecidos',
          details: error.message,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Não foi possível alterar o status do usuário',
      },
      { status: 500 },
    )
  }
}
