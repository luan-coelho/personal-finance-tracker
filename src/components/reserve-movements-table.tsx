'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowDownIcon, ArrowUpIcon, MoreHorizontal, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { ReserveMovementWithReserve } from '@/app/db/schemas/reserve-movement-schema'

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

import { useDeleteReserveMovement } from '@/hooks/use-reserve-movements'

interface ReserveMovementsTableProps {
  movements: ReserveMovementWithReserve[]
  reserveId: string
  spaceId: string
}

export function ReserveMovementsTable({ movements, reserveId, spaceId }: ReserveMovementsTableProps) {
  const [movementToDelete, setMovementToDelete] = useState<string | null>(null)
  const deleteMutation = useDeleteReserveMovement(reserveId, spaceId)

  const handleDelete = async () => {
    if (!movementToDelete) return

    try {
      await deleteMutation.mutateAsync(movementToDelete)
      setMovementToDelete(null)
    } catch (error) {
      console.error('Erro ao excluir movimentação:', error)
    }
  }

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(value))
  }

  if (movements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Nenhuma movimentação registrada</p>
        <p className="text-muted-foreground mt-2 text-sm">Adicione depósitos e retiradas para acompanhar sua reserva</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map(movement => (
              <TableRow key={movement.id}>
                <TableCell>
                  {movement.type === 'deposit' ? (
                    <Badge variant="default" className="gap-1">
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
                  {format(new Date(movement.date), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell>
                  {movement.description || <span className="text-muted-foreground">Sem descrição</span>}
                </TableCell>
                <TableCell className="text-right font-mono">
                  <span className={movement.type === 'deposit' ? 'text-green-600' : 'text-red-600'}>
                    {movement.type === 'deposit' ? '+' : '-'}
                    {formatCurrency(movement.amount)}
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
                      <DropdownMenuItem className="text-red-600" onClick={() => setMovementToDelete(movement.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!movementToDelete} onOpenChange={() => setMovementToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir movimentação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A movimentação será excluída e o saldo da reserva será atualizado
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
