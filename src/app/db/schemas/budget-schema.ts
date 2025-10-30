import { relations } from 'drizzle-orm'
import { decimal, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

import { spacesTable } from './space-schema'
import { usersTable } from './user-schema'

export const budgetsTable = pgTable('budgets', {
  id: uuid('id').primaryKey().defaultRandom(),
  spaceId: uuid('space_id')
    .notNull()
    .references(() => spacesTable.id, { onDelete: 'cascade' }),
  category: varchar('category', { length: 255 }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  month: text('month').notNull(), // Format: "YYYY-MM"
  createdById: uuid('created_by_id')
    .notNull()
    .references(() => usersTable.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Relations are defined in relations.ts

// Zod schemas
// Schema para criação (frontend) - sem createdById
export const createBudgetSchema = z.object({
  spaceId: z.string().uuid('ID do espaço deve ser um UUID válido'),
  category: z.string().min(1, 'Categoria é obrigatória').max(255, 'Categoria muito longa'),
  amount: z.union([
    z.number().positive('O valor deve ser positivo').min(0.01, 'O valor mínimo é R$ 0,01'),
    z.string().min(1, 'Valor é obrigatório'),
  ]),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Formato do mês deve ser YYYY-MM'),
})

// Schema para inserção no banco (backend) - com createdById
export const insertBudgetSchema = createBudgetSchema.extend({
  createdById: z.string().uuid('ID do usuário deve ser um UUID válido'),
})

export const updateBudgetSchema = z.object({
  category: z.string().min(1, 'Categoria é obrigatória').max(255, 'Categoria muito longa').optional(),
  amount: z.number().positive('O valor deve ser positivo').min(0.01, 'O valor mínimo é R$ 0,01').optional(),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Formato do mês deve ser YYYY-MM')
    .optional(),
})

export const selectBudgetSchema = createSelectSchema(budgetsTable)

// Types
export type Budget = typeof budgetsTable.$inferSelect
export type CreateBudgetFormValues = z.infer<typeof createBudgetSchema>
export type BudgetFormValues = z.infer<typeof insertBudgetSchema>
export type UpdateBudgetFormValues = z.infer<typeof updateBudgetSchema>

// Budget with spending information
export type BudgetWithSpending = Budget & {
  spent: number
  remaining: number
  percentage: number
}

// Budget com informações do usuário criador
export type BudgetWithUser = Budget & {
  createdBy?: {
    id: string
    name: string
    email: string
    image: string | null
  }
}

// Budget com gastos e informações do usuário
export type BudgetWithSpendingAndUser = BudgetWithSpending & {
  createdBy?: {
    id: string
    name: string
    email: string
    image: string | null
  }
}
