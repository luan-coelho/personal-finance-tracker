import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { organizationProjectsTable } from './organization-project-schema'

export const organizationProjectSectionsTable = pgTable('organization_project_sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => organizationProjectsTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
  archivedAt: timestamp('archived_at'),
})

export const insertOrganizationProjectSectionSchema = z.object({
  projectId: z.string().uuid('ID do projeto deve ser um UUID valido'),
  name: z.string().trim().min(1, 'Nome e obrigatorio').max(100, 'Nome deve ter no maximo 100 caracteres'),
  position: z.coerce.number().int().min(0).default(0),
})

export const updateOrganizationProjectSectionSchema = insertOrganizationProjectSectionSchema.partial().extend({
  id: z.string().uuid('ID deve ser um UUID valido'),
})

export type OrganizationProjectSection = typeof organizationProjectSectionsTable.$inferSelect
export type NewOrganizationProjectSection = typeof organizationProjectSectionsTable.$inferInsert
export type OrganizationProjectSectionFormValues = z.infer<typeof insertOrganizationProjectSectionSchema>
export type UpdateOrganizationProjectSectionFormValues = z.infer<typeof updateOrganizationProjectSectionSchema>
