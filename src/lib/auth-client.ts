'use client'

import { createAuthClient } from 'better-auth/react'

import type { AppSession } from '@/lib/auth'

export const authClient = createAuthClient()

function toISOString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value
}

export function useSession(): {
  data: AppSession | null
  status: 'authenticated' | 'loading' | 'unauthenticated'
  update: () => Promise<void>
} {
  const { data, isPending, refetch } = authClient.useSession()

  return {
    data: data
      ? {
          user: data.user,
          expires: toISOString(data.session.expiresAt),
        }
      : null,
    status: isPending ? 'loading' : data ? 'authenticated' : 'unauthenticated',
    update: () => refetch(),
  }
}
