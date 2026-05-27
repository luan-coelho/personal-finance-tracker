# Organizacao, Tarefas e Notas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first usable organization module with tasks, Today view, projects, sections, labels, notes, simple recurrence, and local browser reminders.

**Architecture:** Add first-class organization tables scoped by `spaceId` and `visibility`, expose them through Next API routes and service classes that mirror the existing finance modules, and build client pages under `/admin/organization/*` with React Query hooks. Recurrence logic stays in a pure utility with node:test coverage; local reminders stay client-only and use the existing PWA/service worker path as a best-effort notification layer.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Drizzle/Postgres, Zod, React Hook Form, React Query, date-fns, shadcn/Radix UI, lucide-react, Notification API.

---

## File Structure

- Create `src/app/db/schemas/organization-project-schema.ts`: project/list table and validation.
- Create `src/app/db/schemas/organization-project-section-schema.ts`: project section table and validation.
- Create `src/app/db/schemas/organization-label-schema.ts`: label table and validation.
- Create `src/app/db/schemas/organization-task-schema.ts`: task table, enums, recurrence fields and validation.
- Create `src/app/db/schemas/organization-task-label-schema.ts`: task-label join table.
- Create `src/app/db/schemas/organization-note-schema.ts`: note table and validation.
- Modify `src/app/db/schemas/index.ts`: export and register organization tables.
- Modify `src/app/db/schemas/relations.ts`: add relations between spaces, users, projects, tasks, labels, and notes.
- Generate `drizzle/0001_*.sql` and update `drizzle/meta/_journal.json`: generated migration output from Drizzle.
- Create `src/lib/organization-recurrence.ts`: pure recurrence calculation.
- Create `src/lib/organization-recurrence.test.ts`: node:test coverage for recurrence.
- Create `src/lib/organization-access.ts`: shared access predicates for personal/shared items.
- Create `src/services/organization-project-service.ts`: project and section service methods.
- Create `src/services/organization-label-service.ts`: label service methods.
- Create `src/services/organization-task-service.ts`: task CRUD, completion, reopen, today query, recurrence advancement.
- Create `src/services/organization-note-service.ts`: note CRUD and search.
- Create API routes under `src/app/api/organization/**`.
- Create `src/hooks/use-organization-projects.ts`, `src/hooks/use-organization-labels.ts`, `src/hooks/use-organization-tasks.ts`, `src/hooks/use-organization-notes.ts`.
- Create UI components under `src/components/organization/**`.
- Create pages under `src/app/admin/organization/**`.
- Modify `src/lib/routes.ts`, `src/components/layout/app-sidebar.tsx`, and `src/app/manifest.ts`.
- Modify `src/app/layout.tsx` to mount the local reminder manager.
- Create `scripts/seed-organization-defaults.ts` and add `db:seed:organization` script to `package.json`.

---

## Task 1: Recurrence Utility With Tests

**Files:**
- Create: `src/lib/organization-recurrence.ts`
- Create: `src/lib/organization-recurrence.test.ts`

- [ ] **Step 1: Write the failing recurrence tests**

```ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { getNextRecurrenceDate, type RecurrenceInput } from './organization-recurrence'

function input(overrides: Partial<RecurrenceInput>): RecurrenceInput {
  return {
    dueDate: new Date('2026-05-27T03:00:00.000Z'),
    recurrenceType: 'none',
    recurrenceInterval: 1,
    recurrenceDaysOfWeek: [],
    recurrenceDayOfMonth: null,
    recurrenceEndsAt: null,
    ...overrides,
  }
}

describe('getNextRecurrenceDate', () => {
  it('returns null for non-recurring tasks', () => {
    assert.equal(getNextRecurrenceDate(input({ recurrenceType: 'none' })), null)
  })

  it('advances daily recurrence by interval', () => {
    assert.equal(
      getNextRecurrenceDate(input({ recurrenceType: 'daily', recurrenceInterval: 2 }))?.toISOString(),
      '2026-05-29T03:00:00.000Z',
    )
  })

  it('advances weekly recurrence to the next selected weekday', () => {
    assert.equal(
      getNextRecurrenceDate(input({ recurrenceType: 'weekly', recurrenceDaysOfWeek: [5] }))?.toISOString(),
      '2026-05-29T03:00:00.000Z',
    )
  })

  it('advances monthly recurrence to the requested day of month', () => {
    assert.equal(
      getNextRecurrenceDate(input({ recurrenceType: 'monthly', recurrenceDayOfMonth: 10 }))?.toISOString(),
      '2026-06-10T03:00:00.000Z',
    )
  })

  it('returns null when the next recurrence is after the end date', () => {
    assert.equal(
      getNextRecurrenceDate(
        input({
          recurrenceType: 'daily',
          recurrenceEndsAt: new Date('2026-05-27T23:59:59.999Z'),
        }),
      ),
      null,
    )
  })
})
```

- [ ] **Step 2: Run the tests and confirm failure**

Run: `pnpm exec tsx --test src/lib/organization-recurrence.test.ts`

Expected: FAIL with an import error because `src/lib/organization-recurrence.ts` does not exist.

- [ ] **Step 3: Implement the recurrence utility**

```ts
import { addDays, addMonths, addWeeks, addYears, getDay, setDate } from 'date-fns'

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface RecurrenceInput {
  dueDate: Date | null
  recurrenceType: RecurrenceType
  recurrenceInterval: number
  recurrenceDaysOfWeek: number[]
  recurrenceDayOfMonth: number | null
  recurrenceEndsAt: Date | null
}

function normalizeInterval(value: number) {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1
}

function clampDayOfMonth(year: number, month: number, day: number) {
  return Math.min(day, new Date(year, month + 1, 0).getDate())
}

function isAfterEnd(date: Date, end: Date | null) {
  return !!end && date.getTime() > end.getTime()
}

export function getNextRecurrenceDate(input: RecurrenceInput): Date | null {
  if (!input.dueDate || input.recurrenceType === 'none') return null

  const interval = normalizeInterval(input.recurrenceInterval)
  let next: Date | null = null

  if (input.recurrenceType === 'daily') {
    next = addDays(input.dueDate, interval)
  }

  if (input.recurrenceType === 'weekly') {
    const days = [...new Set(input.recurrenceDaysOfWeek)].sort((a, b) => a - b)
    const currentDay = getDay(input.dueDate)
    const nextWeekday = days.find(day => day > currentDay)
    if (nextWeekday !== undefined) {
      next = addDays(input.dueDate, nextWeekday - currentDay)
    } else if (days.length > 0) {
      next = addDays(input.dueDate, 7 * interval - currentDay + days[0])
    } else {
      next = addWeeks(input.dueDate, interval)
    }
  }

  if (input.recurrenceType === 'monthly') {
    const base = addMonths(input.dueDate, interval)
    const requestedDay = input.recurrenceDayOfMonth ?? input.dueDate.getDate()
    const day = clampDayOfMonth(base.getFullYear(), base.getMonth(), requestedDay)
    next = setDate(base, day)
  }

  if (input.recurrenceType === 'yearly') {
    next = addYears(input.dueDate, interval)
  }

  if (!next || isAfterEnd(next, input.recurrenceEndsAt)) return null
  return next
}
```

- [ ] **Step 4: Run the recurrence tests and confirm pass**

Run: `pnpm exec tsx --test src/lib/organization-recurrence.test.ts`

Expected: PASS for all five tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/organization-recurrence.ts src/lib/organization-recurrence.test.ts
git commit -m "test: add organization recurrence utility"
```

---

## Task 2: Database Schemas And Migration

**Files:**
- Create: `src/app/db/schemas/organization-project-schema.ts`
- Create: `src/app/db/schemas/organization-project-section-schema.ts`
- Create: `src/app/db/schemas/organization-label-schema.ts`
- Create: `src/app/db/schemas/organization-task-schema.ts`
- Create: `src/app/db/schemas/organization-task-label-schema.ts`
- Create: `src/app/db/schemas/organization-note-schema.ts`
- Modify: `src/app/db/schemas/index.ts`
- Modify: `src/app/db/schemas/relations.ts`
- Generate: `drizzle/0001_*.sql`
- Modify: `drizzle/meta/_journal.json`

- [ ] **Step 1: Add schema files**

Use these definitions, preserving local import style:

```ts
// src/app/db/schemas/organization-project-schema.ts
import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { spacesTable } from './space-schema'
import { usersTable } from './user-schema'

export const organizationVisibilityEnum = pgEnum('organization_visibility', ['shared', 'personal'])

export const organizationProjectsTable = pgTable('organization_projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  spaceId: uuid('space_id').notNull().references(() => spacesTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color').default('#10B981').notNull(),
  icon: text('icon').default('folder').notNull(),
  visibility: organizationVisibilityEnum('visibility').notNull().default('shared'),
  createdById: uuid('created_by_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
  archivedAt: timestamp('archived_at'),
})

export const insertOrganizationProjectSchema = z.object({
  spaceId: z.string().uuid('ID do espaco deve ser um UUID valido'),
  name: z.string().trim().min(1, 'Nome e obrigatorio').max(100, 'Nome deve ter no maximo 100 caracteres'),
  description: z.string().trim().max(500, 'Descricao deve ter no maximo 500 caracteres').optional(),
  color: z.string().trim().default('#10B981'),
  icon: z.string().trim().default('folder'),
  visibility: z.enum(['shared', 'personal']).default('shared'),
  createdById: z.string().uuid('ID do criador deve ser um UUID valido'),
})

export const updateOrganizationProjectSchema = insertOrganizationProjectSchema.partial().extend({
  id: z.string().uuid('ID deve ser um UUID valido'),
})

export type OrganizationProject = typeof organizationProjectsTable.$inferSelect
export type NewOrganizationProject = typeof organizationProjectsTable.$inferInsert
export type OrganizationProjectFormValues = z.infer<typeof insertOrganizationProjectSchema>
export type OrganizationVisibility = 'shared' | 'personal'
```

```ts
// src/app/db/schemas/organization-project-section-schema.ts
import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { organizationProjectsTable } from './organization-project-schema'

export const organizationProjectSectionsTable = pgTable('organization_project_sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => organizationProjectsTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
  archivedAt: timestamp('archived_at'),
})

export const insertOrganizationProjectSectionSchema = z.object({
  projectId: z.string().uuid('ID do projeto deve ser um UUID valido'),
  name: z.string().trim().min(1, 'Nome e obrigatorio').max(100, 'Nome deve ter no maximo 100 caracteres'),
  position: z.coerce.number().int().min(0).default(0),
})

export const updateOrganizationProjectSectionSchema = insertOrganizationProjectSectionSchema.partial().extend({
  id: z.string().uuid('ID deve ser um UUID valido'),
})

export type OrganizationProjectSection = typeof organizationProjectSectionsTable.$inferSelect
export type OrganizationProjectSectionFormValues = z.infer<typeof insertOrganizationProjectSectionSchema>
```

```ts
// src/app/db/schemas/organization-label-schema.ts
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { spacesTable } from './space-schema'

export const organizationLabelsTable = pgTable('organization_labels', {
  id: uuid('id').primaryKey().defaultRandom(),
  spaceId: uuid('space_id').notNull().references(() => spacesTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  color: text('color').default('#64748B').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
})

export const insertOrganizationLabelSchema = z.object({
  spaceId: z.string().uuid('ID do espaco deve ser um UUID valido'),
  name: z.string().trim().min(1, 'Nome e obrigatorio').max(50, 'Nome deve ter no maximo 50 caracteres'),
  color: z.string().trim().default('#64748B'),
})

export const updateOrganizationLabelSchema = insertOrganizationLabelSchema.partial().extend({
  id: z.string().uuid('ID deve ser um UUID valido'),
})

export type OrganizationLabel = typeof organizationLabelsTable.$inferSelect
export type OrganizationLabelFormValues = z.infer<typeof insertOrganizationLabelSchema>
```

```ts
// src/app/db/schemas/organization-task-schema.ts
import { date, integer, pgEnum, pgTable, text, time, timestamp, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { organizationProjectSectionsTable } from './organization-project-section-schema'
import { organizationProjectsTable, organizationVisibilityEnum } from './organization-project-schema'
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
  spaceId: uuid('space_id').notNull().references(() => spacesTable.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => organizationProjectsTable.id, { onDelete: 'set null' }),
  sectionId: uuid('section_id').references(() => organizationProjectSectionsTable.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  status: organizationTaskStatusEnum('status').notNull().default('pending'),
  visibility: organizationVisibilityEnum('visibility').notNull().default('shared'),
  createdById: uuid('created_by_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  assigneeId: uuid('assignee_id').references(() => usersTable.id, { onDelete: 'set null' }),
  dueDate: date('due_date', { mode: 'date' }),
  dueTime: time('due_time'),
  reminderAt: timestamp('reminder_at'),
  recurrenceType: organizationRecurrenceTypeEnum('recurrence_type').notNull().default('none'),
  recurrenceInterval: integer('recurrence_interval').notNull().default(1),
  recurrenceDaysOfWeek: integer('recurrence_days_of_week').array().notNull().default([]),
  recurrenceDayOfMonth: integer('recurrence_day_of_month'),
  recurrenceEndsAt: date('recurrence_ends_at', { mode: 'date' }),
  completedAt: timestamp('completed_at'),
  lastCompletedAt: timestamp('last_completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
  archivedAt: timestamp('archived_at'),
})

export const insertOrganizationTaskSchema = z.object({
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
  dueTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horario deve estar no formato HH:mm').nullable().optional(),
  reminderAt: z.coerce.date().nullable().optional(),
  recurrenceType: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly']).default('none'),
  recurrenceInterval: z.coerce.number().int().min(1).default(1),
  recurrenceDaysOfWeek: z.array(z.number().int().min(0).max(6)).default([]),
  recurrenceDayOfMonth: z.coerce.number().int().min(1).max(31).nullable().optional(),
  recurrenceEndsAt: z.coerce.date().nullable().optional(),
  labelIds: z.array(z.string().uuid()).default([]),
})

export const updateOrganizationTaskSchema = insertOrganizationTaskSchema.partial().extend({
  id: z.string().uuid('ID deve ser um UUID valido'),
})

export type OrganizationTask = typeof organizationTasksTable.$inferSelect
export type OrganizationTaskFormValues = z.infer<typeof insertOrganizationTaskSchema>
export type OrganizationTaskStatus = 'pending' | 'completed' | 'archived'
export type OrganizationRecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
```

```ts
// src/app/db/schemas/organization-task-label-schema.ts
import { pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core'

import { organizationLabelsTable } from './organization-label-schema'
import { organizationTasksTable } from './organization-task-schema'

export const organizationTaskLabelsTable = pgTable(
  'organization_task_labels',
  {
    taskId: uuid('task_id').notNull().references(() => organizationTasksTable.id, { onDelete: 'cascade' }),
    labelId: uuid('label_id').notNull().references(() => organizationLabelsTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => [primaryKey({ columns: [table.taskId, table.labelId] })],
)

export type OrganizationTaskLabel = typeof organizationTaskLabelsTable.$inferSelect
```

```ts
// src/app/db/schemas/organization-note-schema.ts
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { organizationProjectsTable, organizationVisibilityEnum } from './organization-project-schema'
import { organizationTasksTable } from './organization-task-schema'
import { spacesTable } from './space-schema'
import { usersTable } from './user-schema'

export const organizationNotesTable = pgTable('organization_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  spaceId: uuid('space_id').notNull().references(() => spacesTable.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => organizationProjectsTable.id, { onDelete: 'set null' }),
  taskId: uuid('task_id').references(() => organizationTasksTable.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  content: text('content').notNull().default(''),
  visibility: organizationVisibilityEnum('visibility').notNull().default('shared'),
  createdById: uuid('created_by_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
  archivedAt: timestamp('archived_at'),
})

export const insertOrganizationNoteSchema = z.object({
  spaceId: z.string().uuid('ID do espaco deve ser um UUID valido'),
  projectId: z.string().uuid('ID do projeto deve ser um UUID valido').nullable().optional(),
  taskId: z.string().uuid('ID da tarefa deve ser um UUID valido').nullable().optional(),
  title: z.string().trim().min(1, 'Titulo e obrigatorio').max(200, 'Titulo deve ter no maximo 200 caracteres'),
  content: z.string().max(10000, 'Conteudo deve ter no maximo 10000 caracteres').default(''),
  visibility: z.enum(['shared', 'personal']).default('shared'),
  createdById: z.string().uuid('ID do criador deve ser um UUID valido'),
})

export const updateOrganizationNoteSchema = insertOrganizationNoteSchema.partial().extend({
  id: z.string().uuid('ID deve ser um UUID valido'),
})

export type OrganizationNote = typeof organizationNotesTable.$inferSelect
export type OrganizationNoteFormValues = z.infer<typeof insertOrganizationNoteSchema>
```

- [ ] **Step 2: Register schemas in the barrel**

Modify `src/app/db/schemas/index.ts` so the imports and `schema` object include:

```ts
import { organizationLabelsTable } from './organization-label-schema'
import { organizationNotesTable } from './organization-note-schema'
import { organizationProjectSectionsTable } from './organization-project-section-schema'
import { organizationProjectsTable } from './organization-project-schema'
import { organizationTaskLabelsTable } from './organization-task-label-schema'
import { organizationTasksTable } from './organization-task-schema'

export * from './organization-label-schema'
export * from './organization-note-schema'
export * from './organization-project-schema'
export * from './organization-project-section-schema'
export * from './organization-task-label-schema'
export * from './organization-task-schema'
```

Add these entries to `schema`:

```ts
organizationLabelsTable,
organizationNotesTable,
organizationProjectSectionsTable,
organizationProjectsTable,
organizationTaskLabelsTable,
organizationTasksTable,
```

- [ ] **Step 3: Add Drizzle relations**

Modify `src/app/db/schemas/relations.ts` with imports:

```ts
import { organizationLabelsTable } from './organization-label-schema'
import { organizationNotesTable } from './organization-note-schema'
import { organizationProjectSectionsTable } from './organization-project-section-schema'
import { organizationProjectsTable } from './organization-project-schema'
import { organizationTaskLabelsTable } from './organization-task-label-schema'
import { organizationTasksTable } from './organization-task-schema'
```

Add relation groups:

```ts
export const organizationProjectsRelations = relations(organizationProjectsTable, ({ one, many }) => ({
  space: one(spacesTable, { fields: [organizationProjectsTable.spaceId], references: [spacesTable.id] }),
  createdBy: one(usersTable, { fields: [organizationProjectsTable.createdById], references: [usersTable.id] }),
  sections: many(organizationProjectSectionsTable),
  tasks: many(organizationTasksTable),
  notes: many(organizationNotesTable),
}))

export const organizationProjectSectionsRelations = relations(organizationProjectSectionsTable, ({ one, many }) => ({
  project: one(organizationProjectsTable, {
    fields: [organizationProjectSectionsTable.projectId],
    references: [organizationProjectsTable.id],
  }),
  tasks: many(organizationTasksTable),
}))

export const organizationLabelsRelations = relations(organizationLabelsTable, ({ one, many }) => ({
  space: one(spacesTable, { fields: [organizationLabelsTable.spaceId], references: [spacesTable.id] }),
  taskLabels: many(organizationTaskLabelsTable),
}))

export const organizationTasksRelations = relations(organizationTasksTable, ({ one, many }) => ({
  space: one(spacesTable, { fields: [organizationTasksTable.spaceId], references: [spacesTable.id] }),
  project: one(organizationProjectsTable, {
    fields: [organizationTasksTable.projectId],
    references: [organizationProjectsTable.id],
  }),
  section: one(organizationProjectSectionsTable, {
    fields: [organizationTasksTable.sectionId],
    references: [organizationProjectSectionsTable.id],
  }),
  createdBy: one(usersTable, { fields: [organizationTasksTable.createdById], references: [usersTable.id] }),
  assignee: one(usersTable, { fields: [organizationTasksTable.assigneeId], references: [usersTable.id] }),
  taskLabels: many(organizationTaskLabelsTable),
  notes: many(organizationNotesTable),
}))

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

export const organizationNotesRelations = relations(organizationNotesTable, ({ one }) => ({
  space: one(spacesTable, { fields: [organizationNotesTable.spaceId], references: [spacesTable.id] }),
  project: one(organizationProjectsTable, {
    fields: [organizationNotesTable.projectId],
    references: [organizationProjectsTable.id],
  }),
  task: one(organizationTasksTable, { fields: [organizationNotesTable.taskId], references: [organizationTasksTable.id] }),
  createdBy: one(usersTable, { fields: [organizationNotesTable.createdById], references: [usersTable.id] }),
}))
```

Add `organizationProjects`, `organizationLabels`, `organizationTasks`, and `organizationNotes` to `spacesRelations`; add created/assigned organization item lists to `usersRelations`.

- [ ] **Step 4: Generate and inspect migration**

Run: `pnpm db:generate`

Expected: Drizzle creates one new SQL file under `drizzle/` and updates `drizzle/meta/_journal.json`.

- [ ] **Step 5: Run typecheck through build**

Run: `pnpm build`

Expected: build completes or fails only on code from later tasks not yet created. At this point it should complete.

- [ ] **Step 6: Commit**

```bash
git add src/app/db/schemas drizzle
git commit -m "feat: add organization database schema"
```

---

## Task 3: Access Helpers

**Files:**
- Create: `src/lib/organization-access.ts`

- [ ] **Step 1: Create helper functions for item visibility**

```ts
import { and, eq, or } from 'drizzle-orm'

import type { OrganizationVisibility } from '@/app/db/schemas/organization-project-schema'

export interface OrganizationAccessInput {
  visibility: OrganizationVisibility
  createdById: string
}

export function canReadOrganizationItem(item: OrganizationAccessInput, userId: string) {
  return item.visibility === 'shared' || item.createdById === userId
}

export function canWriteOrganizationItem(item: OrganizationAccessInput, userId: string, canEditSpace: boolean) {
  if (item.visibility === 'personal') return item.createdById === userId
  return canEditSpace
}

export function organizationVisibilityWhere<T extends { visibility: any; createdById: any }>(
  table: T,
  userId: string,
) {
  return or(eq(table.visibility, 'shared'), and(eq(table.visibility, 'personal'), eq(table.createdById, userId)))
}
```

- [ ] **Step 2: Run TypeScript build**

Run: `pnpm build`

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/organization-access.ts
git commit -m "feat: add organization access helpers"
```

---

## Task 4: Services

**Files:**
- Create: `src/services/organization-project-service.ts`
- Create: `src/services/organization-label-service.ts`
- Create: `src/services/organization-task-service.ts`
- Create: `src/services/organization-note-service.ts`

- [ ] **Step 1: Implement project and section service**

Add methods:

```ts
export interface OrganizationProjectFilters {
  spaceId: string
  userId: string
  includeArchived?: boolean
  search?: string
}

export class OrganizationProjectService {
  static async create(data: OrganizationProjectFormValues) {}
  static async findById(id: string) {}
  static async findMany(filters: OrganizationProjectFilters) {}
  static async update(id: string, data: Partial<OrganizationProjectFormValues>) {}
  static async archive(id: string) {}
  static async createSection(data: OrganizationProjectSectionFormValues) {}
  static async updateSection(id: string, data: Partial<OrganizationProjectSectionFormValues>) {}
  static async archiveSection(id: string) {}
}
```

Use Drizzle clauses:

```ts
const conditions = [
  eq(organizationProjectsTable.spaceId, filters.spaceId),
  organizationVisibilityWhere(organizationProjectsTable, filters.userId),
]

if (!filters.includeArchived) {
  conditions.push(isNull(organizationProjectsTable.archivedAt))
}

if (filters.search) {
  conditions.push(ilike(organizationProjectsTable.name, `%${filters.search}%`))
}
```

- [ ] **Step 2: Implement label service**

Add methods:

```ts
export interface OrganizationLabelFilters {
  spaceId: string
  search?: string
}

export class OrganizationLabelService {
  static async create(data: OrganizationLabelFormValues) {}
  static async findById(id: string) {}
  static async findMany(filters: OrganizationLabelFilters) {}
  static async update(id: string, data: Partial<OrganizationLabelFormValues>) {}
  static async delete(id: string) {}
}
```

Use this condition builder when search is present, and order labels by `organizationLabelsTable.name`:

```ts
const conditions = [eq(organizationLabelsTable.spaceId, filters.spaceId)]

if (filters.search) {
  conditions.push(ilike(organizationLabelsTable.name, `%${filters.search}%`))
}
```

- [ ] **Step 3: Implement task service with labels and recurrence**

Include these interfaces:

```ts
export interface OrganizationTaskFilters {
  spaceId: string
  userId: string
  status?: OrganizationTaskStatus
  projectId?: string
  sectionId?: string
  assigneeId?: string
  labelId?: string
  visibility?: OrganizationVisibility
  dateFrom?: Date
  dateTo?: Date
  search?: string
}

export type OrganizationTaskWithDetails = OrganizationTask & {
  labels: OrganizationLabel[]
  project?: OrganizationProject | null
  section?: OrganizationProjectSection | null
  assignee?: { id: string; name: string; email: string; image: string | null } | null
  createdBy?: { id: string; name: string; email: string; image: string | null } | null
}
```

Use transaction logic when creating/updating task labels:

```ts
await tx.delete(organizationTaskLabelsTable).where(eq(organizationTaskLabelsTable.taskId, taskId))

if (labelIds.length > 0) {
  await tx.insert(organizationTaskLabelsTable).values(labelIds.map(labelId => ({ taskId, labelId })))
}
```

Completion must use recurrence:

```ts
static async complete(id: string): Promise<OrganizationTask | null> {
  const task = await this.findById(id)
  if (!task) return null

  const completedAt = new Date()
  const nextDueDate = getNextRecurrenceDate({
    dueDate: task.dueDate,
    recurrenceType: task.recurrenceType,
    recurrenceInterval: task.recurrenceInterval,
    recurrenceDaysOfWeek: task.recurrenceDaysOfWeek,
    recurrenceDayOfMonth: task.recurrenceDayOfMonth,
    recurrenceEndsAt: task.recurrenceEndsAt,
  })

  if (nextDueDate) {
    const [updated] = await db
      .update(organizationTasksTable)
      .set({
        dueDate: nextDueDate,
        completedAt: null,
        lastCompletedAt: completedAt,
        updatedAt: completedAt,
      })
      .where(eq(organizationTasksTable.id, id))
      .returning()
    return updated || null
  }

  const [updated] = await db
    .update(organizationTasksTable)
    .set({ status: 'completed', completedAt, lastCompletedAt: completedAt, updatedAt: completedAt })
    .where(eq(organizationTasksTable.id, id))
    .returning()
  return updated || null
}
```

- [ ] **Step 4: Implement note service**

Add methods:

```ts
export interface OrganizationNoteFilters {
  spaceId: string
  userId: string
  projectId?: string
  taskId?: string
  search?: string
  includeArchived?: boolean
}

export class OrganizationNoteService {
  static async create(data: OrganizationNoteFormValues) {}
  static async findById(id: string) {}
  static async findMany(filters: OrganizationNoteFilters) {}
  static async update(id: string, data: Partial<OrganizationNoteFormValues>) {}
  static async archive(id: string) {}
}
```

Search should match title or content:

```ts
conditions.push(or(ilike(organizationNotesTable.title, `%${filters.search}%`), ilike(organizationNotesTable.content, `%${filters.search}%`)))
```

- [ ] **Step 5: Build**

Run: `pnpm build`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/services/organization-project-service.ts src/services/organization-label-service.ts src/services/organization-task-service.ts src/services/organization-note-service.ts
git commit -m "feat: add organization services"
```

---

## Task 5: API Routes

**Files:**
- Create route files under `src/app/api/organization/projects`, `labels`, `tasks`, `today`, and `notes`.

- [ ] **Step 1: Add project routes**

Create:

```txt
src/app/api/organization/projects/route.ts
src/app/api/organization/projects/[id]/route.ts
src/app/api/organization/projects/[id]/sections/route.ts
src/app/api/organization/projects/[id]/sections/[sectionId]/route.ts
```

Pattern for list/create:

```ts
export async function GET(request: NextRequest) {
  const session = await getCurrentSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const spaceId = searchParams.get('spaceId')
  if (!spaceId) return NextResponse.json({ error: 'spaceId e obrigatorio' }, { status: 400 })

  if (!session.user.email || !(await canViewSpace(session.user.email, spaceId))) {
    return NextResponse.json({ error: 'Acesso negado ao espaco' }, { status: 403 })
  }

  const projects = await OrganizationProjectService.findMany({
    spaceId,
    userId: session.user.id,
    search: searchParams.get('search') || undefined,
  })
  return NextResponse.json(projects)
}
```

For shared create/update, use `canManageSpace`; for personal create/update, allow only the creator.

- [ ] **Step 2: Add label routes**

Create:

```txt
src/app/api/organization/labels/route.ts
src/app/api/organization/labels/[id]/route.ts
```

Labels are shared per space. Require `canManageSpace` for POST/PUT/DELETE and `canViewSpace` for GET.

- [ ] **Step 3: Add task routes**

Create:

```txt
src/app/api/organization/tasks/route.ts
src/app/api/organization/tasks/[id]/route.ts
src/app/api/organization/tasks/[id]/complete/route.ts
src/app/api/organization/tasks/[id]/reopen/route.ts
src/app/api/organization/tasks/reminders/route.ts
src/app/api/organization/today/route.ts
```

On create, inject `createdById` from session:

```ts
const body = await request.json()
const validatedData = insertOrganizationTaskSchema.parse({
  ...body,
  createdById: session.user.id,
})
```

For `/today`, query by `spaceId` and return:

```ts
return NextResponse.json({
  overdue,
  timedToday,
  untimedToday,
  upcoming,
})
```

For `/tasks/reminders`, query by `spaceId`, return open tasks with `reminderAt` not null and `reminderAt <= now + 24 hours`, and reuse the same visibility rules as the task list.

- [ ] **Step 4: Add note routes**

Create:

```txt
src/app/api/organization/notes/route.ts
src/app/api/organization/notes/[id]/route.ts
```

Use the same visibility rules as tasks and projects.

- [ ] **Step 5: Build**

Run: `pnpm build`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/organization
git commit -m "feat: add organization api routes"
```

---

## Task 6: React Query Hooks

**Files:**
- Create: `src/hooks/use-organization-projects.ts`
- Create: `src/hooks/use-organization-labels.ts`
- Create: `src/hooks/use-organization-tasks.ts`
- Create: `src/hooks/use-organization-notes.ts`

- [ ] **Step 1: Implement project hooks**

```ts
export const organizationProjectKeys = {
  all: ['organization-projects'] as const,
  lists: () => [...organizationProjectKeys.all, 'list'] as const,
  list: (spaceId: string, search?: string) => [...organizationProjectKeys.lists(), { spaceId, search }] as const,
}

export function useOrganizationProjects(spaceId: string, search?: string) {
  return useQuery({
    queryKey: organizationProjectKeys.list(spaceId, search),
    queryFn: async () => {
      const params = new URLSearchParams({ spaceId })
      if (search) params.append('search', search)
      const response = await fetch(`/api/organization/projects?${params}`)
      if (!response.ok) throw new Error('Erro ao buscar projetos')
      return response.json() as Promise<OrganizationProject[]>
    },
    enabled: !!spaceId,
  })
}
```

Add create/update/archive/section mutations that invalidate `organizationProjectKeys.all`.

- [ ] **Step 2: Implement label hooks**

Use the same shape as categories:

```ts
export const organizationLabelKeys = {
  all: ['organization-labels'] as const,
  list: (spaceId: string, search?: string) => [...organizationLabelKeys.all, { spaceId, search }] as const,
}
```

Add `useOrganizationLabels`, `useCreateOrganizationLabel`, `useUpdateOrganizationLabel`, and `useDeleteOrganizationLabel`.

- [ ] **Step 3: Implement task hooks**

Include query keys:

```ts
export const organizationTaskKeys = {
  all: ['organization-tasks'] as const,
  today: (spaceId: string) => [...organizationTaskKeys.all, 'today', spaceId] as const,
  reminders: (spaceId: string) => [...organizationTaskKeys.all, 'reminders', spaceId] as const,
  list: (filters: OrganizationTaskFilters) => [...organizationTaskKeys.all, 'list', filters] as const,
}
```

Mutations must invalidate task lists and today:

```ts
queryClient.invalidateQueries({ queryKey: organizationTaskKeys.all })
```

Add the reminder candidate hook used by the local notification manager:

```ts
export function useOrganizationReminderCandidates(spaceId: string) {
  return useQuery({
    queryKey: organizationTaskKeys.reminders(spaceId),
    queryFn: async () => {
      const params = new URLSearchParams({ spaceId })
      const response = await fetch(`/api/organization/tasks/reminders?${params}`)
      if (!response.ok) throw new Error('Erro ao buscar lembretes')
      return response.json() as Promise<OrganizationTaskWithDetails[]>
    },
    enabled: !!spaceId,
    refetchInterval: 60 * 1000,
  })
}
```

- [ ] **Step 4: Implement note hooks**

Include `useOrganizationNotes`, `useCreateOrganizationNote`, `useUpdateOrganizationNote`, and `useArchiveOrganizationNote`.

- [ ] **Step 5: Build**

Run: `pnpm build`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/use-organization-projects.ts src/hooks/use-organization-labels.ts src/hooks/use-organization-tasks.ts src/hooks/use-organization-notes.ts
git commit -m "feat: add organization hooks"
```

---

## Task 7: Shared Organization Components

**Files:**
- Create: `src/components/organization/organization-empty-state.tsx`
- Create: `src/components/organization/organization-quick-capture.tsx`
- Create: `src/components/organization/organization-task-card.tsx`
- Create: `src/components/organization/organization-task-form.tsx`
- Create: `src/components/organization/organization-note-form.tsx`
- Create: `src/components/organization/organization-project-form.tsx`
- Create: `src/components/organization/organization-label-form.tsx`

- [ ] **Step 1: Add empty state**

```tsx
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function OrganizationEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}
```

- [ ] **Step 2: Add quick capture**

```tsx
'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCreateOrganizationTask } from '@/hooks/use-organization-tasks'

export function OrganizationQuickCapture({ spaceId }: { spaceId: string }) {
  const [title, setTitle] = useState('')
  const createTask = useCreateOrganizationTask()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    await createTask.mutateAsync({ spaceId, title: trimmed, visibility: 'shared' })
    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input value={title} onChange={event => setTitle(event.target.value)} placeholder="Adicionar tarefa rapida..." />
      <Button type="submit" disabled={createTask.isPending} className="shrink-0">
        <Plus className="h-4 w-4 md:mr-2" />
        <span className="hidden md:inline">Adicionar</span>
      </Button>
    </form>
  )
}
```

- [ ] **Step 3: Add task card**

Card props:

```ts
interface OrganizationTaskCardProps {
  task: OrganizationTaskWithDetails
  onEdit: (task: OrganizationTaskWithDetails) => void
  onComplete: (task: OrganizationTaskWithDetails) => void
  onReopen: (task: OrganizationTaskWithDetails) => void
}
```

Render title, due date/time, project, labels, assignee, visibility badge, and icon buttons for complete/edit/reopen using lucide icons.

- [ ] **Step 4: Add forms**

Use `react-hook-form`, `zodResolver`, existing `DatePicker`, `TimePickerDemo`, `Select`, `MultiSelect`, `Textarea`, and `Switch`.

Task form fields:

```ts
title
description
projectId
sectionId
labelIds
dueDate
dueTime
reminderAt
recurrenceType
recurrenceInterval
recurrenceDaysOfWeek
recurrenceDayOfMonth
recurrenceEndsAt
assigneeId
visibility
```

Use `selectedSpace.id` for `spaceId`. Use `spaceMembers` to build assignee options.

- [ ] **Step 5: Build**

Run: `pnpm build`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/organization
git commit -m "feat: add organization ui components"
```

---

## Task 8: Today And Task Pages

**Files:**
- Create: `src/app/admin/organization/today/page.tsx`
- Create: `src/app/admin/organization/tasks/page.tsx`

- [ ] **Step 1: Build Today page**

Page structure:

```tsx
'use client'

function TodaySkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}

function TodaySection({
  title,
  tasks,
  onEdit,
  onComplete,
  onReopen,
}: {
  title: string
  tasks: OrganizationTaskWithDetails[]
  onEdit: (task: OrganizationTaskWithDetails) => void
  onComplete: (task: OrganizationTaskWithDetails) => void
  onReopen: (task: OrganizationTaskWithDetails) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nada por aqui.</p>
        ) : (
          tasks.map(task => (
            <OrganizationTaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onComplete={onComplete}
              onReopen={onReopen}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}

export default function OrganizationTodayPage() {
  const { selectedSpace, isLoading: isSpaceLoading } = useSelectedSpace()
  const todayQuery = useOrganizationToday(selectedSpace?.id || '')
  const [editingTask, setEditingTask] = useState<OrganizationTaskWithDetails | null>(null)
  const completeTask = useCompleteOrganizationTask()
  const reopenTask = useReopenOrganizationTask()

  const handleComplete = (task: OrganizationTaskWithDetails) => completeTask.mutate(task.id)
  const handleReopen = (task: OrganizationTaskWithDetails) => reopenTask.mutate(task.id)

  if (isSpaceLoading && !selectedSpace) return <TodaySkeleton />
  if (!selectedSpace) return <OrganizationEmptyState title="Nenhum espaco selecionado" description="Selecione um espaco para ver suas tarefas." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hoje</h1>
        <p className="text-muted-foreground">Tarefas atrasadas, compromissos do dia e proximas pendencias.</p>
      </div>
      <OrganizationQuickCapture spaceId={selectedSpace.id} />
      <TodaySection title="Atrasadas" tasks={todayQuery.data?.overdue || []} onEdit={setEditingTask} onComplete={handleComplete} onReopen={handleReopen} />
      <TodaySection title="Com horario" tasks={todayQuery.data?.timedToday || []} onEdit={setEditingTask} onComplete={handleComplete} onReopen={handleReopen} />
      <TodaySection title="Sem horario" tasks={todayQuery.data?.untimedToday || []} onEdit={setEditingTask} onComplete={handleComplete} onReopen={handleReopen} />
      <TodaySection title="Proximas" tasks={todayQuery.data?.upcoming || []} onEdit={setEditingTask} onComplete={handleComplete} onReopen={handleReopen} />
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent>
          {editingTask && <OrganizationTaskForm task={editingTask} onSuccess={() => setEditingTask(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

- [ ] **Step 2: Build Tasks page**

Include filters for status, project, assignee, visibility, and search. Use the same card-header layout used in `src/app/admin/categories/page.tsx` and render `OrganizationTaskCard` rows or a compact table on desktop.

- [ ] **Step 3: Build**

Run: `pnpm build`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/organization/today/page.tsx src/app/admin/organization/tasks/page.tsx
git commit -m "feat: add organization task views"
```

---

## Task 9: Projects, Sections, Labels, And Notes Pages

**Files:**
- Create: `src/app/admin/organization/projects/page.tsx`
- Create: `src/app/admin/organization/notes/page.tsx`

- [ ] **Step 1: Build Projects page**

Include:

- Project list.
- New/edit project dialog.
- Section list inside selected project.
- Label management area in the same page.

Use `Card`, `Dialog`, `Table`, and dropdown menu patterns already used by categories.

- [ ] **Step 2: Build Notes page**

Include:

- Search input.
- New note dialog.
- Note cards with title, content preview, visibility badge, project badge and task badge when present.
- Edit/archive actions.

- [ ] **Step 3: Build**

Run: `pnpm build`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/organization/projects/page.tsx src/app/admin/organization/notes/page.tsx
git commit -m "feat: add organization project and note views"
```

---

## Task 10: Local Reminder Manager

**Files:**
- Create: `src/components/organization/organization-reminder-manager.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `public/sw.js`

- [ ] **Step 1: Add reminder manager component**

```tsx
'use client'

import { useEffect, useRef } from 'react'

import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useOrganizationReminderCandidates } from '@/hooks/use-organization-tasks'

const STORAGE_KEY = 'organization-reminders-shown'

function readShown() {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as string[])
  } catch {
    return new Set<string>()
  }
}

function writeShown(values: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...values].slice(-200)))
}

export function OrganizationReminderManager() {
  const { selectedSpace } = useSelectedSpace()
  const query = useOrganizationReminderCandidates(selectedSpace?.id || '')
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!selectedSpace?.id || typeof window === 'undefined' || !('Notification' in window)) return

    timerRef.current = window.setInterval(() => {
      if (Notification.permission !== 'granted') return
      const shown = readShown()
      const now = Date.now()

      for (const task of query.data || []) {
        if (!task.reminderAt) continue
        const reminderTime = new Date(task.reminderAt).getTime()
        if (reminderTime > now || shown.has(task.id)) continue

        new Notification('Lembrete', {
          body: task.title,
          tag: `organization-task-${task.id}`,
        })
        shown.add(task.id)
      }

      writeShown(shown)
    }, 30000)

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [query.data, selectedSpace?.id])

  return null
}
```

- [ ] **Step 2: Mount manager in root layout**

Inside `SpaceProvider`, after `{children}`, add:

```tsx
<OrganizationReminderManager />
```

- [ ] **Step 3: Add service worker notification click handler**

Append to `public/sw.js`:

```js
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow('/admin/organization/today')
    })
  )
})
```

- [ ] **Step 4: Build**

Run: `pnpm build`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/organization/organization-reminder-manager.tsx src/app/layout.tsx public/sw.js
git commit -m "feat: add local organization reminders"
```

---

## Task 11: Navigation, Routes, Manifest, And Seeds

**Files:**
- Modify: `src/lib/routes.ts`
- Modify: `src/components/layout/app-sidebar.tsx`
- Modify: `src/app/manifest.ts`
- Create: `scripts/seed-organization-defaults.ts`
- Modify: `package.json`

- [ ] **Step 1: Add routes**

Add to `routes.frontend.admin`:

```ts
organization: {
  today: '/admin/organization/today',
  tasks: '/admin/organization/tasks',
  projects: '/admin/organization/projects',
  notes: '/admin/organization/notes',
},
```

Add to `routes.api`:

```ts
organization: {
  projects: '/api/organization/projects',
  labels: '/api/organization/labels',
  tasks: '/api/organization/tasks',
  today: '/api/organization/today',
  notes: '/api/organization/notes',
},
```

- [ ] **Step 2: Add sidebar items**

Import icons:

```ts
import { CalendarCheck, CheckSquare, ClipboardList, NotebookText } from 'lucide-react'
```

Add a sidebar group named `Organizacao` with items:

```ts
const organizationItems = [
  { title: 'Hoje', url: routes.frontend.admin.organization.today, icon: CalendarCheck },
  { title: 'Tarefas', url: routes.frontend.admin.organization.tasks, icon: CheckSquare },
  { title: 'Projetos', url: routes.frontend.admin.organization.projects, icon: ClipboardList },
  { title: 'Notas', url: routes.frontend.admin.organization.notes, icon: NotebookText },
]
```

- [ ] **Step 3: Add manifest shortcuts**

Add shortcuts for Hoje and Tarefas:

```ts
{
  name: 'Hoje',
  url: '/admin/organization/today',
  icons: [{ src: '/icon-192x192.png', sizes: '192x192' }],
},
{
  name: 'Tarefas',
  url: '/admin/organization/tasks',
  icons: [{ src: '/icon-192x192.png', sizes: '192x192' }],
},
```

- [ ] **Step 4: Add idempotent seed script**

Create `scripts/seed-organization-defaults.ts` that:

- Loads `.env`.
- Reads all spaces.
- Creates default shared projects: Casa, Compras, Trabalho, Estudos, Projetos, Igreja.
- Creates sections per project: A fazer, Aguardando, Concluido.
- Creates labels: urgente, mercado, ligacao, online.
- Checks existing records by `spaceId` and `name` before inserting.

Add package script:

```json
"db:seed:organization": "TZ=America/Sao_Paulo tsx scripts/seed-organization-defaults.ts"
```

- [ ] **Step 5: Build**

Run: `pnpm build`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/routes.ts src/components/layout/app-sidebar.tsx src/app/manifest.ts scripts/seed-organization-defaults.ts package.json
git commit -m "feat: wire organization navigation and seed"
```

---

## Task 12: Final Verification

**Files:**
- No new files unless verification exposes bugs.

- [ ] **Step 1: Run recurrence tests**

Run: `pnpm exec tsx --test src/lib/organization-recurrence.test.ts`

Expected: PASS.

- [ ] **Step 2: Run formatting check**

Run: `pnpm exec prettier --check .`

Expected: PASS.

- [ ] **Step 3: Run lint**

Run: `pnpm exec eslint .`

Expected: PASS.

- [ ] **Step 4: Run production build**

Run: `pnpm build`

Expected: PASS.

- [ ] **Step 5: Run database migration locally**

Run: `pnpm db:migrate`

Expected: migration applies successfully to the configured Postgres database.

- [ ] **Step 6: Seed defaults**

Run: `pnpm db:seed:organization`

Expected: script prints created/skipped defaults and exits with code 0.

- [ ] **Step 7: Start dev server**

Run: `pnpm dev`

Expected: local app starts on `http://localhost:3000` or the next available port selected by Next.

- [ ] **Step 8: Manual browser verification**

Open the app and verify:

- `/admin/organization/today` shows the quick capture field.
- Creating "Comprar pilha" from quick capture adds a pending shared task.
- Creating a task with today's date and a time appears in "Com horario".
- Creating a task with a past date appears in "Atrasadas".
- Completing a daily recurring task advances its date instead of disappearing.
- A personal note is visible to its creator.
- A shared note appears within the selected space.
- Notification permission can be requested and denied without breaking task creation.

- [ ] **Step 9: Commit verification fixes if any**

If verification required fixes, run `git status --short`, stage only the exact files changed by those fixes, and commit with:

```bash
git commit -m "fix: stabilize organization module"
```

If no fixes were needed, leave the tree clean and do not create an empty commit.
