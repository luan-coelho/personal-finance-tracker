// Re-export for convenience
import { budgetsTable } from './budget-schema'
import { categoriesTable } from './category-schema'
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
import { tagsTable } from './tag-schema'
import { transactionsTable } from './transaction-schema'
import { usersTable } from './user-schema'

// Export all schemas and types
export * from './budget-schema'
export * from './category-schema'
export * from './organization-label-schema'
export * from './organization-note-schema'
export * from './organization-project-schema'
export * from './organization-project-section-schema'
export * from './organization-task-label-schema'
export * from './organization-task-schema'
export * from './reserve-movement-schema'
export * from './reserve-schema'
export * from './space-member-schema'
export * from './space-schema'
export * from './tag-schema'
export * from './transaction-schema'
export * from './user-schema'
export * from './relations'

export const schema = {
  budgetsTable,
  categoriesTable,
  organizationLabelsTable,
  organizationNotesTable,
  organizationProjectSectionsTable,
  organizationProjectsTable,
  organizationTaskLabelsTable,
  organizationTasksTable,
  reserveMovementsTable,
  reservesTable,
  spaceMembersTable,
  spacesTable,
  tagsTable,
  transactionsTable,
  usersTable,
}
