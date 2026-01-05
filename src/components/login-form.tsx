'use client'

import { Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { routes } from '@/lib/routes'
import { cn } from '@/lib/utils'

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
        Configuration: 'Erro de configuração do servidor.',
        AccessDenied: 'Acesso negado. Você não está cadastrado no sistema ou seu acesso foi revogado.',
        Verification: 'Token de verificação expirado.',
        Default: 'Erro durante a autenticação. Tente novamente.',
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

      const result = await signIn('google', {
        callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Erro ao fazer login. Tente novamente.')
      } else if (result?.url) {
        router.push(result.url)
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
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-gray-900">Bem-vindo de volta</CardTitle>
          <CardDescription className="text-gray-600">
            Faça login com sua conta Google para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="h-12 w-full border-0 bg-gray-900 text-sm font-semibold text-white hover:bg-gray-800 disabled:bg-gray-700 disabled:text-gray-300"
              size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin text-white" />
                  <span className="text-white">Entrando...</span>
                </>
              ) : (
                <>
                  <svg className="mr-3 h-5 w-5 text-white" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="text-white">Continuar com Google</span>
                </>
              )}
            </Button>

            {/* Aviso de redirecionamento */}
            {callbackUrl !== routes.frontend.admin.index && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                <p className="text-center text-sm text-blue-700">
                  <span className="font-medium">💡 Redirecionamento:</span> Você será direcionado para a página
                  solicitada após o login
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
