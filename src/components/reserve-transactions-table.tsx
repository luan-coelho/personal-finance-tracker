'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'

import type { TransactionWithUser } from '@/app/db/schemas/transaction-schema'

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
import { Icon } from '@/components/ui/icon'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UserAvatarDisplay } from '@/components/user-avatar-display'

import { useDeleteTransaction } from '@/hooks/use-transactions'

import { formatCurrency } from '@/lib/currency'
import { cn } from '@/lib/utils'

interface ReserveTransactionsTableProps {
  transactions: TransactionWithUser[]
}

export function ReserveTransactionsTable({ transactions }: ReserveTransactionsTableProps) {
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)
  const deleteMutation = useDeleteTransaction()

  const handleDelete = async () => {
    if (!transactionToDelete) return

    try {
      await deleteMutation.mutateAsync(transactionToDelete)
      setTransactionToDelete(null)
    } catch (error) {
      console.error('Erro ao excluir transação:', error)
    }
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        bordered
        icon="arrow-left-right"
        title="Nenhuma movimentação registrada"
        description="Registre uma transação do tipo Reserva para acompanhar depósitos e retiradas."
      />
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="w-14">Usuário</TableHead>
            <TableHead numeric>Data</TableHead>
            <TableHead numeric>Valor</TableHead>
            <TableHead className="w-14">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map(transaction => {
            const amount = parseFloat(transaction.amount)
            // Consideramos positivo como Depósito (entrada na reserva) e negativo como Retirada (saída da reserva)
            const isDeposit = amount >= 0

            return (
              <TableRow key={transaction.id}>
                <TableCell>
                  {isDeposit ? (
                    <Badge tone="success" icon="arrow-up">
                      Depósito
                    </Badge>
                  ) : (
                    <Badge tone="error" icon="arrow-down">
                      Retirada
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="max-w-[320px] truncate">
                  {transaction.description || <span className="text-muted-foreground">Sem descrição</span>}
                </TableCell>
                <TableCell>
                  <UserAvatarDisplay user={transaction.user} size="sm" />
                </TableCell>
                <TableCell numeric className="text-muted-foreground whitespace-nowrap">
                  {format(new Date(transaction.date), "dd 'de' MMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell
                  numeric
                  className={cn('font-medium whitespace-nowrap', isDeposit ? 'text-success-text' : 'text-error-text')}>
                  {isDeposit ? '+' : '-'}
                  {formatCurrency(Math.abs(parseFloat(transaction.amount)))}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <IconButton icon="more-horizontal" label="Ações da movimentação" size="sm" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem variant="destructive" onClick={() => setTransactionToDelete(transaction.id)}>
                        <Icon name="trash" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <AlertDialog open={!!transactionToDelete} onOpenChange={() => setTransactionToDelete(null)}>
        <AlertDialogContent destructive>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir movimentação?</AlertDialogTitle>
            <AlertDialogDescription>
              A transação será excluída e o saldo da reserva será recalculado. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending} />
            <Button variant="destructive" loading={deleteMutation.isPending} onClick={handleDelete}>
              {deleteMutation.isPending ? 'Excluindo' : 'Excluir movimentação'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
