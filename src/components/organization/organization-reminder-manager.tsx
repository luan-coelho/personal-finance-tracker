'use client'

import { useEffect } from 'react'

import { useOrganizationReminderCandidates } from '@/hooks/use-organization-tasks'
import { useSelectedSpace } from '@/hooks/use-selected-space'

const SHOWN_REMINDERS_STORAGE_KEY = 'organization-reminders-shown'
const REMINDER_TARGET_URL = '/admin/organization/today'
const REMINDER_CHECK_INTERVAL = 30 * 1000
const REMINDER_LOCK_NAME = 'organization-reminders'
const SHOWN_REMINDER_VALUE = 'shown'

type ReminderTask = {
  id: string
  title: string
}

type NavigatorWithLocks = Navigator & {
  locks?: {
    request<T>(
      name: string,
      options: { ifAvailable: true },
      callback: (lock: unknown | null) => T | Promise<T>,
    ): Promise<T>
  }
}

function readReminderClaims() {
  if (typeof window === 'undefined') return {} as Record<string, string>

  try {
    const stored = window.localStorage.getItem(SHOWN_REMINDERS_STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : {}

    if (Array.isArray(parsed)) {
      return parsed
        .filter(key => typeof key === 'string')
        .reduce<Record<string, string>>((claims, key) => {
          claims[key] = SHOWN_REMINDER_VALUE
          return claims
        }, {})
    }

    if (!parsed || typeof parsed !== 'object') return {}

    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, string] => typeof entry[0] === 'string' && typeof entry[1] === 'string',
      ),
    )
  } catch {
    return {}
  }
}

function writeReminderClaims(claims: Record<string, string>) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(SHOWN_REMINDERS_STORAGE_KEY, JSON.stringify(claims))
  } catch {
    // Ignore storage errors; reminders can still show during this session.
  }
}

function buildReminderKey(spaceId: string, taskId: string, reminderAtValue: Date | string) {
  const reminderAt = new Date(reminderAtValue).toISOString()
  return `organization-task-${spaceId}-${taskId}-${reminderAt}`
}

function hasReminderClaim(reminderKey: string) {
  return reminderKey in readReminderClaims()
}

function claimReminderInStorage(reminderKey: string) {
  const currentClaims = readReminderClaims()
  const pendingValue = `pending:${globalThis.crypto?.randomUUID?.() || Date.now()}`

  if (reminderKey in currentClaims) return false

  currentClaims[reminderKey] = pendingValue
  writeReminderClaims(currentClaims)

  const verifiedClaims = readReminderClaims()
  return verifiedClaims[reminderKey] === pendingValue
}

async function claimReminder(reminderKey: string) {
  if (typeof navigator === 'undefined') return claimReminderInStorage(reminderKey)

  const locks = (navigator as NavigatorWithLocks).locks

  if (locks) {
    try {
      return await locks.request(REMINDER_LOCK_NAME, { ifAvailable: true }, lock => {
        if (!lock) return false
        return claimReminderInStorage(reminderKey)
      })
    } catch {
      return claimReminderInStorage(reminderKey)
    }
  }

  return claimReminderInStorage(reminderKey)
}

function markReminderShown(reminderKey: string) {
  const claims = readReminderClaims()

  claims[reminderKey] = SHOWN_REMINDER_VALUE
  writeReminderClaims(claims)
}

async function showReminderNotification(task: ReminderTask, tag: string) {
  const options = {
    body: task.title,
    tag,
    data: { url: REMINDER_TARGET_URL },
  }

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready
      if (registration.showNotification) {
        await registration.showNotification('Lembrete', options)
        return
      }
    } catch {
      // Fall back to the Notification constructor below.
    }
  }

  new Notification('Lembrete', {
    body: options.body,
    tag: options.tag,
  })
}

export function OrganizationReminderManager() {
  const { selectedSpace } = useSelectedSpace()
  const { data: reminders = [] } = useOrganizationReminderCandidates(selectedSpace?.id || '')

  useEffect(() => {
    if (!selectedSpace?.id) return
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    let isActive = true

    const checkReminders = () => {
      if (!isActive) return

      const now = Date.now()

      for (const task of reminders) {
        if (!task.reminderAt) continue

        const reminderTime = new Date(task.reminderAt).getTime()
        if (!Number.isFinite(reminderTime) || reminderTime > now) continue

        const reminderKey = buildReminderKey(selectedSpace.id, task.id, task.reminderAt)
        if (hasReminderClaim(reminderKey)) continue

        void claimReminder(reminderKey).then(claimed => {
          if (!claimed) return

          void showReminderNotification(task, reminderKey).finally(() => {
            markReminderShown(reminderKey)
          })
        })
      }
    }

    checkReminders()
    const intervalId = window.setInterval(checkReminders, REMINDER_CHECK_INTERVAL)

    return () => {
      isActive = false
      window.clearInterval(intervalId)
    }
  }, [reminders, selectedSpace?.id])

  return null
}
