import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { db } from '@/app/db'
import { spacesTable } from '@/app/db/schemas/space-schema'
import { usersTable } from '@/app/db/schemas/user-schema'

import { SpaceMembersMeta, SpaceMembersTable, SpaceMembersTableSkeleton } from '@/components/space-members-table'
import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'

import { getCurrentSession } from '@/lib/auth'
import { routes } from '@/lib/routes'

interface SpaceMembersPageProps {
  params: Promise<{
    id: string
  }>
}

async function SpaceMembersContent({ spaceId }: { spaceId: string }) {
  const session = await getCurrentSession()

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
    <>
      <PageHeader
        variant="route"
        breadcrumb={[{ label: 'Espaços', href: routes.frontend.admin.spaces.index }]}
        title={space.name}
        description={
          isOwner
            ? 'Adicione ou remova membros e defina o que cada um pode fazer'
            : 'Pessoas que têm acesso a este espaço'
        }
        meta={<SpaceMembersMeta spaceId={spaceId} isOwner={isOwner} />}
      />
      <SpaceMembersTable spaceId={spaceId} isOwner={isOwner} />
    </>
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
    <>
      <div className="flex flex-col gap-2 pt-5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <SpaceMembersTableSkeleton />
    </>
  )
}
