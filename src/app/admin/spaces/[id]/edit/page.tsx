'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { use } from 'react'

import { SpaceForm } from '@/components/space-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { useSpace } from '@/hooks/use-spaces'

import { routes } from '@/lib/routes'

interface EditSpacePageProps {
  params: Promise<{ id: string }>
}

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
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={routes.frontend.admin.spaces.index}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Erro</h1>
            <p className="text-muted-foreground">Espaço não encontrado</p>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              O espaço solicitado não foi encontrado ou você não tem permissão para acessá-lo.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={routes.frontend.admin.spaces.index}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Espaço</h1>
          <p className="text-muted-foreground">Atualize as informações do espaço &quot;{space.name}&quot;</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informações do Espaço</CardTitle>
          <CardDescription>Atualize os dados do espaço financeiro</CardDescription>
        </CardHeader>
        <CardContent>
          <SpaceForm space={space} onSuccess={handleSuccess} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  )
}

function EditSpacePageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="flex justify-end gap-3">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
