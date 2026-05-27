import { and, eq, isNull } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z, ZodError } from 'zod'

import { db } from '@/app/db'
import type { OrganizationVisibility } from '@/app/db/schemas/organization-project-schema'
import { organizationProjectSectionsTable } from '@/app/db/schemas/organization-project-section-schema'
import { spaceMembersTable } from '@/app/db/schemas/space-member-schema'
import { spacesTable } from '@/app/db/schemas/space-schema'

import { OrganizationProjectService } from '@/services/organization-project-service'
import { OrganizationTaskService } from '@/services/organization-task-service'

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

export function sanitizeUpdateData<T extends object>(validatedData: T, body: unknown, immutableFields: string[]) {
  const requestedFields =
    typeof body === 'object' && body !== null && !Array.isArray(body)
      ? new Set(Object.keys(body as Record<string, unknown>))
      : new Set<string>()
  const immutableFieldSet = new Set(immutableFields)

  return Object.fromEntries(
    Object.entries(validatedData).filter(([field]) => requestedFields.has(field) && !immutableFieldSet.has(field)),
  ) as Partial<T>
}

export function hasOwnField<T extends object>(data: T, fieldName: string) {
  return Object.prototype.hasOwnProperty.call(data, fieldName)
}

export async function validateAssigneeForSpace(assigneeId: string | null | undefined, spaceId: string) {
  if (!assigneeId) {
    return
  }

  const [ownerSpace] = await db
    .select({ id: spacesTable.id })
    .from(spacesTable)
    .where(and(eq(spacesTable.id, spaceId), eq(spacesTable.ownerId, assigneeId)))
    .limit(1)

  if (ownerSpace) {
    return
  }

  const [spaceMember] = await db
    .select({ id: spaceMembersTable.id })
    .from(spaceMembersTable)
    .where(and(eq(spaceMembersTable.spaceId, spaceId), eq(spaceMembersTable.userId, assigneeId)))
    .limit(1)

  if (!spaceMember) {
    throw new Error('Responsavel invalido para este espaco')
  }
}

export async function validateTaskParentReferences({
  spaceId,
  userId,
  visibility,
  projectId,
  sectionId,
}: {
  spaceId: string
  userId: string
  visibility: OrganizationVisibility
  projectId?: string | null
  sectionId?: string | null
}) {
  if (projectId) {
    const project = await OrganizationProjectService.findByIdForUser(projectId, spaceId, userId)
    if (!project || (visibility === 'shared' && project.visibility !== 'shared')) {
      throw new Error('Projeto invalido para este espaco')
    }
  }

  if (!sectionId) {
    return
  }

  const [section] = await db
    .select()
    .from(organizationProjectSectionsTable)
    .where(and(eq(organizationProjectSectionsTable.id, sectionId), isNull(organizationProjectSectionsTable.archivedAt)))
    .limit(1)

  if (!section) {
    throw new Error('Secao invalida para este espaco')
  }

  const sectionProject = await OrganizationProjectService.findByIdForUser(section.projectId, spaceId, userId)
  if (
    !sectionProject ||
    (projectId && section.projectId !== projectId) ||
    (visibility === 'shared' && sectionProject.visibility !== 'shared')
  ) {
    throw new Error('Secao invalida para este espaco')
  }
}

export async function validateNoteParentReferences({
  spaceId,
  userId,
  visibility,
  projectId,
  taskId,
}: {
  spaceId: string
  userId: string
  visibility: OrganizationVisibility
  projectId?: string | null
  taskId?: string | null
}) {
  if (projectId) {
    const project = await OrganizationProjectService.findByIdForUser(projectId, spaceId, userId)
    if (!project || (visibility === 'shared' && project.visibility !== 'shared')) {
      throw new Error('Projeto invalido para este espaco')
    }
  }

  if (!taskId) {
    return
  }

  const task = await OrganizationTaskService.findByIdForUser(taskId, spaceId, userId)
  if (!task || (visibility === 'shared' && task.visibility !== 'shared')) {
    throw new Error('Tarefa invalida para este espaco')
  }

  if (projectId && task.projectId !== projectId) {
    throw new Error('Tarefa invalida para este projeto')
  }
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
