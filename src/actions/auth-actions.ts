'use server'

import { AuthError } from 'next-auth'

import { auth, signIn, signOut } from '@/lib/auth'
import { routes } from '@/lib/routes'

export interface SignInResult {
  success: boolean
  error?: string
}

export interface SignOutResult {
  success: boolean
  error?: string
}

export async function handleGoogleSignIn(callbackUrl?: string): Promise<SignInResult> {
  try {
    // Default callback URL se não fornecido
    const redirectUrl = callbackUrl || routes.frontend.admin.index

    await signIn('google', {
      redirectTo: redirectUrl,
    })

    // Esta linha nunca será executada se o signIn for bem-sucedido
    // porque o signIn redireciona automaticamente
    return { success: true }
  } catch (error) {
    // Se o erro for NEXT_REDIRECT (esperado em caso de sucesso), registrar log antes de redirecionar
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      typeof error.digest === 'string' &&
      error.digest.includes('NEXT_REDIRECT')
    ) {
      // Re-throw o erro de redirecionamento para continuar o fluxo
      throw error
    }

    // Tratar diferentes tipos de erro do NextAuth
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'AccessDenied':
          return {
            success: false,
            error: 'Acesso negado. Verifique suas permissões.',
          }
        default:
          return {
            success: false,
            error: 'Erro durante a autenticação. Tente novamente.',
          }
      }
    }

    // Outros erros não esperados
    return {
      success: false,
      error: 'Erro inesperado. Tente novamente.',
    }
  }
}

export async function handleSignOut(redirectTo?: string): Promise<SignOutResult> {
  try {
    // Obter dados da sessão antes do logout
    await auth()

    // Default redirect URL se não fornecido
    const redirectUrl = redirectTo || routes.frontend.auth.signIn

    await signOut({
      redirectTo: redirectUrl,
    })

    // Esta linha nunca será executada se o signOut for bem-sucedido
    // porque o signOut redireciona automaticamente
    return { success: true }
  } catch (error) {
    // Se o erro for NEXT_REDIRECT (esperado em caso de sucesso), re-throw
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      typeof error.digest === 'string' &&
      error.digest.includes('NEXT_REDIRECT')
    ) {
      throw error
    }

    // Outros erros não esperados
    return {
      success: false,
      error: 'Erro ao fazer logout. Tente novamente.',
    }
  }
}
