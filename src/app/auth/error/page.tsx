'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { Skeleton } from '@/components/ui/skeleton'

import { routes } from '@/lib/routes'

const errorMessages = {
  Configuration: 'Erro de configuração do servidor. Tente novamente mais tarde.',
  AccessDenied: 'Você não tem permissão para acessar este recurso. Fale com um administrador.',
  Verification: 'O link de verificação expirou ou é inválido. Entre novamente.',
  Default: 'Ocorreu um erro durante a autenticação. Tente entrar novamente.',
}

function ErrorCard() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') as keyof typeof errorMessages

  return (
    <Card className="w-full rounded-lg">
      <CardHeader className="items-center text-center">
        <span className="bg-error-soft text-error-text mx-auto mb-2 inline-flex size-14 items-center justify-center rounded-2xl">
          <Icon name="alert-circle" size={24} />
        </span>
        <CardTitle className="text-xl leading-7 font-semibold">Erro de autenticação</CardTitle>
        <CardDescription>{errorMessages[error] || errorMessages.Default}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button asChild variant="primary" size="lg" className="w-full">
          <Link href={routes.frontend.auth.signIn}>Tentar novamente</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link href={routes.frontend.home}>Voltar ao início</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <Card className="w-full rounded-lg">
          <CardContent className="flex flex-col items-center gap-4 py-6">
            <Skeleton className="size-14 rounded-2xl" />
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardContent>
        </Card>
      }>
      <ErrorCard />
    </Suspense>
  )
}
