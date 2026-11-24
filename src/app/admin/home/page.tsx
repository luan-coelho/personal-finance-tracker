'use client'

import { useState } from 'react'

import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton'
import { DashboardView } from '@/components/dashboard/dashboard-view'
import { MonthSelector } from '@/components/month-selector'
import { QueryErrorCard } from '@/components/query-error-card'
import { TransactionForm } from '@/components/transaction-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { PageActions } from '@/components/ui/page-actions'
import { PageHeader } from '@/components/ui/page-header'

import { useDashboard } from '@/hooks/use-dashboard'
import { useSelectedSpace } from '@/hooks/use-selected-space'

import { parseMonthString, toMonthString } from '@/lib/date-utils'

import { useMonthSelectorContext } from '@/providers/month-selector-provider'

import InicioLoading from './loading'

function greeting(hour: number) {
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default function InicioPage() {
  const { selectedSpace, isLoading: isSpaceLoading } = useSelectedSpace()
  const monthSelector = useMonthSelectorContext()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const month = toMonthString(monthSelector.selectedYear, monthSelector.selectedMonth)
  const { data: overview, isLoading, isError, refetch, isPlaceholderData } = useDashboard(selectedSpace?.id, month)

  const handleSelectMonth = (nextMonth: string) => {
    const { year, month0 } = parseMonthString(nextMonth)
    monthSelector.goToDate(new Date(year, month0, 1))
  }

  if (isSpaceLoading && !selectedSpace) {
    return <InicioLoading />
  }

  if (!selectedSpace) {
    return (
      <>
        <PageHeader title="Início" />
        <EmptyState
          bordered
          icon="wallet"
          title="Nenhum espaço selecionado"
          description="Selecione ou crie um espaço para ver o resumo do mês."
        />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Início"
        description={`${greeting(new Date().getHours())}. Este é o resumo de ${selectedSpace.name}.`}
      />

      <PageActions
        actions={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="primary" icon="plus">
                Nova transação
              </Button>
            </DialogTrigger>
            <DialogContent size="md" onInteractOutside={event => event.preventDefault()}>
              <DialogHeader>
                <DialogTitle>Nova transação</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <TransactionForm
                  mode="create"
                  onSuccess={() => setIsCreateOpen(false)}
                  onCancel={() => setIsCreateOpen(false)}
                />
              </DialogBody>
            </DialogContent>
          </Dialog>
        }>
        <MonthSelector />
      </PageActions>

      {isError && !overview ? (
        <QueryErrorCard message="Não foi possível carregar o resumo do mês." onRetry={() => refetch()} />
      ) : isLoading || !overview ? (
        <DashboardSkeleton />
      ) : (
        // Ao trocar de mês, o painel anterior fica visível e esmaecido até os novos dados chegarem
        <div
          aria-busy={isPlaceholderData || undefined}
          className={isPlaceholderData ? 'opacity-60 transition-opacity duration-200' : 'transition-opacity duration-200'}>
          <DashboardView
            overview={overview}
            onSelectMonth={handleSelectMonth}
            onCreateTransaction={() => setIsCreateOpen(true)}
          />
        </div>
      )}
    </>
  )
}
