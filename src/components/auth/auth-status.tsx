'use client'

import { useSession } from 'next-auth/react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { SignOutButton } from './sign-out-button'
import { UserAvatar } from './user-avatar'

export function AuthStatus() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status da Autenticação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
            <span>Carregando...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status da Autenticação</CardTitle>
        <CardDescription>{session ? 'Você está autenticado' : 'Você não está autenticado'}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {session ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <UserAvatar />
              <div>
                <p className="font-medium">{session.user?.name}</p>
                <p className="text-muted-foreground text-sm">{session.user?.email}</p>
              </div>
            </div>
            <SignOutButton />
          </div>
        ) : (
          <p className="text-muted-foreground">Você não está autenticado. Por favor, faça login.</p>
        )}
      </CardContent>
    </Card>
  )
}
