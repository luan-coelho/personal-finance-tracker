'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Edit, MoreHorizontal, Plus, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Reserve } from '@/app/db/schemas/reserve-schema'

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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'

import { useDeleteReserve, useToggleReserveStatus } from '@/hooks/use-reserves'

import { routes } from '@/lib/routes'

interface ReserveCardProps {
  reserve: Reserve
  spaceId: string
}

export function ReserveCard({ reserve, spaceId }: ReserveCardProps) {
  const deleteReserveMutation = useDeleteReserve(spaceId)
  const toggleStatusMutation = useToggleReserveStatus(spaceId)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const currentAmount = parseFloat(reserve.currentAmount)
  const targetAmount = reserve.targetAmount ? parseFloat(reserve.targetAmount) : null
  const progress = targetAmount && targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0

  // Get the icon component dynamically
  const iconName = reserve.icon || 'piggy-bank'
  const IconComponent = (LucideIcons as any)[
    iconName
      .split('-')
      .map((word: string, index: number) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
      .join('')
  ] as React.ComponentType<{ className?: string }> | undefined

  const reserveColor = reserve.color || '#3b82f6'

  async function handleDelete() {
    await deleteReserveMutation.mutateAsync(reserve.id)
    setShowDeleteDialog(false)
  }

  async function handleToggleStatus() {
    await toggleStatusMutation.mutateAsync(reserve.id)
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-3" style={{ borderLeftWidth: '4px', borderLeftColor: reserveColor }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: `${reserveColor}20` }}>
                {IconComponent && (
                  <div style={{ color: reserveColor }}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div>
                <CardTitle className="text-lg">{reserve.name}</CardTitle>
                {reserve.description && <p className="text-muted-foreground mt-1 text-sm">{reserve.description}</p>}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={routes.frontend.admin.reserves.movements(reserve.id)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Movimentação
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={routes.frontend.admin.reserves.edit(reserve.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleStatus}>
                  {reserve.active ? 'Desativar' : 'Ativar'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <div className="space-y-3">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">
                  {currentAmount.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
                {!reserve.active && <Badge variant="secondary">Inativa</Badge>}
              </div>
              {targetAmount && (
                <p className="text-muted-foreground mt-1 text-sm">
                  Meta: {targetAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              )}
            </div>

            {targetAmount && targetAmount > 0 && (
              <div className="space-y-1">
                <Progress value={Math.min(progress, 100)} className="h-2" />
                <p className="text-muted-foreground text-right text-xs">{progress.toFixed(1)}% da meta</p>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="bg-muted/50 pt-3">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href={routes.frontend.admin.reserves.movements(reserve.id)}>Ver Movimentações</Link>
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir a reserva &quot;{reserve.name}&quot;? Esta ação não pode ser desfeita e
              todas as movimentações serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteReserveMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteReserveMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
