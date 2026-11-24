import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import type { TransactionWithUser } from '@/app/db/schemas'

import { CategoryIconTile } from '@/components/category-icon'
import { List, ListItem } from '@/components/ui/list-item'

import { formatCurrency } from '@/lib/currency'
import type { DashboardOverview } from '@/lib/dashboard-types'
import { transactionTypeMeta } from '@/lib/transaction-type-meta'
import { cn } from '@/lib/utils'

import { DashboardCard, DashboardCardEmpty, transactionsHref } from './dashboard-shared'

const amountClass = { entrada: 'text-success-text', saida: 'text-error-text', reserva: 'text-info-text' } as const
const amountSign = { entrada: '+', saida: '-', reserva: '' } as const

function firstName(name: string | null | undefined) {
  return name?.trim().split(/\s+/)[0] ?? ''
}

function TransactionRow({ transaction }: { transaction: TransactionWithUser }) {
  const typeMeta = transactionTypeMeta[transaction.type]
  // A data chega como string ISO pelo JSON
  const date = format(new Date(transaction.date), "d 'de' MMM", { locale: ptBR })
  const meta = [transaction.category || typeMeta.label, date, firstName(transaction.user?.name)]
    .filter(Boolean)
    .join(' · ')

  return (
    <ListItem
      leading={
        transaction.category ? (
          <CategoryIconTile name={transaction.category} className="size-10" iconSize={20} />
        ) : undefined
      }
      icon={transaction.category ? undefined : typeMeta.icon}
      tone={typeMeta.tone}
      title={transaction.description}
      meta={meta}
      right={
        <span className={cn('text-sm leading-5 font-medium whitespace-nowrap tabular-nums', amountClass[transaction.type])}>
          {amountSign[transaction.type]}
          {formatCurrency(transaction.amount)}
        </span>
      }
    />
  )
}

export function RecentTransactionsCard({ overview, className }: { overview: DashboardOverview; className?: string }) {
  const { recentTransactions, totals } = overview

  return (
    <DashboardCard
      title="Últimas transações"
      description={`${totals.current.count} ${totals.current.count === 1 ? 'lançamento' : 'lançamentos'} no mês`}
      href={transactionsHref()}
      hrefLabel="Ver todas"
      className={className}>
      {recentTransactions.length === 0 ? (
        <DashboardCardEmpty>Nenhuma transação neste mês.</DashboardCardEmpty>
      ) : (
        <List className="-mx-2">
          {recentTransactions.map(transaction => (
            <TransactionRow key={transaction.id} transaction={transaction} />
          ))}
        </List>
      )}
    </DashboardCard>
  )
}
