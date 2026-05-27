import { and, asc, desc, eq, ilike, inArray, isNull, type SQL } from 'drizzle-orm'

import { db } from '@/app/db'
import {
  organizationProjectsTable,
  type OrganizationProject,
  type OrganizationProjectFormValues,
} from '@/app/db/schemas/organization-project-schema'
import {
  organizationProjectSectionsTable,
  type OrganizationProjectSection,
  type OrganizationProjectSectionFormValues,
} from '@/app/db/schemas/organization-project-section-schema'

import { organizationVisibilityWhere } from '@/lib/organization-access'

export interface OrganizationProjectFilters {
  spaceId: string
  userId: string
  includeArchived?: boolean
  search?: string
}

export type OrganizationProjectWithSections = OrganizationProject & {
  sections: OrganizationProjectSection[]
}

export class OrganizationProjectService {
  static async create(data: OrganizationProjectFormValues): Promise<OrganizationProject> {
    const [project] = await db
      .insert(organizationProjectsTable)
      .values({
        ...data,
        createdAt: new Date(),
      })
      .returning()

    return project
  }

  static async findById(id: string): Promise<OrganizationProject | null> {
    const [project] = await db
      .select()
      .from(organizationProjectsTable)
      .where(eq(organizationProjectsTable.id, id))
      .limit(1)

    return project || null
  }

  static async findByIdForUser(id: string, spaceId: string, userId: string): Promise<OrganizationProject | null> {
    const conditions: SQL[] = [
      eq(organizationProjectsTable.id, id),
      eq(organizationProjectsTable.spaceId, spaceId),
      isNull(organizationProjectsTable.archivedAt),
    ]
    const visibilityCondition = organizationVisibilityWhere(organizationProjectsTable, userId)

    if (visibilityCondition) {
      conditions.push(visibilityCondition)
    }

    const [project] = await db
      .select()
      .from(organizationProjectsTable)
      .where(and(...conditions))
      .limit(1)

    return project || null
  }

  static async findMany(filters: OrganizationProjectFilters): Promise<OrganizationProjectWithSections[]> {
    const conditions: SQL[] = [eq(organizationProjectsTable.spaceId, filters.spaceId)]
    const visibilityCondition = organizationVisibilityWhere(organizationProjectsTable, filters.userId)

    if (visibilityCondition) {
      conditions.push(visibilityCondition)
    }

    if (!filters.includeArchived) {
      conditions.push(isNull(organizationProjectsTable.archivedAt))
    }

    if (filters.search) {
      conditions.push(ilike(organizationProjectsTable.name, `%${filters.search}%`))
    }

    const projects = await db
      .select()
      .from(organizationProjectsTable)
      .where(and(...conditions))
      .orderBy(desc(organizationProjectsTable.createdAt))

    if (projects.length === 0) {
      return []
    }

    const sections = await db
      .select()
      .from(organizationProjectSectionsTable)
      .where(
        and(
          inArray(
            organizationProjectSectionsTable.projectId,
            projects.map(project => project.id),
          ),
          isNull(organizationProjectSectionsTable.archivedAt),
        ),
      )
      .orderBy(asc(organizationProjectSectionsTable.position), asc(organizationProjectSectionsTable.createdAt))

    const sectionsByProjectId = new Map<string, OrganizationProjectSection[]>()

    for (const section of sections) {
      const projectSections = sectionsByProjectId.get(section.projectId) ?? []
      projectSections.push(section)
      sectionsByProjectId.set(section.projectId, projectSections)
    }

    return projects.map(project => ({
      ...project,
      sections: sectionsByProjectId.get(project.id) ?? [],
    }))
  }

  static async update(id: string, data: Partial<OrganizationProjectFormValues>): Promise<OrganizationProject | null> {
    const [project] = await db
      .update(organizationProjectsTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(organizationProjectsTable.id, id))
      .returning()

    return project || null
  }

  static async archive(id: string): Promise<OrganizationProject | null> {
    const now = new Date()
    const [project] = await db
      .update(organizationProjectsTable)
      .set({
        archivedAt: now,
        updatedAt: now,
      })
      .where(eq(organizationProjectsTable.id, id))
      .returning()

    return project || null
  }

  static async createSection(data: OrganizationProjectSectionFormValues): Promise<OrganizationProjectSection> {
    const [section] = await db
      .insert(organizationProjectSectionsTable)
      .values({
        ...data,
        createdAt: new Date(),
      })
      .returning()

    return section
  }

  static async updateSection(
    id: string,
    data: Partial<OrganizationProjectSectionFormValues>,
  ): Promise<OrganizationProjectSection | null> {
    const [section] = await db
      .update(organizationProjectSectionsTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(organizationProjectSectionsTable.id, id))
      .returning()

    return section || null
  }

  static async archiveSection(id: string): Promise<OrganizationProjectSection | null> {
    const now = new Date()
    const [section] = await db
      .update(organizationProjectSectionsTable)
      .set({
        archivedAt: now,
        updatedAt: now,
      })
      .where(eq(organizationProjectSectionsTable.id, id))
      .returning()

    return section || null
  }
}
