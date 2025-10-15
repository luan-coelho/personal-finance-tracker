import { boolean, decimal, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { spacesTable } from './space-schema'

export const reservesTable = pgTable('reserves', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  targetAmount: decimal('target_amount', { precision: 10, scale: 2 }),
  currentAmount: decimal('current_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  color: text('color').default('#3b82f6'), // Cor para identificação visual
  icon: text('icon').default('piggy-bank'), // Nome do ícone do lucide-react
  active: boolean('active').notNull().default(true),
  spaceId: uuid('space_id')
    .notNull()
    .references(() => spacesTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
})

// Zod schemas for validation
export const insertReserveSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
  targetAmount: z
    .string()
    .optional()
    .refine(
      val => {
        if (!val) return true
        const normalized = val.replace(/\./g, '').replace(',', '.')
        const num = Number(normalized)
        return !isNaN(num) && num >= 0
      },
      {
        message: 'Meta deve ser um número válido',
      },
    ),
  currentAmount: z
    .string()
    .default('0')
    .refine(
      val => {
        const normalized = val.replace(/\./g, '').replace(',', '.')
        const num = Number(normalized)
        return !isNaN(num) && num >= 0
      },
      {
        message: 'Valor atual deve ser um número válido',
      },
    ),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve ser um código hexadecimal válido')
    .optional(),
  icon: z.string().max(50, 'Ícone deve ter no máximo 50 caracteres').optional(),
  active: z.boolean().default(true),
  spaceId: z.string().uuid('ID do espaço deve ser um UUID válido'),
})

export const updateReserveSchema = insertReserveSchema.partial().extend({
  id: z.string().uuid('ID deve ser um UUID válido'),
})

export const selectReserveSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  targetAmount: z.string().nullable(),
  currentAmount: z.string(),
  color: z.string(),
  icon: z.string(),
  active: z.boolean(),
  spaceId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
})

// TypeScript types
export type Reserve = typeof reservesTable.$inferSelect
export type NewReserve = typeof reservesTable.$inferInsert
export type ReserveFormValues = z.infer<typeof insertReserveSchema>
export type UpdateReserveFormValues = z.infer<typeof updateReserveSchema>

// Helper para reservas padrão
export const DefaultReserves = [
  { name: 'Emergência', description: 'Fundo de emergência para imprevistos', icon: 'shield', color: '#ef4444' },
  { name: 'Férias', description: 'Reserva para viagens e férias', icon: 'plane', color: '#3b82f6' },
  { name: 'Investimentos', description: 'Dinheiro destinado a investimentos', icon: 'trending-up', color: '#10b981' },
  {
    name: 'Grandes Compras',
    description: 'Para compras planejadas de valor alto',
    icon: 'shopping-cart',
    color: '#f59e0b',
  },
] as const

// Helper para ícones disponíveis
export const AvailableIcons = [
  'piggy-bank',
  'wallet',
  'shield',
  'plane',
  'trending-up',
  'shopping-cart',
  'home',
  'car',
  'heart',
  'gift',
  'graduation-cap',
  'briefcase',
  'smartphone',
  'laptop',
  'droplet',
  'zap',
] as const

// Helper para cores disponíveis
export const AvailableColors = [
  { name: 'Vermelho', value: '#ef4444' },
  { name: 'Laranja', value: '#f97316' },
  { name: 'Amarelo', value: '#f59e0b' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Índigo', value: '#6366f1' },
  { name: 'Roxo', value: '#8b5cf6' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Cinza', value: '#6b7280' },
] as const
