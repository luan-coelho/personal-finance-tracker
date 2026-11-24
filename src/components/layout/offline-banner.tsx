'use client'

import { useEffect } from 'react'

import { Icon } from '@/components/ui/icon'

import { useOnlineStatus } from '@/hooks/use-online-status'

import { cn } from '@/lib/utils'

/**
 * Radar OfflineBanner: faixa em `inverse` no topo da área de conteúdo enquanto o aparelho está
 * sem conexão. É estado, não erro: nada é bloqueado e os últimos dados continuam na tela.
 *
 * Marca `<html data-offline>` para a AppBar descer a altura da faixa (`--offline-banner`).
 */
export function OfflineBanner({ className }: { className?: string }) {
  const online = useOnlineStatus()

  useEffect(() => {
    const root = document.documentElement
    if (online) {
      delete root.dataset.offline
    } else {
      root.dataset.offline = 'true'
    }
    return () => {
      delete root.dataset.offline
    }
  }, [online])

  if (online) return null

  return (
    <div
      role="status"
      data-slot="offline-banner"
      className={cn(
        'bg-inverse text-inverse-fg pt-safe-top sticky top-0 z-40 print:hidden',
        'animate-in fade-in-0 slide-in-from-top-2 duration-200',
        className,
      )}>
      <p className="m-0 flex h-10 items-center justify-center gap-2 px-4 text-sm leading-5 font-medium">
        <Icon name="wifi-off" size={18} />
        Você está offline
      </p>
    </div>
  )
}
