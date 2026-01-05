import { FileText } from 'lucide-react'
import { Suspense } from 'react'

import { LoginForm } from '@/components/login-form'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Right Side - Login Form */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 p-4 lg:w-2/5 lg:p-8 xl:w-1/3 xl:p-12">
        <div className="w-full max-w-lg space-y-8">
          {/* Mobile Brand */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Familia Coelho</h1>
              <p className="text-sm text-gray-600">Gestão Financeira</p>
            </div>
          </div>

          {/* Welcome Header */}
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 lg:text-4xl">Acesso ao Sistema</h2>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            <Suspense
              fallback={
                <div className="space-y-4">
                  <div className="h-12 animate-pulse rounded-lg bg-gray-200"></div>
                  <div className="h-8 animate-pulse rounded-lg bg-gray-100"></div>
                </div>
              }>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
