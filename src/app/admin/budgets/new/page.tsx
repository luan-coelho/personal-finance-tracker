'use client'

import { ArrowLeft, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { BudgetForm } from '@/components/budget-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { useSelectedSpace } from '@/hooks/use-selected-space'

export default function NovoBudgetPage() {
  const router = useRouter()
  const { selectedSpace } = useSelectedSpace()
  const [, setIsSubmitting] = useState(false)

  const handleSuccess = () => {
    setIsSubmitting(false)
    router.push('/admin/budgets')
  }

  if (!selectedSpace) {
    return (
      <div className="container mx-auto">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Criar Orçamento</h1>
          <p className="text-muted-foreground">Selecione um espaço para criar um orçamento.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl">
      {/* Header */}
      <div className="flex-1">
        <h1 className="text-3xl font-bold">Criar Novo Orçamento</h1>
        <p className="text-muted-foreground">Defina um limite de gastos para uma categoria em {selectedSpace.name}</p>
      </div>

      {/* Breadcrumb */}
      <nav className="text-muted-foreground my-6 flex items-center space-x-2 text-sm">
        <a href="/admin/budgets" className="hover:text-foreground">
          Orçamentos
        </a>
        <span>/</span>
        <span className="text-foreground">Novo Orçamento</span>
      </nav>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Informações do Orçamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BudgetForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  )
}
