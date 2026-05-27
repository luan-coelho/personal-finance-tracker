import { NextResponse } from 'next/server'
import { z, ZodError } from 'zod'

export const uuidSchema = z.string().uuid()

export const uuidValidationMessages = new Set([
  'id invalido',
  'spaceId invalido',
  'sectionId invalido',
  'projectId invalido',
  'taskId invalido',
  'assigneeId invalido',
  'labelId invalido',
])

export function parseUuid(value: string | null | undefined, fieldName: string) {
  const result = uuidSchema.safeParse(value)
  if (!result.success) {
    throw new Error(`${fieldName} invalido`)
  }

  return result.data
}

export function parseOptionalUuid(value: string | null | undefined, fieldName: string) {
  if (!value) return undefined

  return parseUuid(value, fieldName)
}

export function bodyRequestsValue(body: unknown, fieldName: string, value: unknown) {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return false
  }

  return (body as Record<string, unknown>)[fieldName] === value
}

export function sanitizeUpdateData<T extends object>(
  validatedData: T,
  body: unknown,
  immutableFields: string[],
) {
  const requestedFields =
    typeof body === 'object' && body !== null && !Array.isArray(body)
      ? new Set(Object.keys(body as Record<string, unknown>))
      : new Set<string>()
  const immutableFieldSet = new Set(immutableFields)

  return Object.fromEntries(
    Object.entries(validatedData).filter(([field]) => requestedFields.has(field) && !immutableFieldSet.has(field)),
  ) as Partial<T>
}

export function validationErrorResponse(error: unknown, validationMessages: Set<string> = uuidValidationMessages) {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: error.issues[0]?.message || 'Dados invalidos' }, { status: 400 })
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })
  }

  if (error instanceof Error && validationMessages.has(error.message)) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return null
}
