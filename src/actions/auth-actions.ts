'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { auth, getCurrentSession } from '@/lib/auth'
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
    const redirectUrl = callbackUrl || routes.frontend.admin.index

    const result = await auth.api.signInSocial({
      body: {
        provider: 'google',
        callbackURL: redirectUrl,
        errorCallbackURL: routes.frontend.auth.signIn,
      },
    })

    if (result.url) {
      redirect(result.url)
    }

    return { success: true }
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      typeof error.digest === 'string' &&
      error.digest.includes('NEXT_REDIRECT')
    ) {
      throw error
    }

    return {
      success: false,
      error: 'Erro inesperado. Tente novamente.',
    }
  }
}

export async function handleSignOut(redirectTo?: string): Promise<SignOutResult> {
  try {
    await getCurrentSession()

    const redirectUrl = redirectTo || routes.frontend.auth.signIn

    await auth.api.signOut({
      headers: await headers(),
    })

    redirect(redirectUrl)
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      typeof error.digest === 'string' &&
      error.digest.includes('NEXT_REDIRECT')
    ) {
      throw error
    }

    return {
      success: false,
      error: 'Erro ao fazer logout. Tente novamente.',
    }
  }
}
