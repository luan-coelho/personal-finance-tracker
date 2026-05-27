import { pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core'

import { organizationLabelsTable } from './organization-label-schema'
import { organizationTasksTable } from './organization-task-schema'

export const organizationTaskLabelsTable = pgTable(
  'organization_task_labels',
  {
    taskId: uuid('task_id')
      .notNull()
      .references(() => organizationTasksTable.id, { onDelete: 'cascade' }),
    labelId: uuid('label_id')
      .notNull()
      .references(() => organizationLabelsTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => [primaryKey({ columns: [table.taskId, table.labelId] })],
)

export type OrganizationTaskLabel = typeof organizationTaskLabelsTable.$inferSelect
export type NewOrganizationTaskLabel = typeof organizationTaskLabelsTable.$inferInsert
