'use client'

import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface QueryErrorCardProps {
  message?: string
  onRetry?: () => void
}

export function QueryErrorCard({ message = 'Verifique a conexão e tente novamente.', onRetry }: QueryErrorCardProps) {
  return (
    <Alert tone="error">
      <AlertTitle>Não foi possível carregar os dados</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      {onRetry && (
        <AlertAction>
          <Button variant="outline" size="sm" icon="refresh" onClick={onRetry}>
            Tentar novamente
          </Button>
        </AlertAction>
      )}
    </Alert>
  )
}
