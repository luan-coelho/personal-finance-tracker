'use client'

import { useEffect } from 'react'

export function InstallPromptCapture() {
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      ;(window as any).deferredPrompt = e
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  return null
}
