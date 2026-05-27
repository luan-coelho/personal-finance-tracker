import { and, eq, or, type AnyColumn } from 'drizzle-orm'

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

export function organizationVisibilityWhere<
  T extends {
    visibility: AnyColumn<{ data: OrganizationVisibility }>
    createdById: AnyColumn<{ data: string }>
  },
>(table: T, userId: string) {
  return or(eq(table.visibility, 'shared'), and(eq(table.visibility, 'personal'), eq(table.createdById, userId)))
}
