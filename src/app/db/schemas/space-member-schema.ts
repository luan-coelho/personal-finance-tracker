import { pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { spacesTable } from './space-schema'
import { usersTable } from './user-schema'

// Enum para papéis de membros
export const memberRoleEnum = pgEnum('member_role', ['owner', 'editor', 'viewer'])

export const spaceMembersTable = pgTable('space_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  spaceId: uuid('space_id')
    .notNull()
    .references(() => spacesTable.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  role: memberRoleEnum('role').notNull().default('editor'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
})

// Zod schemas for validation
export const insertSpaceMemberSchema = z.object({
  spaceId: z.string().uuid('ID do espaço deve ser um UUID válido'),
  userId: z.string().uuid('ID do usuário deve ser um UUID válido'),
  role: z.enum(['owner', 'editor', 'viewer']).default('editor'),
})

export const updateSpaceMemberSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
  role: z.enum(['owner', 'editor', 'viewer']),
})

export const selectSpaceMemberSchema = z.object({
  id: z.string().uuid(),
  spaceId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(['owner', 'editor', 'viewer']),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// TypeScript types
export type SpaceMember = typeof spaceMembersTable.$inferSelect
export type NewSpaceMember = typeof spaceMembersTable.$inferInsert
export type SpaceMemberFormValues = z.infer<typeof insertSpaceMemberSchema>
export type UpdateSpaceMemberFormValues = z.infer<typeof updateSpaceMemberSchema>

// Tipo estendido com informações do usuário
export type SpaceMemberWithUser = SpaceMember & {
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
}

// Helper para descrição dos papéis
export const MemberRoleDescriptions = {
  owner: 'Proprietário - Controle total sobre o espaço',
  editor: 'Editor - Pode criar, editar e excluir transações',
  viewer: 'Visualizador - Pode apenas visualizar transações',
} as const

export type MemberRole = 'owner' | 'editor' | 'viewer'
