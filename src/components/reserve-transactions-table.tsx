'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowDownIcon, ArrowUpIcon, MoreHorizontal, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { TransactionWithUser } from '@/app/db/schemas/transaction-schema'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UserAvatarDisplay } from '@/components/user-avatar-display'

import { useDeleteTransaction } from '@/hooks/use-transactions'

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

  const formatCurrency = (value: string) => {
    // Tratar valor absoluto para formatação, o sinal será controlado visualmente
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Math.abs(parseFloat(value)))
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Nenhuma transação registrada</p>
        <p className="text-muted-foreground mt-2 text-sm">Adicione movimentações para acompanhar sua reserva</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Usuário</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-[70px]"></TableHead>
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
                    <UserAvatarDisplay user={transaction.user} size="sm" />
                  </TableCell>
                  <TableCell>
                    {isDeposit ? (
                      <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700">
                        <ArrowUpIcon className="h-3 w-3" />
                        Depósito
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <ArrowDownIcon className="h-3 w-3" />
                        Retirada
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(transaction.date), "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    {transaction.description || <span className="text-muted-foreground">Sem descrição</span>}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <span className={isDeposit ? 'text-green-600' : 'text-red-600'}>
                      {isDeposit ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setTransactionToDelete(transaction.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
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
      </div>

      <AlertDialog open={!!transactionToDelete} onOpenChange={() => setTransactionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A transação será excluída e o saldo da reserva será atualizado
              automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
