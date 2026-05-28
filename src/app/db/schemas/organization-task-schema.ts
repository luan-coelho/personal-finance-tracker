import { sql } from 'drizzle-orm'
import { date, integer, pgEnum, pgTable, text, time, timestamp, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { organizationProjectsTable, organizationVisibilityEnum } from './organization-project-schema'
import { organizationProjectSectionsTable } from './organization-project-section-schema'
import { spacesTable } from './space-schema'
import { usersTable } from './user-schema'

export const organizationTaskStatusEnum = pgEnum('organization_task_status', ['pending', 'completed', 'archived'])
export const organizationRecurrenceTypeEnum = pgEnum('organization_recurrence_type', [
  'none',
  'daily',
  'weekly',
  'monthly',
  'yearly',
])

export const organizationTasksTable = pgTable('organization_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  spaceId: uuid('space_id')
    .notNull()
    .references(() => spacesTable.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => organizationProjectsTable.id, { onDelete: 'set null' }),
  sectionId: uuid('section_id').references(() => organizationProjectSectionsTable.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  status: organizationTaskStatusEnum('status').notNull().default('pending'),
  visibility: organizationVisibilityEnum('visibility').notNull().default('shared'),
  createdById: uuid('created_by_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  assigneeId: uuid('assignee_id').references(() => usersTable.id, { onDelete: 'set null' }),
  dueDate: date('due_date', { mode: 'date' }),
  dueTime: time('due_time'),
  reminderAt: timestamp('reminder_at'),
  recurrenceType: organizationRecurrenceTypeEnum('recurrence_type').notNull().default('none'),
  recurrenceInterval: integer('recurrence_interval').notNull().default(1),
  recurrenceDaysOfWeek: integer('recurrence_days_of_week')
    .array()
    .notNull()
    .default(sql`'{}'::integer[]`),
  recurrenceDayOfMonth: integer('recurrence_day_of_month'),
  recurrenceEndsAt: date('recurrence_ends_at', { mode: 'date' }),
  completedAt: timestamp('completed_at'),
  lastCompletedAt: timestamp('last_completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
  archivedAt: timestamp('archived_at'),
})

const recurringTaskDueDateMessage = 'Data e obrigatoria para tarefas recorrentes'

export const organizationTaskSchemaBase = z.object({
  spaceId: z.string().uuid('ID do espaco deve ser um UUID valido'),
  projectId: z.string().uuid('ID do projeto deve ser um UUID valido').nullable().optional(),
  sectionId: z.string().uuid('ID da secao deve ser um UUID valido').nullable().optional(),
  title: z.string().trim().min(1, 'Titulo e obrigatorio').max(200, 'Titulo deve ter no maximo 200 caracteres'),
  description: z.string().trim().max(2000, 'Descricao deve ter no maximo 2000 caracteres').nullable().optional(),
  status: z.enum(['pending', 'completed', 'archived']).default('pending'),
  visibility: z.enum(['shared', 'personal']).default('shared'),
  createdById: z.string().uuid('ID do criador deve ser um UUID valido'),
  assigneeId: z.string().uuid('ID do responsavel deve ser um UUID valido').nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  dueTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horario deve estar no formato HH:mm')
    .nullable()
    .optional(),
  reminderAt: z.coerce.date().nullable().optional(),
  recurrenceType: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly']).default('none'),
  recurrenceInterval: z.coerce.number().int().min(1).default(1),
  recurrenceDaysOfWeek: z.array(z.number().int().min(0).max(6)).default([]),
  recurrenceDayOfMonth: z.coerce.number().int().min(1).max(31).nullable().optional(),
  recurrenceEndsAt: z.coerce.date().nullable().optional(),
  labelIds: z.array(z.string().uuid()).default([]),
})

export const insertOrganizationTaskSchema = organizationTaskSchemaBase.superRefine((data, ctx) => {
  if (data.recurrenceType !== 'none' && !data.dueDate) {
    ctx.addIssue({
      code: 'custom',
      path: ['dueDate'],
      message: recurringTaskDueDateMessage,
    })
  }
})

export const organizationTaskFormSchema = organizationTaskSchemaBase
  .omit({ createdById: true })
  .superRefine((data, ctx) => {
    if (data.recurrenceType !== 'none' && !data.dueDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['dueDate'],
        message: recurringTaskDueDateMessage,
      })
    }
  })

export const updateOrganizationTaskSchema = organizationTaskSchemaBase
  .partial()
  .extend({
    id: z.string().uuid('ID deve ser um UUID valido'),
  })
  .superRefine((data, ctx) => {
    if (data.recurrenceType && data.recurrenceType !== 'none' && data.dueDate === null) {
      ctx.addIssue({
        code: 'custom',
        path: ['dueDate'],
        message: recurringTaskDueDateMessage,
      })
    }
  })

export type OrganizationTask = typeof organizationTasksTable.$inferSelect
export type NewOrganizationTask = typeof organizationTasksTable.$inferInsert
export type OrganizationTaskFormValues = z.infer<typeof insertOrganizationTaskSchema>
export type UpdateOrganizationTaskFormValues = z.infer<typeof updateOrganizationTaskSchema>
export type OrganizationTaskStatus = 'pending' | 'completed' | 'archived'
export type OrganizationRecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
