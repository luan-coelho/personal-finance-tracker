import { Suspense } from 'react'

import { LoginForm } from '@/components/login-form'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <Card className="w-full rounded-lg">
          <CardContent className="flex flex-col gap-4 py-6">
            <Skeleton className="mx-auto h-7 w-32" />
            <Skeleton className="mx-auto h-4 w-56" />
            <Skeleton className="h-control-lg w-full rounded-full" />
          </CardContent>
        </Card>
      }>
      <LoginForm className="w-full" />
    </Suspense>
  )
}
