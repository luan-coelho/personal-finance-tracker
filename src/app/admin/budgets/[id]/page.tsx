'use client'

import { AlertTriangle, ArrowLeft, Edit2, Eye, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { use, useState } from 'react'

import { BudgetCard } from '@/components/budget-card'
import { BudgetForm } from '@/components/budget-form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useBudget, useDeleteBudget } from '@/hooks/use-budgets'
import { useSelectedSpace } from '@/hooks/use-selected-space'

interface BudgetDetailPageProps {
  params: Promise<{ id: string }>
}

export default function BudgetDetailPage({ params }: BudgetDetailPageProps) {
  const router = useRouter()
  const { selectedSpace } = useSelectedSpace()
  const { id } = use(params)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data: budget, isLoading, error } = useBudget(id)
  const deleteBudget = useDeleteBudget()

  const handleSuccess = () => {
    router.push('/admin/budgets')
  }

  const handleBack = () => {
    router.back()
  }

  const handleDelete = async () => {
    if (!budget) return

    setIsDeleting(true)
    deleteBudget.mutate(budget.id, {
      onSuccess: () => {
        router.push('/admin/budgets')
      },
      onError: () => {
        setIsDeleting(false)
        setShowDeleteConfirm(false)
      },
    })
  }

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue)
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
    })
  }

  if (!selectedSpace) {
    return (
      <div className="container mx-auto">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Orçamento</h1>
          <p className="text-muted-foreground">Selecione um espaço para visualizar o orçamento.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="flex-1">
            <div className="bg-muted mb-2 h-8 w-48 animate-pulse rounded" />
            <div className="bg-muted h-4 w-64 animate-pulse rounded" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-muted h-96 animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }

  if (error || !budget) {
    return (
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        <Alert className="border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle>Orçamento não encontrado</AlertTitle>
          <AlertDescription>
            O orçamento solicitado não foi encontrado ou você não tem permissão para acessá-lo.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Orçamento - {budget.category}</h1>
            <p className="text-muted-foreground">
              {formatMonth(budget.month)} em {selectedSpace.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">{formatCurrency(budget.amount)}</Badge>
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)} disabled={isDeleting}>
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="text-muted-foreground mb-6 flex items-center space-x-2 text-sm">
        <a href="/admin/budgets" className="hover:text-foreground">
          Orçamentos
        </a>
        <span>/</span>
        <span className="text-foreground">{budget.category}</span>
      </nav>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Detalhes
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit2 className="h-4 w-4" />
            Editar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Orçamento</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-muted-foreground text-sm font-medium">Categoria</label>
                <p className="text-lg font-semibold">{budget.category}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">Valor Orçado</label>
                <p className="text-lg font-semibold text-green-600">{formatCurrency(budget.amount)}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">Período</label>
                <p className="text-lg font-semibold">{formatMonth(budget.month)}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">Criado em</label>
                <p className="text-lg font-semibold">{new Date(budget.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Preview do Orçamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md">
                <BudgetCard
                  budget={{
                    ...budget,
                    spent: 0,
                    remaining: Number(budget.amount),
                    percentage: 0,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Instruções */}
          <Card>
            <CardHeader>
              <CardTitle>Como Funciona</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-3 text-sm">
              <p>
                Este orçamento controla os gastos da categoria <strong>{budget.category}</strong> durante o mês de{' '}
                <strong>{formatMonth(budget.month)}</strong>.
              </p>
              <p>
                O sistema automaticamente calcula os gastos baseado nas transações de saída categorizadas como "
                {budget.category}".
              </p>
              <p>
                Quando o gasto atingir 80% do orçamento, será exibido um alerta. Se exceder 100%, o orçamento aparecerá
                como "Excedido".
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit2 className="h-5 w-5" />
                Editar Orçamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetForm budget={budget} onSuccess={handleSuccess} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="mx-4 max-w-md">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Confirmar Exclusão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Tem certeza que deseja excluir o orçamento da categoria <strong>{budget.category}</strong>?
              </p>
              <p className="text-muted-foreground text-sm">
                Esta ação não pode ser desfeita. O orçamento será removido permanentemente.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Excluindo...' : 'Excluir Orçamento'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
