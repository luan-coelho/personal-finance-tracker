'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowDownCircle, ArrowUpCircle, Edit, MoreHorizontal, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Transaction, TransactionType } from '@/app/db/schemas'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { useDeleteTransaction } from '@/hooks/use-transactions'

interface TransactionsTableProps {
  transactions: Transaction[]
  onEdit?: (transaction: Transaction) => void
  isLoading?: boolean
}

export function TransactionsTable({ transactions, onEdit, isLoading }: TransactionsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const deleteMutation = useDeleteTransaction()

  const handleDelete = async (transaction: Transaction) => {
    if (confirm(`Tem certeza que deseja excluir a transação "${transaction.description}"?`)) {
      setDeletingId(transaction.id)
      try {
        await deleteMutation.mutateAsync(transaction.id)
      } finally {
        setDeletingId(null)
      }
    }
  }

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value))
  }

  const getTypeColor = (type: TransactionType) => {
    return type === 'entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getTypeIcon = (type: TransactionType) => {
    return type === 'entrada' ? (
      <ArrowDownCircle className="inline h-4 w-4 text-green-600" aria-label="Entrada" />
    ) : (
      <ArrowUpCircle className="inline h-4 w-4 text-red-600" aria-label="Saída" />
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-muted h-16 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-4xl">📊</div>
        <h3 className="mb-2 text-lg font-semibold">Nenhuma transação encontrada</h3>
        <p className="text-muted-foreground">Comece criando sua primeira transação para acompanhar suas finanças.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map(transaction => (
            <TableRow key={transaction.id}>
              <TableCell>
                <Badge className={getTypeColor(transaction.type)}>
                  {getTypeIcon(transaction.type)} {transaction.type === 'entrada' ? 'Entrada' : 'Saída'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="font-medium">{transaction.description}</div>
              </TableCell>
              <TableCell>
                {transaction.category ? (
                  <Badge variant="outline">{transaction.category}</Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {transaction.tags && transaction.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {transaction.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {transaction.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{transaction.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>{format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
              <TableCell className="text-right font-mono">
                <span className={transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'}>
                  {transaction.type === 'entrada' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit?.(transaction)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(transaction)}
                      className="text-destructive"
                      disabled={deletingId === transaction.id}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {deletingId === transaction.id ? 'Excluindo...' : 'Excluir'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
