import { and, asc, eq, ilike, type SQL } from 'drizzle-orm'

import { db } from '@/app/db'
import {
  organizationLabelsTable,
  type OrganizationLabel,
  type OrganizationLabelFormValues,
} from '@/app/db/schemas/organization-label-schema'

export interface OrganizationLabelFilters {
  spaceId: string
  search?: string
}

export class OrganizationLabelService {
  static async create(data: OrganizationLabelFormValues): Promise<OrganizationLabel> {
    const [label] = await db
      .insert(organizationLabelsTable)
      .values({
        ...data,
        createdAt: new Date(),
      })
      .returning()

    return label
  }

  static async findById(id: string): Promise<OrganizationLabel | null> {
    const [label] = await db.select().from(organizationLabelsTable).where(eq(organizationLabelsTable.id, id)).limit(1)

    return label || null
  }

  static async findMany(filters: OrganizationLabelFilters): Promise<OrganizationLabel[]> {
    const conditions: SQL[] = [eq(organizationLabelsTable.spaceId, filters.spaceId)]

    if (filters.search) {
      conditions.push(ilike(organizationLabelsTable.name, `%${filters.search}%`))
    }

    const labels = await db
      .select()
      .from(organizationLabelsTable)
      .where(and(...conditions))
      .orderBy(asc(organizationLabelsTable.name))

    return labels
  }

  static async update(id: string, data: Partial<OrganizationLabelFormValues>): Promise<OrganizationLabel | null> {
    const [label] = await db
      .update(organizationLabelsTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(organizationLabelsTable.id, id))
      .returning()

    return label || null
  }

  static async delete(id: string): Promise<boolean> {
    const result = await db.delete(organizationLabelsTable).where(eq(organizationLabelsTable.id, id))

    return (result.rowCount ?? 0) > 0
  }
}
