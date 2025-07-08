import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

import { SpacesTable } from '@/components/spaces-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { routes } from '@/lib/routes'

export default function SpacesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Espaços</h1>
          <p className="text-muted-foreground">Gerencie seus espaços financeiros</p>
        </div>
        <Button asChild>
          <Link href={routes.frontend.admin.spaces.create}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Espaço
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seus Espaços</CardTitle>
          <CardDescription>Lista de todos os espaços financeiros criados</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<SpacesTableSkeleton />}>
            <SpacesTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

function SpacesTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  )
}
