import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { spacesTable } from './space-schema'

export const tagsTable = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  spaceId: uuid('space_id')
    .notNull()
    .references(() => spacesTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
})

// Zod schemas for validation
export const insertTagSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(50, 'Nome deve ter no máximo 50 caracteres'),
  spaceId: z.string().uuid('ID do espaço deve ser um UUID válido'),
})

export const updateTagSchema = insertTagSchema.partial().extend({
  id: z.string().uuid('ID deve ser um UUID válido'),
})

// TypeScript types
export type Tag = typeof tagsTable.$inferSelect
export type NewTag = typeof tagsTable.$inferInsert
export type TagFormValues = z.infer<typeof insertTagSchema>
export type UpdateTagFormValues = z.infer<typeof updateTagSchema>
