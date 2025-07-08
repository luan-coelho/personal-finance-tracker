import { relations } from 'drizzle-orm'

import { spacesTable } from './space-schema'
import { transactionsTable } from './transaction-schema'
import { usersTable } from './user-schema'

// Relacionamentos do usuário
export const usersRelations = relations(usersTable, ({ many }) => ({
  ownedSpaces: many(spacesTable),
  transactions: many(transactionsTable),
}))

// Relacionamentos do espaço
export const spacesRelations = relations(spacesTable, ({ one, many }) => ({
  owner: one(usersTable, {
    fields: [spacesTable.ownerId],
    references: [usersTable.id],
  }),
  transactions: many(transactionsTable),
}))

// Relacionamentos da transação
export const transactionsRelations = relations(transactionsTable, ({ one }) => ({
  space: one(spacesTable, {
    fields: [transactionsTable.spaceId],
    references: [spacesTable.id],
  }),
  user: one(usersTable, {
    fields: [transactionsTable.userId],
    references: [usersTable.id],
  }),
}))
