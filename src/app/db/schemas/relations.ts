import { relations } from 'drizzle-orm'

import { reserveMovementsTable } from './reserve-movement-schema'
import { reservesTable } from './reserve-schema'
import { spaceMembersTable } from './space-member-schema'
import { spacesTable } from './space-schema'
import { transactionsTable } from './transaction-schema'
import { usersTable } from './user-schema'

// Relacionamentos do usuário
export const usersRelations = relations(usersTable, ({ many }) => ({
  ownedSpaces: many(spacesTable),
  transactions: many(transactionsTable),
  spaceMemberships: many(spaceMembersTable),
  reserveMovements: many(reserveMovementsTable),
}))

// Relacionamentos do espaço
export const spacesRelations = relations(spacesTable, ({ one, many }) => ({
  owner: one(usersTable, {
    fields: [spacesTable.ownerId],
    references: [usersTable.id],
  }),
  transactions: many(transactionsTable),
  members: many(spaceMembersTable),
  reserves: many(reservesTable),
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

// Relacionamentos dos membros do espaço
export const spaceMembersRelations = relations(spaceMembersTable, ({ one }) => ({
  space: one(spacesTable, {
    fields: [spaceMembersTable.spaceId],
    references: [spacesTable.id],
  }),
  user: one(usersTable, {
    fields: [spaceMembersTable.userId],
    references: [usersTable.id],
  }),
}))

// Relacionamentos das reservas
export const reservesRelations = relations(reservesTable, ({ one, many }) => ({
  space: one(spacesTable, {
    fields: [reservesTable.spaceId],
    references: [spacesTable.id],
  }),
  movements: many(reserveMovementsTable),
}))

// Relacionamentos das movimentações de reservas
export const reserveMovementsRelations = relations(reserveMovementsTable, ({ one }) => ({
  reserve: one(reservesTable, {
    fields: [reserveMovementsTable.reserveId],
    references: [reservesTable.id],
  }),
  user: one(usersTable, {
    fields: [reserveMovementsTable.userId],
    references: [usersTable.id],
  }),
}))
