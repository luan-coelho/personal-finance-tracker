'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'

import type { TransactionType, TransactionWithUser } from '@/app/db/schemas'

import { CategoryIconTile } from '@/components/category-icon'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button, IconButton } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { Icon, type IconName } from '@/components/ui/icon'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UserAvatarDisplay } from '@/components/user-avatar-display'

import { useDeleteTransaction } from '@/hooks/use-transactions'

import { formatCurrency } from '@/lib/currency'
import { cn } from '@/lib/utils'

interface TransactionsTableProps {
  transactions: TransactionWithUser[]
  onEdit?: (transaction: TransactionWithUser) => void
  onDuplicate?: (transaction: TransactionWithUser) => void
  isLoading?: boolean
  readOnly?: boolean
  actions?: 'all' | 'edit'
}

const typeLabel: Record<TransactionType, string> = {
  entrada: 'Entrada',
  saida: 'Saída',
  reserva: 'Reserva',
}

const amountClassName: Record<TransactionType, string> = {
  entrada: 'text-success-text',
  saida: 'text-error-text',
  reserva: 'text-foreground',
}

const typeTileClassName: Record<TransactionType, string> = {
  entrada: 'bg-success-soft text-success-text',
  saida: 'bg-error-soft text-error-text',
  reserva: 'bg-info-soft text-info-text',
}

const amountSign: Record<TransactionType, string> = {
  entrada: '+',
  saida: '-',
  reserva: '',
}

function TransactionIcon({ transaction }: { transaction: TransactionWithUser }) {
  if (transaction.category) {
    return <CategoryIconTile name={transaction.category} />
  }

  // Sem categoria: o tile segue o tom do tipo (entrada verde, saída vermelha, reserva ciano).
  const fallback: IconName = transaction.type === 'reserva' ? 'piggy-bank' : 'receipt'
  return (
    <span
      className={cn(
        'rounded-control inline-flex size-8 shrink-0 items-center justify-center',
        typeTileClassName[transaction.type],
      )}>
      <Icon name={fallback} size={16} />
    </span>
  )
}

export function TransactionsTable({
  transactions,
  onEdit,
  onDuplicate,
  isLoading,
  readOnly = false,
  actions = 'all',
}: TransactionsTableProps) {
  const [transactionToDelete, setTransactionToDelete] = useState<TransactionWithUser | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const deleteMutation = useDeleteTransaction()

  const handleDelete = async () => {
    if (!transactionToDelete) return
    setDeletingId(transactionToDelete.id)
    try {
      await deleteMutation.mutateAsync(transactionToDelete.id)
    } finally {
      setDeletingId(null)
      setTransactionToDelete(null)
    }
  }

  const head = (
    <TableHeader>
      <TableRow>
        <TableHead>Descrição</TableHead>
        <TableHead className="w-[72px]">Usuário</TableHead>
        <TableHead>Tags</TableHead>
        <TableHead numeric>Data</TableHead>
        <TableHead numeric>Valor</TableHead>
        {!readOnly && (
          <TableHead className="w-14">
            <span className="sr-only">Ações</span>
          </TableHead>
        )}
      </TableRow>
    </TableHeader>
  )

  if (isLoading) {
    return (
      <Table aria-busy="true">
        {head}
        <TableBody>
          {Array.from({ length: 5 }, (_, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="rounded-control size-8" />
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="size-6 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>
              <TableCell numeric>
                <Skeleton className="ml-auto h-3.5 w-20" />
              </TableCell>
              <TableCell numeric>
                <Skeleton className="ml-auto h-3.5 w-24" />
              </TableCell>
              {!readOnly && <TableCell />}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        bordered
        icon="receipt"
        title="Nenhuma transação encontrada"
        description={
          readOnly
            ? 'Nenhuma saída neste orçamento.'
            : 'Comece criando sua primeira transação para acompanhar suas finanças.'
        }
      />
    )
  }

  return (
    <>
      <Table>
        {head}
        <TableBody>
          {transactions.map(transaction => (
            <TableRow key={transaction.id}>
              <TableCell>
                <div className="flex min-w-0 items-center gap-3">
                  <TransactionIcon transaction={transaction} />
                  <div className="flex min-w-0 flex-col">
                    <span className="text-foreground truncate font-medium">{transaction.description}</span>
                    <span className="text-muted-foreground truncate text-[13px] leading-[18px]">
                      {transaction.category || typeLabel[transaction.type]}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <UserAvatarDisplay user={transaction.user} size="sm" />
              </TableCell>
              <TableCell>
                {transaction.tags && transaction.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {transaction.tags.slice(0, 2).map(tag => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                    {transaction.tags.length > 2 && <Badge>+{transaction.tags.length - 2}</Badge>}
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell numeric className="text-muted-foreground whitespace-nowrap">
                {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
              </TableCell>
              <TableCell numeric className={cn('font-medium whitespace-nowrap', amountClassName[transaction.type])}>
                {amountSign[transaction.type]}
                {formatCurrency(transaction.amount)}
              </TableCell>
              {!readOnly && (
                <TableCell className="text-right">
                  {actions === 'edit' ? (
                    <IconButton
                      icon="pencil"
                      size="sm"
                      label={`Editar transação: ${transaction.description}`}
                      data-transaction-edit-trigger={transaction.id}
                      onClick={() => onEdit?.(transaction)}
                    />
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <IconButton icon="more-horizontal" size="sm" label={`Mais ações: ${transaction.description}`} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit?.(transaction)}>
                          <Icon name="pencil" size={20} />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDuplicate?.(transaction)}>
                          <Icon name="copy" size={20} />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setTransactionToDelete(transaction)}
                          disabled={deletingId === transaction.id}>
                          <Icon name="trash" size={20} />
                          {deletingId === transaction.id ? 'Excluindo' : 'Excluir'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {!readOnly && actions === 'all' && (
        <AlertDialog
          open={!!transactionToDelete}
          onOpenChange={open => {
            if (!open && !deleteMutation.isPending) setTransactionToDelete(null)
          }}>
          <AlertDialogContent destructive>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir transação</AlertDialogTitle>
              <AlertDialogDescription>
                A transação &quot;{transactionToDelete?.description}&quot; será excluída permanentemente e sai dos
                totais do período. Essa ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteMutation.isPending} />
              <Button variant="destructive" loading={deleteMutation.isPending} onClick={handleDelete}>
                {deleteMutation.isPending ? 'Excluindo' : 'Excluir transação'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
