'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { use, useRef, useState } from 'react'

import type { Budget, BudgetWithSpending } from '@/app/db/schemas/budget-schema'

import { BudgetStatusBadge, budgetStatusMeta, getBudgetStatus } from '@/components/budget-card'
import { BudgetForm } from '@/components/budget-form'
import { BudgetTransactionsDialog } from '@/components/budget-transactions-dialog'
import { QueryErrorCard } from '@/components/query-error-card'
import { TransactionsTable } from '@/components/transactions-table'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { MetricCard } from '@/components/ui/metric-card'
import { PageActions } from '@/components/ui/page-actions'
import { PageHeader } from '@/components/ui/page-header'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useBudget, useBudgetsWithSpending, useDeleteBudget } from '@/hooks/use-budgets'
import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useTransactions } from '@/hooks/use-transactions'

import { getBudgetTransactionFilters } from '@/lib/budget-transaction-utils'
import { formatCurrency } from '@/lib/currency'
import { routes } from '@/lib/routes'

interface BudgetDetailPageProps {
  params: Promise<{ id: string }>
}

const breadcrumb = [{ label: 'Orçamentos', href: routes.frontend.admin.budgets.index }]
const PREVIEW_SIZE = 10

/** Primeiras transações do orçamento; a gestão completa (paginação, criar, editar) fica no dialog. */
function BudgetTransactionsSection({
  budget,
  budgetWithSpending,
}: {
  budget: Budget
  budgetWithSpending: BudgetWithSpending
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const transactionsQuery = useTransactions(getBudgetTransactionFilters(budget), 1, PREVIEW_SIZE, { staleTime: 0 })
  const total = transactionsQuery.data?.total ?? 0

  return (
    <section aria-labelledby="budget-transactions-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 id="budget-transactions-title" className="text-base leading-6 font-semibold">
            Transações
          </h2>
          <p className="text-muted-foreground text-[13px] leading-5 tabular-nums">
            {transactionsQuery.isPending
              ? 'Carregando'
              : total > PREVIEW_SIZE
                ? `${PREVIEW_SIZE} mais recentes de ${total}`
                : total === 1
                  ? '1 transação de saída nesta categoria'
                  : `${total} transações de saída nesta categoria`}
          </p>
        </div>
        <Button ref={triggerRef} icon="list" onClick={() => setIsDialogOpen(true)}>
          Gerenciar transações
        </Button>
      </div>

      {transactionsQuery.isError ? (
        <QueryErrorCard
          message="Erro ao carregar as transações do orçamento."
          onRetry={() => void transactionsQuery.refetch()}
        />
      ) : (
        <TransactionsTable
          transactions={transactionsQuery.data?.transactions ?? []}
          isLoading={transactionsQuery.isPending}
          readOnly
        />
      )}

      {isDialogOpen && (
        <BudgetTransactionsDialog
          budget={budgetWithSpending}
          onClose={() => setIsDialogOpen(false)}
          onCloseAutoFocus={event => {
            event.preventDefault()
            triggerRef.current?.focus()
          }}
        />
      )}
    </section>
  )
}

export default function BudgetDetailPage({ params }: BudgetDetailPageProps) {
  const router = useRouter()
  const { selectedSpace } = useSelectedSpace()
  const { id } = use(params)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data: budget, isLoading, error } = useBudget(id)
  const deleteBudget = useDeleteBudget()

  // Buscar dados de gastos do orçamento
  const { data: budgetsWithSpending = [] } = useBudgetsWithSpending(selectedSpace?.id || '', budget?.month || '')

  const budgetWithSpending = budgetsWithSpending.find(b => b.id === id)

  const handleSuccess = () => {
    router.push(routes.frontend.admin.budgets.index)
  }

  const handleDelete = async () => {
    if (!budget) return

    setIsDeleting(true)
    deleteBudget.mutate(budget.id, {
      onSuccess: () => {
        router.push(routes.frontend.admin.budgets.index)
      },
      onError: () => {
        setIsDeleting(false)
        setShowDeleteConfirm(false)
      },
    })
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
      <>
        <PageHeader variant="route" breadcrumb={breadcrumb} title="Orçamento" />
        <EmptyState
          bordered
          icon="wallet"
          title="Nenhum espaço selecionado"
          description="Selecione um espaço para visualizar o orçamento."
        />
      </>
    )
  }

  if (isLoading) {
    return (
      <>
        <PageHeader
          variant="route"
          breadcrumb={breadcrumb}
          title={<Skeleton className="h-8 w-48" />}
          meta={<Skeleton className="mt-1 h-4 w-64" />}
          aria-busy="true"
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <MetricCard key={i} label="" value="" loading />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </>
    )
  }

  if (error || !budget) {
    return (
      <>
        <PageHeader variant="route" breadcrumb={breadcrumb} title="Orçamento não encontrado" />
        <EmptyState
          bordered
          icon="alert-circle"
          title="Orçamento não encontrado"
          description="O orçamento solicitado não existe mais ou você não tem permissão para acessá-lo."
          action={
            <Button asChild>
              <Link href={routes.frontend.admin.budgets.index}>Ver orçamentos</Link>
            </Button>
          }
        />
      </>
    )
  }

  const spending: BudgetWithSpending = budgetWithSpending || {
    ...budget,
    spent: 0,
    remaining: Number(budget.amount),
    exceededAmount: 0,
    percentage: 0,
  }
  const status = getBudgetStatus(spending.percentage)
  const isExceeded = spending.exceededAmount > 0

  return (
    <>
      <PageHeader
        variant="route"
        breadcrumb={breadcrumb}
        title={budget.category}
        status={<BudgetStatusBadge percentage={spending.percentage} />}
        meta={`${formatMonth(budget.month)} · ${selectedSpace.name} · criado em ${new Date(budget.createdAt).toLocaleDateString('pt-BR')}`}
      />

      <Tabs defaultValue="details" className="gap-6">
        <PageActions
          actions={
            <Button icon="trash" onClick={() => setShowDeleteConfirm(true)} disabled={isDeleting}>
              Excluir
            </Button>
          }>
          <TabsList>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="edit">Editar</TabsTrigger>
          </TabsList>
        </PageActions>

        <TabsContent value="details" className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon="wallet" label="Orçado" value={formatCurrency(budget.amount)} />
            <MetricCard
              icon="trending-down"
              label="Gasto"
              value={formatCurrency(spending.spent)}
              tone={status === 'exceeded' ? 'error' : 'default'}
              note={`${((spending.spent / Number(budget.amount)) * 100).toFixed(1)}% do orçamento`}
            />
            <MetricCard
              icon={isExceeded ? 'alert-circle' : 'piggy-bank'}
              label={isExceeded ? 'Excedido' : 'Disponível'}
              value={formatCurrency(isExceeded ? spending.exceededAmount : spending.remaining)}
              tone={isExceeded ? 'error' : 'success'}
              note={isExceeded ? `Excedido em ${formatCurrency(spending.exceededAmount)}` : 'Disponível para gastar'}
              noteTone={isExceeded ? 'error' : undefined}
            />
            <MetricCard
              icon="target"
              label="Uso"
              value={spending.percentage.toFixed(1)}
              unit="%"
              note={budgetStatusMeta[status].label}
              noteTone={status === 'within' ? undefined : budgetStatusMeta[status].tone}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Uso do orçamento</CardTitle>
              <CardDescription>
                Gastos de saída na categoria {budget.category} em {formatMonth(budget.month)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Progress
                value={spending.percentage}
                tone={budgetStatusMeta[status].progressTone}
                aria-label={`Uso do orçamento ${budget.category}`}
              />
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm tabular-nums">
                <span>
                  <span className="font-semibold">{formatCurrency(spending.spent)}</span>
                  <span className="text-muted-foreground"> de {formatCurrency(budget.amount)}</span>
                </span>
                <span className="text-muted-foreground">Alerta a partir de 80% · estourado acima de 100%</span>
              </div>
            </CardContent>
          </Card>

          <BudgetTransactionsSection budget={budget} budgetWithSpending={spending} />

          <Card>
            <CardHeader>
              <CardTitle>Como funciona</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground flex flex-col gap-3 text-sm">
              <p>
                Este orçamento controla os gastos da categoria{' '}
                <strong className="text-foreground font-semibold">{budget.category}</strong> durante o mês de{' '}
                <strong className="text-foreground font-semibold">{formatMonth(budget.month)}</strong>.
              </p>
              <p>
                O sistema calcula os gastos automaticamente a partir das transações de saída com a categoria &quot;
                {budget.category}&quot;.
              </p>
              <p>
                Quando o gasto atinge 80% do orçamento, ele aparece como &quot;Perto do limite&quot;. Acima de 100%,
                aparece como &quot;Estourado&quot;.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit">
          <Card className="w-full max-w-3xl">
            <CardHeader>
              <CardTitle>Editar orçamento</CardTitle>
            </CardHeader>
            <BudgetForm budget={budget} onSuccess={handleSuccess} />
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={showDeleteConfirm} onOpenChange={open => !isDeleting && setShowDeleteConfirm(open)}>
        <AlertDialogContent destructive>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir orçamento?</AlertDialogTitle>
            <AlertDialogDescription>
              O orçamento de &quot;{budget.category}&quot; será excluído permanentemente. Essa ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} />
            <Button variant="destructive" loading={isDeleting} onClick={handleDelete}>
              {isDeleting ? 'Excluindo' : 'Excluir orçamento'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
