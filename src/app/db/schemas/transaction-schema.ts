import { decimal, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { spacesTable } from './space-schema'
import { usersTable } from './user-schema'

// Enum para tipo de transação
export const transactionTypeEnum = pgEnum('transaction_type', ['entrada', 'saida'])

export const transactionsTable = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: transactionTypeEnum('type').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  date: timestamp('date').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  tags: text('tags').array(), // Array de strings para múltiplas tags
  spaceId: uuid('space_id')
    .notNull()
    .references(() => spacesTable.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
})

// Zod schemas for validation
export const insertTransactionSchema = z.object({
  type: z.enum(['entrada', 'saida'], {
    required_error: 'Tipo de transação é obrigatório',
    invalid_type_error: 'Tipo deve ser "entrada" ou "saida"',
  }),
  amount: z
    .string()
    .refine(
      val => {
        const normalized = val.replace(/\./g, '').replace(',', '.')
        const num = Number(normalized)
        return !isNaN(num) && num > 0
      },
      {
        message: 'Valor deve ser um número positivo',
      },
    )
    .transform(val => val),
  date: z.coerce.date({
    required_error: 'Data é obrigatória',
    invalid_type_error: 'Data deve ser uma data válida',
  }),
  description: z
    .string()
    .trim()
    .min(1, 'Descrição é obrigatória')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  category: z.string().max(100, 'Categoria deve ter no máximo 100 caracteres'),
  tags: z.array(z.string().max(50, 'Tag deve ter no máximo 50 caracteres')).optional().default([]),
  spaceId: z.string().uuid('ID do espaço deve ser um UUID válido'),
  userId: z.string().uuid('ID do usuário deve ser um UUID válido'),
})

export const updateTransactionSchema = insertTransactionSchema.partial().extend({
  id: z.string().uuid('ID deve ser um UUID válido'),
})

export const selectTransactionSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['entrada', 'saida']),
  amount: z.string(),
  date: z.date(),
  description: z.string(),
  category: z.string(),
  tags: z.array(z.string()).nullable(),
  spaceId: z.string().uuid(),
  userId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
})

// TypeScript types
export type Transaction = typeof transactionsTable.$inferSelect
export type NewTransaction = typeof transactionsTable.$inferInsert
export type TransactionFormValues = z.infer<typeof insertTransactionSchema>
export type UpdateTransactionFormValues = z.infer<typeof updateTransactionSchema>
export type TransactionType = 'entrada' | 'saida'

// Helper para categorias padrão
export const DefaultCategories = {
  entrada: ['Salário', 'Freelance', 'Investimentos', 'Vendas', 'Presente', 'Outros'],
  saida: [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Compras',
    'Contas',
    'Investimentos',
    'Outros',
  ],
} as const
