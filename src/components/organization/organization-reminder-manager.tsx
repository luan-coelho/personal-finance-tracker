'use client'

import { useEffect } from 'react'

import { useOrganizationReminderCandidates } from '@/hooks/use-organization-tasks'
import { useSelectedSpace } from '@/hooks/use-selected-space'

const SHOWN_REMINDERS_STORAGE_KEY = 'organization-reminders-shown'
const REMINDER_TARGET_URL = '/admin/organization/today'
const REMINDER_CHECK_INTERVAL = 30 * 1000

function readShownReminderIds() {
  if (typeof window === 'undefined') return new Set<string>()

  try {
    const stored = window.localStorage.getItem(SHOWN_REMINDERS_STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : []

    return new Set(Array.isArray(parsed) ? parsed.filter(id => typeof id === 'string') : [])
  } catch {
    return new Set<string>()
  }
}

function writeShownReminderIds(ids: Set<string>) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(SHOWN_REMINDERS_STORAGE_KEY, JSON.stringify([...ids]))
  } catch {
    // Ignore storage errors; reminders can still show during this session.
  }
}

async function showReminderNotification(task: { id: string; title: string }) {
  const options = {
    body: task.title,
    tag: `organization-task-${task.id}`,
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
      const shownReminderIds = readShownReminderIds()
      let changed = false

      for (const task of reminders) {
        if (!task.reminderAt || shownReminderIds.has(task.id)) continue

        const reminderTime = new Date(task.reminderAt).getTime()
        if (!Number.isFinite(reminderTime) || reminderTime > now) continue

        shownReminderIds.add(task.id)
        changed = true
        void showReminderNotification(task)
      }

      if (changed) {
        writeShownReminderIds(shownReminderIds)
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
