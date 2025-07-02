import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import { updateUserSchema, usersTable } from '@/app/db/schemas/user-schema'

import { auth } from '@/lib/auth'

// GET /api/users/[id] - Get user by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1)

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: 'Usuário não encontrado',
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: user,
      message: 'Usuário encontrado',
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Não foi possível carregar o usuário',
      },
      { status: 500 },
    )
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Validate data using Zod schema
    const validatedData = updateUserSchema.parse({ ...body, id })

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

    // Se o email foi alterado, verificar se não existe outro usuário com o mesmo email
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const [userWithSameEmail] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, validatedData.email))
        .limit(1)

      if (userWithSameEmail) {
        return NextResponse.json(
          {
            success: false,
            error: 'Conflict',
            message: 'Já existe um usuário com este e-mail',
          },
          { status: 409 },
        )
      }
    }

    // Update user
    const [updatedUser] = await db
      .update(usersTable)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, id))
      .returning()

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Usuário atualizado com sucesso',
    })
  } catch (error) {
    console.error('Error updating user:', error)

    // Zod validation error
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid data',
          message: 'Por favor, verifique os dados fornecidos',
          details: error.message,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Não foi possível atualizar o usuário',
      },
      { status: 500 },
    )
  }
}

// DELETE /api/users/[id] - Delete (deactivate) user
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Verificar se não está tentando deletar a si mesmo
    if (session.user.id === id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'Você não pode desativar sua própria conta',
        },
        { status: 403 },
      )
    }

    // Desativar usuário em vez de deletar
    const [deactivatedUser] = await db
      .update(usersTable)
      .set({
        active: false,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, id))
      .returning()

    return NextResponse.json({
      success: true,
      data: deactivatedUser,
      message: 'Usuário desativado com sucesso',
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Não foi possível desativar o usuário',
      },
      { status: 500 },
    )
  }
}
