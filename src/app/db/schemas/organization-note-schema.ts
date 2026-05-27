import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { organizationProjectsTable, organizationVisibilityEnum } from './organization-project-schema'
import { organizationTasksTable } from './organization-task-schema'
import { spacesTable } from './space-schema'
import { usersTable } from './user-schema'

export const organizationNotesTable = pgTable('organization_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  spaceId: uuid('space_id')
    .notNull()
    .references(() => spacesTable.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => organizationProjectsTable.id, { onDelete: 'set null' }),
  taskId: uuid('task_id').references(() => organizationTasksTable.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  content: text('content').notNull().default(''),
  visibility: organizationVisibilityEnum('visibility').notNull().default('shared'),
  createdById: uuid('created_by_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
  archivedAt: timestamp('archived_at'),
})

export const insertOrganizationNoteSchema = z.object({
  spaceId: z.string().uuid('ID do espaco deve ser um UUID valido'),
  projectId: z.string().uuid('ID do projeto deve ser um UUID valido').nullable().optional(),
  taskId: z.string().uuid('ID da tarefa deve ser um UUID valido').nullable().optional(),
  title: z.string().trim().min(1, 'Titulo e obrigatorio').max(200, 'Titulo deve ter no maximo 200 caracteres'),
  content: z.string().max(10000, 'Conteudo deve ter no maximo 10000 caracteres').default(''),
  visibility: z.enum(['shared', 'personal']).default('shared'),
  createdById: z.string().uuid('ID do criador deve ser um UUID valido'),
})

export const updateOrganizationNoteSchema = insertOrganizationNoteSchema.partial().extend({
  id: z.string().uuid('ID deve ser um UUID valido'),
})

export type OrganizationNote = typeof organizationNotesTable.$inferSelect
export type NewOrganizationNote = typeof organizationNotesTable.$inferInsert
export type OrganizationNoteFormValues = z.infer<typeof insertOrganizationNoteSchema>
export type UpdateOrganizationNoteFormValues = z.infer<typeof updateOrganizationNoteSchema>
