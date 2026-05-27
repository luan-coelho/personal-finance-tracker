import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { spacesTable } from './space-schema'

export const organizationLabelsTable = pgTable('organization_labels', {
  id: uuid('id').primaryKey().defaultRandom(),
  spaceId: uuid('space_id')
    .notNull()
    .references(() => spacesTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  color: text('color').default('#64748B').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
})

export const insertOrganizationLabelSchema = z.object({
  spaceId: z.string().uuid('ID do espaco deve ser um UUID valido'),
  name: z.string().trim().min(1, 'Nome e obrigatorio').max(50, 'Nome deve ter no maximo 50 caracteres'),
  color: z.string().trim().default('#64748B'),
})

export const updateOrganizationLabelSchema = insertOrganizationLabelSchema.partial().extend({
  id: z.string().uuid('ID deve ser um UUID valido'),
})

export type OrganizationLabel = typeof organizationLabelsTable.$inferSelect
export type NewOrganizationLabel = typeof organizationLabelsTable.$inferInsert
export type OrganizationLabelFormValues = z.infer<typeof insertOrganizationLabelSchema>
export type UpdateOrganizationLabelFormValues = z.infer<typeof updateOrganizationLabelSchema>
