import { and, asc, desc, eq, gt, gte, ilike, inArray, isNotNull, isNull, lt, lte, sql, type SQL } from 'drizzle-orm'

import { db } from '@/app/db'
import { organizationLabelsTable, type OrganizationLabel } from '@/app/db/schemas/organization-label-schema'
import {
  organizationProjectsTable,
  type OrganizationProject,
  type OrganizationVisibility,
} from '@/app/db/schemas/organization-project-schema'
import {
  organizationProjectSectionsTable,
  type OrganizationProjectSection,
} from '@/app/db/schemas/organization-project-section-schema'
import { organizationTaskLabelsTable } from '@/app/db/schemas/organization-task-label-schema'
import {
  organizationTasksTable,
  type OrganizationTask,
  type OrganizationTaskFormValues,
  type OrganizationTaskStatus,
} from '@/app/db/schemas/organization-task-schema'
import { usersTable } from '@/app/db/schemas/user-schema'

import { getBrazilNow } from '@/lib/date-utils'
import { organizationVisibilityWhere } from '@/lib/organization-access'
import { getNextRecurrenceDate } from '@/lib/organization-recurrence'

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

type OrganizationTaskUser = { id: string; name: string; email: string; image: string | null }

export type OrganizationTaskWithDetails = OrganizationTask & {
  labels: OrganizationLabel[]
  project?: OrganizationProject | null
  section?: OrganizationProjectSection | null
  assignee?: OrganizationTaskUser | null
  createdBy?: OrganizationTaskUser | null
}

export interface OrganizationTodayResult {
  overdue: OrganizationTaskWithDetails[]
  timedToday: OrganizationTaskWithDetails[]
  untimedToday: OrganizationTaskWithDetails[]
  upcoming: OrganizationTaskWithDetails[]
}

function uniqueNonNull(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => !!value))]
}

function uniqueValues(values: string[]): string[] {
  return [...new Set(values)]
}

function mapById<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map(item => [item.id, item]))
}

export class OrganizationTaskService {
  static async create(data: OrganizationTaskFormValues): Promise<OrganizationTask> {
    return await db.transaction(async tx => {
      const now = new Date()
      const { labelIds = [], ...taskData } = data
      const uniqueLabelIds = uniqueValues(labelIds)

      if (taskData.projectId) {
        const [project] = await tx
          .select({ id: organizationProjectsTable.id })
          .from(organizationProjectsTable)
          .where(
            and(
              eq(organizationProjectsTable.id, taskData.projectId),
              eq(organizationProjectsTable.spaceId, data.spaceId),
            ),
          )
          .limit(1)

        if (!project) {
          throw new Error('Projeto invalido para este espaco')
        }
      }

      if (taskData.sectionId) {
        const [section] = await tx
          .select({
            projectId: organizationProjectSectionsTable.projectId,
          })
          .from(organizationProjectSectionsTable)
          .innerJoin(
            organizationProjectsTable,
            eq(organizationProjectSectionsTable.projectId, organizationProjectsTable.id),
          )
          .where(
            and(
              eq(organizationProjectSectionsTable.id, taskData.sectionId),
              eq(organizationProjectsTable.spaceId, data.spaceId),
            ),
          )
          .limit(1)

        if (!section || (taskData.projectId && section.projectId !== taskData.projectId)) {
          throw new Error('Secao invalida para este espaco')
        }
      }

      if (uniqueLabelIds.length > 0) {
        const labels = await tx
          .select({ id: organizationLabelsTable.id })
          .from(organizationLabelsTable)
          .where(
            and(eq(organizationLabelsTable.spaceId, data.spaceId), inArray(organizationLabelsTable.id, uniqueLabelIds)),
          )

        if (labels.length !== uniqueLabelIds.length) {
          throw new Error('Etiqueta invalida para este espaco')
        }
      }

      const [task] = await tx
        .insert(organizationTasksTable)
        .values({
          ...taskData,
          createdAt: now,
        })
        .returning()

      if (uniqueLabelIds.length > 0) {
        await tx.insert(organizationTaskLabelsTable).values(
          uniqueLabelIds.map(labelId => ({
            taskId: task.id,
            labelId,
            createdAt: now,
          })),
        )
      }

      return task
    })
  }

  static async findById(id: string): Promise<OrganizationTask | null> {
    const [task] = await db.select().from(organizationTasksTable).where(eq(organizationTasksTable.id, id)).limit(1)

    return task || null
  }

  static async findByIdWithDetails(id: string): Promise<OrganizationTaskWithDetails | null> {
    const task = await this.findById(id)
    if (!task) return null

    const [taskWithDetails] = await this.hydrateTasks([task])
    return taskWithDetails || null
  }

  static async findMany(filters: OrganizationTaskFilters): Promise<OrganizationTaskWithDetails[]> {
    const conditions = this.visibleTaskConditions(filters.spaceId, filters.userId)

    if (filters.status) {
      conditions.push(eq(organizationTasksTable.status, filters.status))
    }

    if (filters.projectId) {
      conditions.push(eq(organizationTasksTable.projectId, filters.projectId))
    }

    if (filters.sectionId) {
      conditions.push(eq(organizationTasksTable.sectionId, filters.sectionId))
    }

    if (filters.assigneeId) {
      conditions.push(eq(organizationTasksTable.assigneeId, filters.assigneeId))
    }

    if (filters.labelId) {
      const labelTaskIds = db
        .select({ taskId: organizationTaskLabelsTable.taskId })
        .from(organizationTaskLabelsTable)
        .where(eq(organizationTaskLabelsTable.labelId, filters.labelId))

      conditions.push(inArray(organizationTasksTable.id, labelTaskIds))
    }

    if (filters.visibility) {
      conditions.push(eq(organizationTasksTable.visibility, filters.visibility))
    }

    if (filters.dateFrom) {
      conditions.push(gte(organizationTasksTable.dueDate, filters.dateFrom))
    }

    if (filters.dateTo) {
      conditions.push(lte(organizationTasksTable.dueDate, filters.dateTo))
    }

    if (filters.search) {
      conditions.push(ilike(organizationTasksTable.title, `%${filters.search}%`))
    }

    const tasks = await db
      .select()
      .from(organizationTasksTable)
      .where(and(...conditions))
      .orderBy(
        sql`${organizationTasksTable.dueDate} asc nulls last`,
        asc(organizationTasksTable.dueTime),
        desc(organizationTasksTable.createdAt),
      )

    return await this.hydrateTasks(tasks)
  }

  static async findReminderCandidates(spaceId: string, userId: string): Promise<OrganizationTaskWithDetails[]> {
    const now = new Date()
    const reminderLimit = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const conditions = this.visibleTaskConditions(spaceId, userId)

    conditions.push(
      eq(organizationTasksTable.status, 'pending'),
      isNotNull(organizationTasksTable.reminderAt),
      lte(organizationTasksTable.reminderAt, reminderLimit),
    )

    const tasks = await db
      .select()
      .from(organizationTasksTable)
      .where(and(...conditions))
      .orderBy(asc(organizationTasksTable.reminderAt))

    return await this.hydrateTasks(tasks)
  }

  static async findToday(spaceId: string, userId: string): Promise<OrganizationTodayResult> {
    const today = this.getLocalToday()
    const baseConditions = this.visibleTaskConditions(spaceId, userId)
    baseConditions.push(eq(organizationTasksTable.status, 'pending'))

    const overdueTasks = await db
      .select()
      .from(organizationTasksTable)
      .where(
        and(...baseConditions, isNotNull(organizationTasksTable.dueDate), lt(organizationTasksTable.dueDate, today)),
      )
      .orderBy(
        asc(organizationTasksTable.dueDate),
        asc(organizationTasksTable.dueTime),
        desc(organizationTasksTable.createdAt),
      )

    const timedTodayTasks = await db
      .select()
      .from(organizationTasksTable)
      .where(
        and(...baseConditions, eq(organizationTasksTable.dueDate, today), isNotNull(organizationTasksTable.dueTime)),
      )
      .orderBy(asc(organizationTasksTable.dueTime), desc(organizationTasksTable.createdAt))

    const untimedTodayTasks = await db
      .select()
      .from(organizationTasksTable)
      .where(and(...baseConditions, eq(organizationTasksTable.dueDate, today), isNull(organizationTasksTable.dueTime)))
      .orderBy(desc(organizationTasksTable.createdAt))

    const upcomingTasks = await db
      .select()
      .from(organizationTasksTable)
      .where(
        and(...baseConditions, isNotNull(organizationTasksTable.dueDate), gt(organizationTasksTable.dueDate, today)),
      )
      .orderBy(
        asc(organizationTasksTable.dueDate),
        asc(organizationTasksTable.dueTime),
        desc(organizationTasksTable.createdAt),
      )
      .limit(10)

    const allTasks = [...overdueTasks, ...timedTodayTasks, ...untimedTodayTasks, ...upcomingTasks]
    const tasksWithDetails = await this.hydrateTasks(allTasks)
    const taskById = mapById(tasksWithDetails)
    const getTask = (task: OrganizationTask) => taskById.get(task.id)

    return {
      overdue: overdueTasks.map(getTask).filter((task): task is OrganizationTaskWithDetails => !!task),
      timedToday: timedTodayTasks.map(getTask).filter((task): task is OrganizationTaskWithDetails => !!task),
      untimedToday: untimedTodayTasks.map(getTask).filter((task): task is OrganizationTaskWithDetails => !!task),
      upcoming: upcomingTasks.map(getTask).filter((task): task is OrganizationTaskWithDetails => !!task),
    }
  }

  static async update(id: string, data: Partial<OrganizationTaskFormValues>): Promise<OrganizationTask | null> {
    return await db.transaction(async tx => {
      const [existingTask] = await tx
        .select()
        .from(organizationTasksTable)
        .where(eq(organizationTasksTable.id, id))
        .limit(1)

      if (!existingTask) {
        return null
      }

      const now = new Date()
      const { labelIds, ...taskData } = data
      const effectiveSpaceId = data.spaceId ?? existingTask.spaceId
      const effectiveProjectId = data.projectId !== undefined ? data.projectId : existingTask.projectId
      const effectiveSectionId = data.sectionId !== undefined ? data.sectionId : existingTask.sectionId

      if (effectiveProjectId) {
        const [project] = await tx
          .select({ id: organizationProjectsTable.id })
          .from(organizationProjectsTable)
          .where(
            and(
              eq(organizationProjectsTable.id, effectiveProjectId),
              eq(organizationProjectsTable.spaceId, effectiveSpaceId),
            ),
          )
          .limit(1)

        if (!project) {
          throw new Error('Projeto invalido para este espaco')
        }
      }

      if (effectiveSectionId) {
        const [section] = await tx
          .select({
            projectId: organizationProjectSectionsTable.projectId,
          })
          .from(organizationProjectSectionsTable)
          .innerJoin(
            organizationProjectsTable,
            eq(organizationProjectSectionsTable.projectId, organizationProjectsTable.id),
          )
          .where(
            and(
              eq(organizationProjectSectionsTable.id, effectiveSectionId),
              eq(organizationProjectsTable.spaceId, effectiveSpaceId),
            ),
          )
          .limit(1)

        if (!section || (effectiveProjectId && section.projectId !== effectiveProjectId)) {
          throw new Error('Secao invalida para este espaco')
        }
      }

      const uniqueLabelIds = labelIds ? uniqueValues(labelIds) : []

      if (labelIds && uniqueLabelIds.length > 0) {
        const labels = await tx
          .select({ id: organizationLabelsTable.id })
          .from(organizationLabelsTable)
          .where(
            and(
              eq(organizationLabelsTable.spaceId, effectiveSpaceId),
              inArray(organizationLabelsTable.id, uniqueLabelIds),
            ),
          )

        if (labels.length !== uniqueLabelIds.length) {
          throw new Error('Etiqueta invalida para este espaco')
        }
      }

      const [task] = await tx
        .update(organizationTasksTable)
        .set({
          ...taskData,
          updatedAt: now,
        })
        .where(eq(organizationTasksTable.id, id))
        .returning()

      if (labelIds) {
        await tx.delete(organizationTaskLabelsTable).where(eq(organizationTaskLabelsTable.taskId, id))

        if (uniqueLabelIds.length > 0) {
          await tx.insert(organizationTaskLabelsTable).values(
            uniqueLabelIds.map(labelId => ({
              taskId: id,
              labelId,
              createdAt: now,
            })),
          )
        }
      }

      return task || null
    })
  }

  static async complete(id: string): Promise<OrganizationTask | null> {
    const task = await this.findById(id)
    if (!task) return null

    const now = new Date()
    const nextDueDate = getNextRecurrenceDate({
      dueDate: task.dueDate,
      recurrenceType: task.recurrenceType,
      recurrenceInterval: task.recurrenceInterval,
      recurrenceDaysOfWeek: task.recurrenceDaysOfWeek,
      recurrenceDayOfMonth: task.recurrenceDayOfMonth,
      recurrenceEndsAt: task.recurrenceEndsAt,
    })

    const [updatedTask] = await db
      .update(organizationTasksTable)
      .set(
        nextDueDate
          ? {
              status: 'pending',
              dueDate: nextDueDate,
              completedAt: null,
              lastCompletedAt: now,
              updatedAt: now,
            }
          : {
              status: 'completed',
              completedAt: now,
              lastCompletedAt: now,
              updatedAt: now,
            },
      )
      .where(eq(organizationTasksTable.id, id))
      .returning()

    return updatedTask || null
  }

  static async reopen(id: string): Promise<OrganizationTask | null> {
    const [task] = await db
      .update(organizationTasksTable)
      .set({
        status: 'pending',
        completedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(organizationTasksTable.id, id))
      .returning()

    return task || null
  }

  static async archive(id: string): Promise<OrganizationTask | null> {
    const now = new Date()
    const [task] = await db
      .update(organizationTasksTable)
      .set({
        status: 'archived',
        archivedAt: now,
        updatedAt: now,
      })
      .where(eq(organizationTasksTable.id, id))
      .returning()

    return task || null
  }

  private static visibleTaskConditions(spaceId: string, userId: string): SQL[] {
    const conditions: SQL[] = [eq(organizationTasksTable.spaceId, spaceId), isNull(organizationTasksTable.archivedAt)]
    const visibilityCondition = organizationVisibilityWhere(organizationTasksTable, userId)

    if (visibilityCondition) {
      conditions.push(visibilityCondition)
    }

    return conditions
  }

  private static async hydrateTasks(tasks: OrganizationTask[]): Promise<OrganizationTaskWithDetails[]> {
    if (tasks.length === 0) {
      return []
    }

    const taskIds = tasks.map(task => task.id)
    const projectIds = uniqueNonNull(tasks.map(task => task.projectId))
    const sectionIds = uniqueNonNull(tasks.map(task => task.sectionId))
    const userIds = uniqueNonNull([...tasks.map(task => task.assigneeId), ...tasks.map(task => task.createdById)])

    const labelRows = await db
      .select({
        taskId: organizationTaskLabelsTable.taskId,
        label: organizationLabelsTable,
      })
      .from(organizationTaskLabelsTable)
      .innerJoin(organizationLabelsTable, eq(organizationTaskLabelsTable.labelId, organizationLabelsTable.id))
      .where(inArray(organizationTaskLabelsTable.taskId, taskIds))
      .orderBy(asc(organizationLabelsTable.name))

    const labelsByTaskId = new Map<string, OrganizationLabel[]>()

    for (const row of labelRows) {
      const labels = labelsByTaskId.get(row.taskId) ?? []
      labels.push(row.label)
      labelsByTaskId.set(row.taskId, labels)
    }

    const projects =
      projectIds.length > 0
        ? await db.select().from(organizationProjectsTable).where(inArray(organizationProjectsTable.id, projectIds))
        : []
    const projectById = mapById(projects)

    const sections =
      sectionIds.length > 0
        ? await db
            .select()
            .from(organizationProjectSectionsTable)
            .where(inArray(organizationProjectSectionsTable.id, sectionIds))
        : []
    const sectionById = mapById(sections)

    const users =
      userIds.length > 0
        ? await db
            .select({
              id: usersTable.id,
              name: usersTable.name,
              email: usersTable.email,
              image: usersTable.image,
            })
            .from(usersTable)
            .where(inArray(usersTable.id, userIds))
        : []
    const userById = mapById(users)

    return tasks.map(task => ({
      ...task,
      labels: labelsByTaskId.get(task.id) ?? [],
      project: task.projectId ? (projectById.get(task.projectId) ?? null) : null,
      section: task.sectionId ? (sectionById.get(task.sectionId) ?? null) : null,
      assignee: task.assigneeId ? (userById.get(task.assigneeId) ?? null) : null,
      createdBy: userById.get(task.createdById) ?? null,
    }))
  }

  private static getLocalToday(): Date {
    const now = getBrazilNow()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }
}
