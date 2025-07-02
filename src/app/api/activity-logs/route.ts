import { and, desc, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import { activityLogsTable, insertActivityLogSchema } from '@/app/db/schemas/activity-log-schema'
import { usersTable } from '@/app/db/schemas/user-schema'

import { auth } from '@/lib/auth'

// Função para obter IP do cliente
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const clientIp = forwarded?.split(',')[0] || realIp || 'unknown'
  return clientIp
}

// GET /api/activity-logs - List activity logs with pagination and filters
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Construir condições de filtro
    const conditions = []
    if (userId) {
      conditions.push(eq(activityLogsTable.userId, userId))
    }
    if (action) {
      conditions.push(eq(activityLogsTable.action, action))
    }

    // Query para buscar logs com join para nome do usuário
    const logsQuery = db
      .select({
        id: activityLogsTable.id,
        userId: activityLogsTable.userId,
        action: activityLogsTable.action,
        description: activityLogsTable.description,
        ipAddress: activityLogsTable.ipAddress,
        userAgent: activityLogsTable.userAgent,
        metadata: activityLogsTable.metadata,
        createdAt: activityLogsTable.createdAt,
        userName: usersTable.name,
        userEmail: usersTable.email,
      })
      .from(activityLogsTable)
      .innerJoin(usersTable, eq(activityLogsTable.userId, usersTable.id))
      .orderBy(desc(activityLogsTable.createdAt))

    // Aplicar filtros se existirem
    if (conditions.length > 0) {
      logsQuery.where(and(...conditions))
    }

    // Aplicar paginação
    const logs = await logsQuery.limit(limit).offset(offset)

    // Contar total de registros para paginação
    const totalQuery = db.select({ count: activityLogsTable.id }).from(activityLogsTable)

    if (conditions.length > 0) {
      totalQuery.where(and(...conditions))
    }

    const totalResult = await totalQuery
    const total = totalResult.length
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        logs,
        total,
        page,
        limit,
        totalPages,
      },
      message: 'Logs de atividades listados com sucesso',
    })
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Não foi possível carregar os logs de atividades',
      },
      { status: 500 },
    )
  }
}

// POST /api/activity-logs - Create new activity log
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

    // Adicionar informações da requisição se não fornecidas
    if (!body.ipAddress) {
      body.ipAddress = getClientIP(request)
    }
    if (!body.userAgent) {
      body.userAgent = request.headers.get('user-agent') || 'unknown'
    }

    // Validate data using Zod schema
    const validatedData = insertActivityLogSchema.parse(body)

    // Insert into database
    const [newLog] = await db
      .insert(activityLogsTable)
      .values({
        userId: validatedData.userId,
        action: validatedData.action,
        description: validatedData.description,
        ipAddress: validatedData.ipAddress,
        userAgent: validatedData.userAgent,
        metadata: validatedData.metadata,
        createdAt: new Date(),
      })
      .returning()

    return NextResponse.json(
      {
        success: true,
        data: newLog,
        message: 'Log de atividade criado com sucesso',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating activity log:', error)

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
        message: 'Não foi possível criar o log de atividade',
      },
      { status: 500 },
    )
  }
}
