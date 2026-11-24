'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { use } from 'react'

import { SpaceForm } from '@/components/space-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'

import { useSpace } from '@/hooks/use-spaces'

import { routes } from '@/lib/routes'

interface EditSpacePageProps {
  params: Promise<{ id: string }>
}

const breadcrumb = [{ label: 'Espaços', href: routes.frontend.admin.spaces.index }]

export default function EditSpacePage({ params }: EditSpacePageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { data: space, isLoading, error } = useSpace(id)

  function handleSuccess() {
    router.push(routes.frontend.admin.spaces.index)
  }

  function handleCancel() {
    router.back()
  }

  if (isLoading) {
    return <EditSpacePageSkeleton />
  }

  if (error || !space) {
    return (
      <>
        <PageHeader variant="route" breadcrumb={breadcrumb} title="Editar espaço" />
        <EmptyState
          bordered
          icon="building-2"
          className="max-w-3xl"
          title="Espaço não encontrado"
          description="O espaço não existe ou você não tem permissão para acessá-lo."
          action={
            <Button variant="outline" asChild>
              <Link href={routes.frontend.admin.spaces.index}>Voltar para espaços</Link>
            </Button>
          }
        />
      </>
    )
  }

  return (
    <>
      <PageHeader variant="route" breadcrumb={breadcrumb} title={space.name} description="Editar espaço" />
      <SpaceForm space={space} onSuccess={handleSuccess} onCancel={handleCancel} />
    </>
  )
}

function EditSpacePageSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-2 pt-5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-28" />
      </div>

      <Card className="w-full max-w-3xl">
        <CardHeader className="gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="rounded-control h-control-lg w-full" />
          <Skeleton className="rounded-control h-20 w-full" />
        </CardContent>
        <CardFooter className="border-t">
          <Skeleton className="h-control-md w-24 rounded-full" />
          <Skeleton className="h-control-md w-36 rounded-full" />
        </CardFooter>
      </Card>
    </>
  )
}
