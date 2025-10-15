import { eq } from 'drizzle-orm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { db } from '@/app/db'
import { spacesTable } from '@/app/db/schemas/space-schema'
import { usersTable } from '@/app/db/schemas/user-schema'

import { SpaceMembersTable } from '@/components/space-members-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { auth } from '@/lib/auth'
import { routes } from '@/lib/routes'

interface SpaceMembersPageProps {
  params: Promise<{
    id: string
  }>
}

async function SpaceMembersContent({ spaceId }: { spaceId: string }) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect(routes.frontend.auth.signIn)
  }

  const currentUser = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, session.user.email),
  })

  if (!currentUser) {
    redirect(routes.frontend.auth.signIn)
  }

  const space = await db.query.spacesTable.findFirst({
    where: eq(spacesTable.id, spaceId),
  })

  if (!space) {
    redirect(routes.frontend.admin.spaces.index)
  }

  const isOwner = space.ownerId === currentUser.id

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={routes.frontend.admin.spaces.index}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Membros do Espaço</h1>
          </div>
          <p className="text-muted-foreground">Gerencie quem tem acesso ao espaço &quot;{space.name}&quot;</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compartilhamento</CardTitle>
          <CardDescription>
            {isOwner
              ? 'Adicione ou remova membros e configure suas permissões'
              : 'Visualize os membros que têm acesso a este espaço'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SpaceMembersTable spaceId={spaceId} isOwner={isOwner} />
        </CardContent>
      </Card>
    </div>
  )
}

export default async function SpaceMembersPage({ params }: SpaceMembersPageProps) {
  const { id } = await params

  return (
    <Suspense fallback={<SpaceMembersPageSkeleton />}>
      <SpaceMembersContent spaceId={id} />
    </Suspense>
  )
}

function SpaceMembersPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
