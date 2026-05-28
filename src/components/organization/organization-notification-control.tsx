'use client'

import { Bell, BellOff, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  ORGANIZATION_NOTIFICATION_PERMISSION_EVENT,
  requestOrganizationNotificationPermission,
} from '@/components/organization/organization-reminder-manager'
import { Button } from '@/components/ui/button'

type NotificationPermissionState = NotificationPermission | 'unsupported'

function readPermission(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export function OrganizationNotificationControl() {
  const [permission, setPermission] = useState<NotificationPermissionState>('unsupported')
  const [isRequesting, setIsRequesting] = useState(false)

  useEffect(() => {
    const syncPermission = () => setPermission(readPermission())

    syncPermission()
    window.addEventListener(ORGANIZATION_NOTIFICATION_PERMISSION_EVENT, syncPermission)
    document.addEventListener('visibilitychange', syncPermission)

    return () => {
      window.removeEventListener(ORGANIZATION_NOTIFICATION_PERMISSION_EVENT, syncPermission)
      document.removeEventListener('visibilitychange', syncPermission)
    }
  }, [])

  async function handleEnableNotifications() {
    if (isRequesting) return

    setIsRequesting(true)
    try {
      const nextPermission = await requestOrganizationNotificationPermission()
      setPermission(nextPermission)

      if (nextPermission === 'granted') {
        toast.success('Lembretes ativados')
      } else if (nextPermission === 'denied') {
        toast.error('Lembretes bloqueados pelo navegador')
      }
    } finally {
      setIsRequesting(false)
    }
  }

  if (permission === 'unsupported') return null

  if (permission === 'granted') {
    return (
      <div className="border-border text-muted-foreground inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm">
        <Bell className="text-primary size-4" />
        <span>Lembretes ativos</span>
      </div>
    )
  }

  if (permission === 'denied') {
    return (
      <div className="border-border text-muted-foreground inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm">
        <BellOff className="size-4" />
        <span>Lembretes bloqueados</span>
      </div>
    )
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleEnableNotifications} disabled={isRequesting}>
      {isRequesting ? <Loader2 className="size-4 animate-spin" /> : <Bell className="size-4" />}
      <span>Ativar lembretes</span>
    </Button>
  )
}
