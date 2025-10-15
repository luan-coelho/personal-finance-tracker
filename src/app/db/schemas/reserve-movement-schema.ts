import { decimal, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { reservesTable } from './reserve-schema'
import { usersTable } from './user-schema'

// Enum para tipo de movimentação
export const reserveMovementTypeEnum = pgEnum('reserve_movement_type', ['deposit', 'withdraw'])

export const reserveMovementsTable = pgTable('reserve_movements', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: reserveMovementTypeEnum('type').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  date: timestamp('date').notNull(),
  description: text('description'),
  reserveId: uuid('reserve_id')
    .notNull()
    .references(() => reservesTable.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
})

// Zod schemas for validation
export const insertReserveMovementSchema = z.object({
  type: z.enum(['deposit', 'withdraw'], {
    required_error: 'Tipo de movimentação é obrigatório',
    invalid_type_error: 'Tipo deve ser "deposit" ou "withdraw"',
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
        message: 'Informe um valor positivo',
      },
    )
    .transform(val => val),
  date: z.coerce.date({
    required_error: 'Data é obrigatória',
    invalid_type_error: 'Data deve ser uma data válida',
  }),
  description: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
  reserveId: z.string().uuid('ID da reserva deve ser um UUID válido'),
  userId: z.string().uuid('ID do usuário deve ser um UUID válido'),
})

export const updateReserveMovementSchema = insertReserveMovementSchema.partial().extend({
  id: z.string().uuid('ID deve ser um UUID válido'),
})

export const selectReserveMovementSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['deposit', 'withdraw']),
  amount: z.string(),
  date: z.date(),
  description: z.string().nullable(),
  reserveId: z.string().uuid(),
  userId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
})

// TypeScript types
export type ReserveMovement = typeof reserveMovementsTable.$inferSelect
export type NewReserveMovement = typeof reserveMovementsTable.$inferInsert
export type ReserveMovementFormValues = z.infer<typeof insertReserveMovementSchema>
export type UpdateReserveMovementFormValues = z.infer<typeof updateReserveMovementSchema>
export type ReserveMovementType = 'deposit' | 'withdraw'

// Tipo estendido com informações da reserva
export type ReserveMovementWithReserve = ReserveMovement & {
  reserve: {
    id: string
    name: string
    color: string
    icon: string
  }
}

// Helper para labels em português
export const ReserveMovementTypeLabels = {
  deposit: 'Depósito',
  withdraw: 'Retirada',
} as const
