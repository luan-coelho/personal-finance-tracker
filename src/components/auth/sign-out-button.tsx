'use client'

import { useQueryClient } from '@tanstack/react-query'
import type * as React from 'react'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import { clearPersistedQueryCache } from '@/lib/query-cache'
import { routes } from '@/lib/routes'

import { handleSignOut } from '@/actions/auth-actions'

/** Encerra a sessão pela server action e redireciona para o login. */
export function useSignOut(redirectTo?: string) {
  const [isPending, startTransition] = useTransition()
  const queryClient = useQueryClient()

  const signOut = () => {
    startTransition(async () => {
      // Os dados guardados no aparelho saem junto com a sessão.
      queryClient.clear()
      clearPersistedQueryCache()

      const result = await handleSignOut(redirectTo || routes.frontend.auth.signIn)

      if (!result.success && result.error) {
        toast.error(result.error)
      }
    })
  }

  return { signOut, isPending }
}

interface SignOutButtonProps {
  variant?: React.ComponentProps<typeof Button>['variant']
  size?: React.ComponentProps<typeof Button>['size']
  className?: string
  redirectTo?: string
}

export function SignOutButton({ variant = 'ghost', size = 'md', className, redirectTo }: SignOutButtonProps) {
  const { signOut, isPending } = useSignOut(redirectTo)

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      icon="log-out"
      loading={isPending}
      className={className}
      onClick={signOut}>
      {isPending ? 'Saindo' : 'Sair'}
    </Button>
  )
}
