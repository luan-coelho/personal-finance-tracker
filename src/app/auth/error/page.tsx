'use client'

import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const errorMessages = {
  Configuration: 'Erro de configuração do servidor.',
  AccessDenied: 'Acesso negado. Você não tem permissão para acessar este recurso.',
  Verification: 'Token de verificação expirado ou inválido.',
  Default: 'Ocorreu um erro durante a autenticação.',
}

function ErrorCard() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') as keyof typeof errorMessages

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="mb-4 flex items-center justify-center">
          <AlertCircle className="text-destructive h-12 w-12" />
        </div>
        <CardTitle className="text-center text-2xl">Erro de Autenticação</CardTitle>
        <CardDescription className="text-center">{errorMessages[error] || errorMessages.Default}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button asChild className="w-full">
          <Link href="/auth/signin">Tentar Novamente</Link>
        </Button>
        <Button variant="outline" asChild className="w-full">
          <Link href="/">Voltar ao Início</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default function AuthErrorPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <Suspense
        fallback={
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-center text-2xl">Carregando...</CardTitle>
            </CardHeader>
          </Card>
        }>
        <ErrorCard />
      </Suspense>
    </div>
  )
}
