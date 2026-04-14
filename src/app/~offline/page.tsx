'use client'

import { WifiOff } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="bg-muted flex h-20 w-20 items-center justify-center rounded-full">
        <WifiOff className="text-muted-foreground h-10 w-10" aria-hidden />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Você está offline</h1>
        <p className="text-muted-foreground max-w-md text-sm">
          Sem conexão com a internet. Algumas informações podem estar indisponíveis até você voltar a ficar online.
        </p>
      </div>
      <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
    </main>
  )
}
