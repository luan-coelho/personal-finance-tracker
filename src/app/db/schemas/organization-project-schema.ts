import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { spacesTable } from './space-schema'
import { usersTable } from './user-schema'

export const organizationVisibilityEnum = pgEnum('organization_visibility', ['shared', 'personal'])

export const organizationProjectsTable = pgTable('organization_projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  spaceId: uuid('space_id')
    .notNull()
    .references(() => spacesTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color').default('#10B981').notNull(),
  icon: text('icon').default('folder').notNull(),
  visibility: organizationVisibilityEnum('visibility').notNull().default('shared'),
  createdById: uuid('created_by_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
  archivedAt: timestamp('archived_at'),
})

export const insertOrganizationProjectSchema = z.object({
  spaceId: z.string().uuid('ID do espaco deve ser um UUID valido'),
  name: z.string().trim().min(1, 'Nome e obrigatorio').max(100, 'Nome deve ter no maximo 100 caracteres'),
  description: z.string().trim().max(500, 'Descricao deve ter no maximo 500 caracteres').nullable().optional(),
  color: z.string().trim().default('#10B981'),
  icon: z.string().trim().default('folder'),
  visibility: z.enum(['shared', 'personal']).default('shared'),
  createdById: z.string().uuid('ID do criador deve ser um UUID valido'),
})

export const updateOrganizationProjectSchema = insertOrganizationProjectSchema.partial().extend({
  id: z.string().uuid('ID deve ser um UUID valido'),
})

export type OrganizationProject = typeof organizationProjectsTable.$inferSelect
export type NewOrganizationProject = typeof organizationProjectsTable.$inferInsert
export type OrganizationProjectFormValues = z.infer<typeof insertOrganizationProjectSchema>
export type UpdateOrganizationProjectFormValues = z.infer<typeof updateOrganizationProjectSchema>
export type OrganizationVisibility = 'shared' | 'personal'
