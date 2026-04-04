import { NextResponse } from 'next/server'

/**
 * Helpers para respostas padronizadas da API.
 */

export function successResponse<T>(data: T, message = 'Operação realizada com sucesso', status = 200) {
  return NextResponse.json({ success: true, data, message }, { status })
}

export function errorResponse(error: string, message: string, status: number, details?: unknown) {
  return NextResponse.json({ success: false, error, message, ...(details ? { details } : {}) }, { status })
}

export function paginatedResponse<T>(data: T[], total: number, page: number, limit: number, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    message: message || 'Dados listados com sucesso',
  })
}
