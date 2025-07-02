'use client'

import { handleSignOut } from '@/actions/auth-actions'
import { LogOut } from 'lucide-react'
import { useActionState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import { routes } from '@/lib/routes'

interface SignOutButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  redirectTo?: string
}

export function SignOutButton({ variant = 'ghost', size = 'default', className, redirectTo }: SignOutButtonProps) {
  // Server action wrapper para logout
  const signOutAction = async () => {
    const result = await handleSignOut(redirectTo || routes.frontend.auth.signIn)

    if (!result.success && result.error) {
      toast.error(result.error)
    }

    return result
  }

  const [, formAction, isPending] = useActionState(signOutAction, null)

  return (
    <form action={formAction} className="inline">
      <Button type="submit" variant={variant} size={size} className={className} disabled={isPending}>
        <LogOut className="mr-2 h-4 w-4" />
        {isPending ? 'Saindo...' : 'Sair'}
      </Button>
    </form>
  )
}
