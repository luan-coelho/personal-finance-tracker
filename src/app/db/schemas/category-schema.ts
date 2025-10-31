import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { spacesTable } from './space-schema'

// Enum para tipo de categoria (mesmos tipos de transação)
export const categoryTypeEnum = pgEnum('category_type', ['entrada', 'saida'])

export const categoriesTable = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: categoryTypeEnum('type').notNull(),
  spaceId: uuid('space_id')
    .notNull()
    .references(() => spacesTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
})

// Zod schemas for validation
export const insertCategorySchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  type: z.enum(['entrada', 'saida'], {
    required_error: 'Tipo é obrigatório',
    invalid_type_error: 'Tipo deve ser "entrada" ou "saida"',
  }),
  spaceId: z.string().uuid('ID do espaço deve ser um UUID válido'),
})

export const updateCategorySchema = insertCategorySchema.partial().extend({
  id: z.string().uuid('ID deve ser um UUID válido'),
})

// TypeScript types
export type Category = typeof categoriesTable.$inferSelect
export type NewCategory = typeof categoriesTable.$inferInsert
export type CategoryFormValues = z.infer<typeof insertCategorySchema>
export type UpdateCategoryFormValues = z.infer<typeof updateCategorySchema>
export type CategoryType = 'entrada' | 'saida'
