import Link from 'next/link'
import { Suspense } from 'react'

import { SpacesTable, SpacesTableSkeleton } from '@/components/spaces-table'
import { Button } from '@/components/ui/button'
import { PageActions } from '@/components/ui/page-actions'
import { PageHeader } from '@/components/ui/page-header'

import { routes } from '@/lib/routes'

export default function SpacesPage() {
  return (
    <>
      <PageHeader
        title="Espaços"
        description="Espaços financeiros que você criou ou que foram compartilhados com você"
      />
      <PageActions
        actions={
          <Button variant="primary" icon="plus" asChild>
            <Link href={routes.frontend.admin.spaces.create}>Novo espaço</Link>
          </Button>
        }
      />
      <Suspense fallback={<SpacesTableSkeleton />}>
        <SpacesTable />
      </Suspense>
    </>
  )
}
