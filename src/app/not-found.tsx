import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'

import { routes } from '@/lib/routes'

export default function NotFoundPage() {
  return (
    <main className="bg-background text-foreground flex min-h-svh items-center justify-center px-4">
      <EmptyState
        icon="search"
        title="Página não encontrada"
        description="O endereço pode estar errado ou a página foi removida. Volte para as suas transações."
        action={
          <Button asChild variant="primary">
            <Link href={routes.frontend.admin.index} prefetch={false}>
              Ir para transações
            </Link>
          </Button>
        }
      />
    </main>
  )
}
