'use client'

import { useRouter } from 'next/navigation'

import { BudgetForm } from '@/components/budget-form'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'

import { useSelectedSpace } from '@/hooks/use-selected-space'

import { routes } from '@/lib/routes'

const breadcrumb = [{ label: 'Orçamentos', href: routes.frontend.admin.budgets.index }]

export default function NovoBudgetPage() {
  const router = useRouter()
  const { selectedSpace } = useSelectedSpace()

  const handleSuccess = () => {
    router.push(routes.frontend.admin.budgets.index)
  }

  if (!selectedSpace) {
    return (
      <>
        <PageHeader variant="route" breadcrumb={breadcrumb} title="Novo orçamento" />
        <EmptyState
          bordered
          icon="wallet"
          title="Nenhum espaço selecionado"
          description="Selecione um espaço para criar um orçamento."
        />
      </>
    )
  }

  return (
    <>
      <PageHeader variant="route" breadcrumb={breadcrumb} title="Novo orçamento" meta={selectedSpace.name} />

      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Informações do orçamento</CardTitle>
          <CardDescription>Defina um limite de gastos para uma categoria neste espaço.</CardDescription>
        </CardHeader>
        <BudgetForm onSuccess={handleSuccess} onCancel={() => router.push(routes.frontend.admin.budgets.index)} />
      </Card>
    </>
  )
}
