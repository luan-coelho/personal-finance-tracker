'use client'

import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'

export default function OfflinePage() {
  return (
    <main className="bg-background text-foreground flex min-h-svh items-center justify-center px-4">
      <EmptyState
        icon="wifi-off"
        title="Você está offline"
        description="Sem conexão com a internet. Algumas informações ficam indisponíveis até você voltar a ficar online."
        action={
          <Button variant="primary" icon="refresh" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        }
      />
    </main>
  )
}
