import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { usersTable } from './user-schema'

export const spacesTable = pgTable('spaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
})

// Relacionamentos definidos em relations.ts para evitar importações circulares

// Zod schemas for validation
export const insertSpaceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
  ownerId: z.string().uuid('ID do proprietário deve ser um UUID válido'),
})

export const updateSpaceSchema = insertSpaceSchema.partial().extend({
  id: z.string().uuid('ID deve ser um UUID válido'),
})

export const selectSpaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  ownerId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// TypeScript types
export type Space = typeof spacesTable.$inferSelect
export type NewSpace = typeof spacesTable.$inferInsert
export type SpaceFormValues = z.infer<typeof insertSpaceSchema>
export type UpdateSpaceFormValues = z.infer<typeof updateSpaceSchema>

// Helper para espaços padrão
export const DefaultSpaces = [
  { name: 'Pessoal', description: 'Finanças pessoais e domésticas' },
  { name: 'Trabalho', description: 'Finanças relacionadas ao trabalho' },
  { name: 'Empresa', description: 'Finanças empresariais' },
] as const
