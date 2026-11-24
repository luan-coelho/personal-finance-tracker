'use client'

import { format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'

import type { TransactionType, TransactionWithUser } from '@/app/db/schemas'

import { CategoryIconTile } from '@/components/category-icon'
import { ActionSheet, type ActionSheetItem } from '@/components/ui/action-sheet'
import { List, ListItem } from '@/components/ui/list-item'
import { Skeleton } from '@/components/ui/skeleton'

import { formatCurrency } from '@/lib/currency'
import { transactionTypeMeta } from '@/lib/transaction-type-meta'
import { cn } from '@/lib/utils'

const amountClassName: Record<TransactionType, string> = {
  entrada: 'text-success-text',
  saida: 'text-error-text',
  reserva: 'text-foreground',
}

const amountSign: Record<TransactionType, string> = {
  entrada: '+',
  saida: '-',
  reserva: '',
}

interface TransactionDayGroup {
  key: string
  label: string
  /** Entradas menos saídas do dia; reservas não entram. */
  net: number
  hasNet: boolean
  transactions: TransactionWithUser[]
}

function firstName(name: string | null | undefined) {
  return name?.trim().split(/\s+/)[0] ?? ''
}

function dayLabel(date: Date) {
  if (isToday(date)) return 'Hoje'
  if (isYesterday(date)) return 'Ontem'
  return format(date, "EEE, d 'de' MMM", { locale: ptBR })
}

/** Agrupa por dia preservando a ordem recebida (a lista já vem ordenada pelo servidor). */
export function groupTransactionsByDay(transactions: TransactionWithUser[]): TransactionDayGroup[] {
  const groups = new Map<string, TransactionDayGroup>()

  for (const transaction of transactions) {
    // A data chega como string ISO pelo JSON
    const date = new Date(transaction.date)
    const key = format(date, 'yyyy-MM-dd')
    let group = groups.get(key)
    if (!group) {
      group = { key, label: dayLabel(date), net: 0, hasNet: false, transactions: [] }
      groups.set(key, group)
    }
    group.transactions.push(transaction)
    if (transaction.type !== 'reserva') {
      const amount = Number(transaction.amount) || 0
      group.net += transaction.type === 'entrada' ? amount : -amount
      group.hasNet = true
    }
  }

  return [...groups.values()]
}

interface TransactionsListProps {
  transactions: TransactionWithUser[]
  readOnly?: boolean
  /** `all`: tocar na linha abre a folha de ações. `edit`: tocar na linha edita. */
  actions?: 'all' | 'edit'
  onEdit?: (transaction: TransactionWithUser) => void
  onDuplicate?: (transaction: TransactionWithUser) => void
  onDelete?: (transaction: TransactionWithUser) => void
  className?: string
}

/**
 * Lista de transações do mobile (abaixo de `md`), no lugar da tabela: um `ListItem` por
 * transação, agrupadas por dia com o saldo do dia. A linha inteira é o alvo de toque; as ações
 * (editar, duplicar, excluir) ficam numa folha inferior.
 */
export function TransactionsList({
  transactions,
  readOnly = false,
  actions = 'all',
  onEdit,
  onDuplicate,
  onDelete,
  className,
}: TransactionsListProps) {
  const [selected, setSelected] = useState<TransactionWithUser | null>(null)
  const groups = groupTransactionsByDay(transactions)

  const handleRowClick = readOnly
    ? undefined
    : (transaction: TransactionWithUser) => (actions === 'edit' ? onEdit?.(transaction) : setSelected(transaction))

  const sheetItems: ActionSheetItem[] = selected
    ? [
        { icon: 'pencil', label: 'Editar', onSelect: () => onEdit?.(selected) },
        { icon: 'copy', label: 'Duplicar', onSelect: () => onDuplicate?.(selected) },
        { icon: 'trash', label: 'Excluir', tone: 'error', onSelect: () => onDelete?.(selected) },
      ]
    : []

  return (
    <div
      data-slot="transactions-list"
      className={cn('border-border bg-card shadow-sh-sm flex flex-col rounded-lg border px-2 pb-2', className)}>
      {groups.map(group => (
        <section key={group.key} aria-label={group.label} className="flex flex-col">
          <header className="text-muted-foreground flex items-baseline justify-between gap-3 px-4 pt-4 pb-1.5 text-xs leading-4 font-medium">
            <h3 className="m-0 text-xs leading-4 font-medium first-letter:uppercase">{group.label}</h3>
            {group.hasNet && (
              <span className="whitespace-nowrap tabular-nums">
                {group.net > 0 ? '+' : group.net < 0 ? '-' : ''}
                {formatCurrency(Math.abs(group.net))}
              </span>
            )}
          </header>
          <List>
            {group.transactions.map(transaction => {
              const typeMeta = transactionTypeMeta[transaction.type]
              const meta = [
                transaction.category || typeMeta.label,
                ...(transaction.tags ?? []).slice(0, 2),
                firstName(transaction.user?.name),
              ]
                .filter(Boolean)
                .join(' · ')

              return (
                <ListItem
                  key={transaction.id}
                  leading={
                    transaction.category ? (
                      <CategoryIconTile name={transaction.category} className="size-10" iconSize={20} />
                    ) : undefined
                  }
                  icon={transaction.category ? undefined : typeMeta.icon}
                  tone={typeMeta.tone}
                  title={transaction.description}
                  meta={meta}
                  onClick={handleRowClick ? () => handleRowClick(transaction) : undefined}
                  aria-haspopup={handleRowClick && actions === 'all' ? 'dialog' : undefined}
                  right={
                    <span
                      className={cn(
                        'text-sm leading-5 font-medium whitespace-nowrap tabular-nums',
                        amountClassName[transaction.type],
                      )}>
                      {amountSign[transaction.type]}
                      {formatCurrency(transaction.amount)}
                    </span>
                  }
                />
              )
            })}
          </List>
        </section>
      ))}

      {!readOnly && actions === 'all' && (
        <ActionSheet
          open={selected !== null}
          onOpenChange={open => !open && setSelected(null)}
          title={selected?.description}
          description={
            selected
              ? `${amountSign[selected.type]}${formatCurrency(selected.amount)} · ${format(new Date(selected.date), 'dd/MM/yyyy')}`
              : undefined
          }
          items={sheetItems}
        />
      )}
    </div>
  )
}

export function TransactionsListSkeleton({ rows = 6, className }: { rows?: number; className?: string }) {
  return (
    <div
      aria-busy="true"
      data-slot="transactions-list"
      className={cn('border-border bg-card shadow-sh-sm flex flex-col rounded-lg border px-2 pb-2', className)}>
      <div className="px-4 pt-4 pb-1.5">
        <Skeleton className="h-3 w-20" />
      </div>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex min-h-16 items-center gap-3 px-4 py-2.5">
          <Skeleton className="rounded-control size-10 shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-36 max-w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-3.5 w-20 shrink-0" />
        </div>
      ))}
      <span className="sr-only">Carregando transações</span>
    </div>
  )
}
