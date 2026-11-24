'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'

import { authClient } from '@/lib/auth-client'
import { routes } from '@/lib/routes'
import { cn } from '@/lib/utils'

function GoogleMark() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width={20} height={20} className="shrink-0">
      <path
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
        fill="currentColor"
      />
    </svg>
  )
}

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || routes.frontend.admin.index
  const error = searchParams.get('error')

  // Mostrar mensagem de erro se houver erro de autenticação
  useEffect(() => {
    if (error) {
      const errorMessages = {
        Configuration: 'Erro de configuração do servidor. Tente novamente mais tarde.',
        AccessDenied: 'Acesso negado. Peça a um administrador para cadastrar seu e-mail.',
        Verification: 'O link de verificação expirou. Entre novamente.',
        Default: 'Não foi possível entrar. Tente novamente.',
      }

      const errorMessage = errorMessages[error as keyof typeof errorMessages] || errorMessages.Default

      // Pequeno delay para garantir que a página carregou completamente
      const timer = setTimeout(() => {
        toast.error(errorMessage)
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [error])

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)

      const { data, error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: callbackUrl,
        errorCallbackURL: routes.frontend.auth.signIn,
        disableRedirect: true,
      })

      if (error) {
        toast.error('Não foi possível entrar. Tente novamente.')
      } else if (data?.url) {
        router.push(data.url)
      }
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('Erro inesperado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="rounded-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl leading-7 font-semibold">Entrar</CardTitle>
          <CardDescription>Use sua conta Google para acessar suas finanças.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button variant="primary" size="lg" className="w-full" loading={isLoading} onClick={handleGoogleSignIn}>
            {!isLoading && <GoogleMark />}
            {isLoading ? 'Entrando' : 'Continuar com Google'}
          </Button>

          {callbackUrl !== routes.frontend.admin.index && (
            <p className="bg-info-soft text-info-text rounded-control flex items-start gap-2 px-3 py-2.5 text-sm leading-5">
              <Icon name="info" size={16} className="mt-0.5" />
              <span>Depois de entrar, você volta para a página que tentou abrir.</span>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
