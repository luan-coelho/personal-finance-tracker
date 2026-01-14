'use client'

import { Download, Share } from 'lucide-react'
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
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream)
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  if (isStandalone) {
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

  if (isIOS) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Dialog>
                <DialogTrigger asChild>
                  <SidebarMenuButton>
                    <Download className="mr-2 h-4 w-4" />
                    <span>Instalar App</span>
                  </SidebarMenuButton>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Instalar Finanças Pessoais</DialogTitle>
                    <DialogDescription>Para instalar este aplicativo no seu dispositivo iOS:</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                        <Share className="h-5 w-5" />
                      </div>
                      <p className="text-sm">
                        1. Toque no botão <span className="font-semibold">Compartilhar</span> na barra inferior do
                        navegador.
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                        <span className="text-xl font-bold">+</span>
                      </div>
                      <p className="text-sm">
                        2. Role para baixo e selecione <span className="font-semibold">Adicionar à Tela de Início</span>
                        .
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  if (deferredPrompt) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleInstallClick}>
                <Download className="mr-2 h-4 w-4" />
                <span>Instalar App</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return null
}
