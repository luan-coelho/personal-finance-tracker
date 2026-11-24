'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

declare global {
  interface Window {
    // biome-ignore lint/suspicious/noExplicitAny: BeforeInstallPromptEvent não tem tipo no DOM lib
    deferredPrompt: any
  }
}

interface InstallPromptProps {
  className?: string
}

/** Card compacto da sidebar (acima da conta) para instalar o PWA. */
export function InstallPrompt({ className }: InstallPromptProps) {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  // biome-ignore lint/suspicious/noExplicitAny: BeforeInstallPromptEvent não tem tipo no DOM lib
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // biome-ignore lint/suspicious/noExplicitAny: MSStream só existe no IE
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream)
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)

    // O evento pode ter disparado antes da montagem (capturado em InstallPromptCapture).
    if (window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt)
    }

    // biome-ignore lint/suspicious/noExplicitAny: BeforeInstallPromptEvent não tem tipo no DOM lib
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      window.deferredPrompt = e
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  if (isStandalone || (!isIOS && !deferredPrompt)) {
    return null
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()

    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  const card = (action: React.ReactNode) => (
    <div
      data-slot="install-prompt"
      className={cn('border-border bg-card flex flex-col gap-3 rounded-2xl border p-4', className)}>
      <div className="flex items-start gap-3">
        <span className="bg-primary-soft text-primary-soft-fg inline-flex size-7 shrink-0 items-center justify-center rounded-lg">
          <Icon name="smartphone" size={16} />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm leading-5 font-semibold">Instalar o app</span>
          <span className="text-muted-foreground text-xs leading-[18px] text-pretty">
            Abra as finanças direto da tela inicial.
          </span>
        </div>
      </div>
      {action}
    </div>
  )

  if (isIOS) {
    return card(
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" icon="download" className="w-full">
            Instalar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Instalar Família Coelho</DialogTitle>
            <DialogDescription>Para instalar o app no iPhone ou iPad:</DialogDescription>
          </DialogHeader>
          <ol className="flex flex-col gap-4">
            <li className="flex items-center gap-3">
              <span className="bg-muted text-muted-foreground inline-flex size-control-md shrink-0 items-center justify-center rounded-control">
                <Icon name="share" size={20} />
              </span>
              <p className="text-sm leading-5">
                1. Toque em <span className="font-semibold">Compartilhar</span> na barra do navegador.
              </p>
            </li>
            <li className="flex items-center gap-3">
              <span className="bg-muted text-muted-foreground inline-flex size-control-md shrink-0 items-center justify-center rounded-control">
                <Icon name="plus" size={20} />
              </span>
              <p className="text-sm leading-5">
                2. Role e escolha <span className="font-semibold">Adicionar à Tela de Início</span>.
              </p>
            </li>
          </ol>
        </DialogContent>
      </Dialog>,
    )
  }

  return card(
    <Button size="sm" icon="download" className="w-full" onClick={handleInstallClick}>
      Instalar
    </Button>,
  )
}
