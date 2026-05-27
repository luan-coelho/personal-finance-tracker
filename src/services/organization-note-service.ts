import { and, desc, eq, ilike, isNull, or, sql, type SQL } from 'drizzle-orm'

import { db } from '@/app/db'
import {
  organizationNotesTable,
  type OrganizationNote,
  type OrganizationNoteFormValues,
} from '@/app/db/schemas/organization-note-schema'
import { organizationProjectsTable } from '@/app/db/schemas/organization-project-schema'
import { organizationTasksTable } from '@/app/db/schemas/organization-task-schema'

import { organizationVisibilityWhere } from '@/lib/organization-access'

export interface OrganizationNoteFilters {
  spaceId: string
  userId: string
  projectId?: string
  taskId?: string
  search?: string
  includeArchived?: boolean
}

export class OrganizationNoteService {
  static async create(data: OrganizationNoteFormValues): Promise<OrganizationNote> {
    return await db.transaction(async tx => {
      if (data.projectId) {
        const [project] = await tx
          .select({ id: organizationProjectsTable.id })
          .from(organizationProjectsTable)
          .where(
            and(eq(organizationProjectsTable.id, data.projectId), eq(organizationProjectsTable.spaceId, data.spaceId)),
          )
          .limit(1)

        if (!project) {
          throw new Error('Projeto invalido para este espaco')
        }
      }

      if (data.taskId) {
        const [task] = await tx
          .select({
            id: organizationTasksTable.id,
            projectId: organizationTasksTable.projectId,
          })
          .from(organizationTasksTable)
          .where(and(eq(organizationTasksTable.id, data.taskId), eq(organizationTasksTable.spaceId, data.spaceId)))
          .limit(1)

        if (!task) {
          throw new Error('Tarefa invalida para este espaco')
        }

        if (data.projectId && task.projectId !== data.projectId) {
          throw new Error('Tarefa invalida para este projeto')
        }
      }

      const [note] = await tx
        .insert(organizationNotesTable)
        .values({
          ...data,
          createdAt: new Date(),
        })
        .returning()

      return note
    })
  }

  static async findById(id: string): Promise<OrganizationNote | null> {
    const [note] = await db.select().from(organizationNotesTable).where(eq(organizationNotesTable.id, id)).limit(1)

    return note || null
  }

  static async findByIdForUser(id: string, spaceId: string, userId: string): Promise<OrganizationNote | null> {
    const [note] = await db
      .select()
      .from(organizationNotesTable)
      .where(and(...this.visibleNoteConditions(spaceId, userId), eq(organizationNotesTable.id, id)))
      .limit(1)

    return note || null
  }

  static async findMany(filters: OrganizationNoteFilters): Promise<OrganizationNote[]> {
    const conditions: SQL[] = [eq(organizationNotesTable.spaceId, filters.spaceId)]
    const visibilityCondition = organizationVisibilityWhere(organizationNotesTable, filters.userId)

    if (visibilityCondition) {
      conditions.push(visibilityCondition)
    }

    if (filters.projectId) {
      conditions.push(eq(organizationNotesTable.projectId, filters.projectId))
    }

    if (filters.taskId) {
      conditions.push(eq(organizationNotesTable.taskId, filters.taskId))
    }

    if (filters.search) {
      const searchCondition = or(
        ilike(organizationNotesTable.title, `%${filters.search}%`),
        ilike(organizationNotesTable.content, `%${filters.search}%`),
      )

      if (searchCondition) {
        conditions.push(searchCondition)
      }
    }

    if (!filters.includeArchived) {
      conditions.push(isNull(organizationNotesTable.archivedAt))
    }

    const notes = await db
      .select()
      .from(organizationNotesTable)
      .where(and(...conditions))
      .orderBy(sql`${organizationNotesTable.updatedAt} desc nulls last`, desc(organizationNotesTable.createdAt))

    return notes
  }

  static async update(id: string, data: Partial<OrganizationNoteFormValues>): Promise<OrganizationNote | null> {
    return await db.transaction(async tx => {
      const [existingNote] = await tx
        .select()
        .from(organizationNotesTable)
        .where(eq(organizationNotesTable.id, id))
        .limit(1)

      if (!existingNote) {
        return null
      }

      const effectiveSpaceId = data.spaceId ?? existingNote.spaceId
      const effectiveProjectId = data.projectId !== undefined ? data.projectId : existingNote.projectId
      const effectiveTaskId = data.taskId !== undefined ? data.taskId : existingNote.taskId

      if (effectiveProjectId) {
        const [project] = await tx
          .select({ id: organizationProjectsTable.id })
          .from(organizationProjectsTable)
          .where(
            and(
              eq(organizationProjectsTable.id, effectiveProjectId),
              eq(organizationProjectsTable.spaceId, effectiveSpaceId),
            ),
          )
          .limit(1)

        if (!project) {
          throw new Error('Projeto invalido para este espaco')
        }
      }

      if (effectiveTaskId) {
        const [task] = await tx
          .select({
            id: organizationTasksTable.id,
            projectId: organizationTasksTable.projectId,
          })
          .from(organizationTasksTable)
          .where(
            and(eq(organizationTasksTable.id, effectiveTaskId), eq(organizationTasksTable.spaceId, effectiveSpaceId)),
          )
          .limit(1)

        if (!task) {
          throw new Error('Tarefa invalida para este espaco')
        }

        if (effectiveProjectId && task.projectId !== effectiveProjectId) {
          throw new Error('Tarefa invalida para este projeto')
        }
      }

      const [note] = await tx
        .update(organizationNotesTable)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(organizationNotesTable.id, id))
        .returning()

      return note || null
    })
  }

  static async archive(id: string): Promise<OrganizationNote | null> {
    const now = new Date()
    const [note] = await db
      .update(organizationNotesTable)
      .set({
        archivedAt: now,
        updatedAt: now,
      })
      .where(eq(organizationNotesTable.id, id))
      .returning()

    return note || null
  }

  private static visibleNoteConditions(spaceId: string, userId: string): SQL[] {
    const conditions: SQL[] = [eq(organizationNotesTable.spaceId, spaceId), isNull(organizationNotesTable.archivedAt)]
    const visibilityCondition = organizationVisibilityWhere(organizationNotesTable, userId)

    if (visibilityCondition) {
      conditions.push(visibilityCondition)
    }

    return conditions
  }
}
