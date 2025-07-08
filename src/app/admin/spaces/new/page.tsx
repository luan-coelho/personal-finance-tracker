'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { SpaceForm } from '@/components/space-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { routes } from '@/lib/routes'

export default function CreateSpacePage() {
  const router = useRouter()

  function handleSuccess() {
    router.push(routes.frontend.admin.spaces.index)
  }

  function handleCancel() {
    router.back()
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
          <h1 className="text-3xl font-bold tracking-tight">Novo Espaço</h1>
          <p className="text-muted-foreground">Crie um novo espaço para organizar suas finanças</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informações do Espaço</CardTitle>
          <CardDescription>Preencha os dados do novo espaço financeiro</CardDescription>
        </CardHeader>
        <CardContent>
          <SpaceForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  )
}
