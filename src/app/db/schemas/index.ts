// Re-export for convenience
import { activityLogsTable } from './activity-log-schema'
import { spacesTable } from './space-schema'
import { transactionsTable } from './transaction-schema'
import { usersTable } from './user-schema'

// Export all schemas and types
export * from './activity-log-schema'
export * from './space-schema'
export * from './transaction-schema'
export * from './user-schema'
export * from './relations'

export const schema = {
  activityLogsTable,
  spacesTable,
  transactionsTable,
  usersTable,
}
