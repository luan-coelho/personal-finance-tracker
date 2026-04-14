'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    const captureInstallPrompt = (e: Event) => {
      e.preventDefault()
      window.deferredPrompt = e
    }
    window.addEventListener('beforeinstallprompt', captureInstallPrompt)

    if ('serviceWorker' in navigator && window.isSecureContext) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/', updateViaCache: 'none' })
        .catch(err => console.error('SW registration failed:', err))
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', captureInstallPrompt)
    }
  }, [])

  return null
}
