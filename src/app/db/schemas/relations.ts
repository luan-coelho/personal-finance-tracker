import { relations } from 'drizzle-orm'

import { budgetsTable } from './budget-schema'
import { organizationLabelsTable } from './organization-label-schema'
import { organizationNotesTable } from './organization-note-schema'
import { organizationProjectsTable } from './organization-project-schema'
import { organizationProjectSectionsTable } from './organization-project-section-schema'
import { organizationTaskLabelsTable } from './organization-task-label-schema'
import { organizationTasksTable } from './organization-task-schema'
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
  budgets: many(budgetsTable),
  createdOrganizationProjects: many(organizationProjectsTable, { relationName: 'organizationProjectCreator' }),
  createdOrganizationTasks: many(organizationTasksTable, { relationName: 'organizationTaskCreator' }),
  assignedOrganizationTasks: many(organizationTasksTable, { relationName: 'organizationTaskAssignee' }),
  createdOrganizationNotes: many(organizationNotesTable, { relationName: 'organizationNoteCreator' }),
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
  budgets: many(budgetsTable),
  organizationProjects: many(organizationProjectsTable),
  organizationLabels: many(organizationLabelsTable),
  organizationTasks: many(organizationTasksTable),
  organizationNotes: many(organizationNotesTable),
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

// Relacionamentos dos orçamentos
export const budgetsRelations = relations(budgetsTable, ({ one }) => ({
  space: one(spacesTable, {
    fields: [budgetsTable.spaceId],
    references: [spacesTable.id],
  }),
  createdBy: one(usersTable, {
    fields: [budgetsTable.createdById],
    references: [usersTable.id],
  }),
}))

// Relacionamentos dos projetos de organizacao
export const organizationProjectsRelations = relations(organizationProjectsTable, ({ one, many }) => ({
  space: one(spacesTable, {
    fields: [organizationProjectsTable.spaceId],
    references: [spacesTable.id],
  }),
  createdBy: one(usersTable, {
    fields: [organizationProjectsTable.createdById],
    references: [usersTable.id],
    relationName: 'organizationProjectCreator',
  }),
  sections: many(organizationProjectSectionsTable),
  tasks: many(organizationTasksTable),
  notes: many(organizationNotesTable),
}))

// Relacionamentos das secoes de projetos de organizacao
export const organizationProjectSectionsRelations = relations(organizationProjectSectionsTable, ({ one, many }) => ({
  project: one(organizationProjectsTable, {
    fields: [organizationProjectSectionsTable.projectId],
    references: [organizationProjectsTable.id],
  }),
  tasks: many(organizationTasksTable),
}))

// Relacionamentos das etiquetas de organizacao
export const organizationLabelsRelations = relations(organizationLabelsTable, ({ one, many }) => ({
  space: one(spacesTable, {
    fields: [organizationLabelsTable.spaceId],
    references: [spacesTable.id],
  }),
  taskLabels: many(organizationTaskLabelsTable),
}))

// Relacionamentos das tarefas de organizacao
export const organizationTasksRelations = relations(organizationTasksTable, ({ one, many }) => ({
  space: one(spacesTable, {
    fields: [organizationTasksTable.spaceId],
    references: [spacesTable.id],
  }),
  project: one(organizationProjectsTable, {
    fields: [organizationTasksTable.projectId],
    references: [organizationProjectsTable.id],
  }),
  section: one(organizationProjectSectionsTable, {
    fields: [organizationTasksTable.sectionId],
    references: [organizationProjectSectionsTable.id],
  }),
  createdBy: one(usersTable, {
    fields: [organizationTasksTable.createdById],
    references: [usersTable.id],
    relationName: 'organizationTaskCreator',
  }),
  assignee: one(usersTable, {
    fields: [organizationTasksTable.assigneeId],
    references: [usersTable.id],
    relationName: 'organizationTaskAssignee',
  }),
  taskLabels: many(organizationTaskLabelsTable),
  notes: many(organizationNotesTable),
}))

// Relacionamentos das etiquetas associadas a tarefas
export const organizationTaskLabelsRelations = relations(organizationTaskLabelsTable, ({ one }) => ({
  task: one(organizationTasksTable, {
    fields: [organizationTaskLabelsTable.taskId],
    references: [organizationTasksTable.id],
  }),
  label: one(organizationLabelsTable, {
    fields: [organizationTaskLabelsTable.labelId],
    references: [organizationLabelsTable.id],
  }),
}))

// Relacionamentos das notas de organizacao
export const organizationNotesRelations = relations(organizationNotesTable, ({ one }) => ({
  space: one(spacesTable, {
    fields: [organizationNotesTable.spaceId],
    references: [spacesTable.id],
  }),
  project: one(organizationProjectsTable, {
    fields: [organizationNotesTable.projectId],
    references: [organizationProjectsTable.id],
  }),
  task: one(organizationTasksTable, {
    fields: [organizationNotesTable.taskId],
    references: [organizationTasksTable.id],
  }),
  createdBy: one(usersTable, {
    fields: [organizationNotesTable.createdById],
    references: [usersTable.id],
    relationName: 'organizationNoteCreator',
  }),
}))
