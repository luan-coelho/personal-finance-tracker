import { and, desc, eq, ilike, isNull, or, sql, type SQL } from 'drizzle-orm'

import { db } from '@/app/db'
import {
  organizationNotesTable,
  type OrganizationNote,
  type OrganizationNoteFormValues,
} from '@/app/db/schemas/organization-note-schema'

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
    const [note] = await db
      .insert(organizationNotesTable)
      .values({
        ...data,
        createdAt: new Date(),
      })
      .returning()

    return note
  }

  static async findById(id: string): Promise<OrganizationNote | null> {
    const [note] = await db.select().from(organizationNotesTable).where(eq(organizationNotesTable.id, id)).limit(1)

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
    const [note] = await db
      .update(organizationNotesTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(organizationNotesTable.id, id))
      .returning()

    return note || null
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
}
