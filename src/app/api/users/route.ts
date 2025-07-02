import { asc, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import { insertUserSchema, usersTable } from '@/app/db/schemas/user-schema'

import { auth } from '@/lib/auth'

// GET /api/users - List all users
export async function GET() {
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

    const allUsers = await db.select().from(usersTable).orderBy(asc(usersTable.name))

    return NextResponse.json({
      success: true,
      data: allUsers,
      message: 'Usuários listados com sucesso',
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Não foi possível carregar os usuários',
      },
      { status: 500 },
    )
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
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

    const body = await request.json()

    // Validate data using Zod schema
    const validatedData = insertUserSchema.parse(body)

    // Verificar se já existe um usuário com o mesmo email
    const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, validatedData.email)).limit(1)

    if (existingUser.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conflict',
          message: 'Já existe um usuário com este e-mail',
        },
        { status: 409 },
      )
    }

    // Insert into database
    const [newUser] = await db
      .insert(usersTable)
      .values({
        name: validatedData.name,
        email: validatedData.email,
        active: validatedData.active,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return NextResponse.json(
      {
        success: true,
        data: newUser,
        message: 'Usuário criado com sucesso',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating user:', error)

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
        message: 'Não foi possível criar o usuário',
      },
      { status: 500 },
    )
  }
}
