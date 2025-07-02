// Re-export for convenience
import { activityLogsTable } from './activity-log-schema'
import { usersTable } from './user-schema'

// Export all schemas and types
export * from './activity-log-schema'
export * from './user-schema'

export const schema = {
  activityLogsTable,
  usersTable,
}
